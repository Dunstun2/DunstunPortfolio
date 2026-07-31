'use client';
import { useState, useEffect } from 'react';
import BackToAbout from '@/components/BackToAbout';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AllProjectsPage() {
  const refreshKey = useRealtimeRefresh('settings');
  const [projects, setProjects] = useState<any[]>([]);
  const [heroData, setHeroData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchApi('/projects/published'),
      fetchApi('/hero/published').catch(() => ({ data: null })),
      fetchApi('/settings')
    ])
      .then(([projectsRes, heroRes, settingsRes]) => {
        setProjects(projectsRes.data || []);
        if (heroRes && heroRes.data) setHeroData(heroRes.data);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshKey]);

  // Handle hash scrolling and auto-expanding if navigated with a hash e.g. /projects#project-id
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.replace('#project-', '');
      if (targetId) {
        setExpandedProjectId(targetId);
        setTimeout(() => {
          const el = document.getElementById(`project-${targetId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [projects]);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedProjectId(prev => (prev === id ? null : id));
  };

  const pageTitle = settings?.projects_page_title || 'My Projects';
  const pageSubtitle = settings?.projects_page_subtitle || 'Explore my work, case studies, and technical innovations';
  const ctaTitle = settings?.projects_cta_title || 'Have a Project in Mind?';
  const ctaDescription = settings?.projects_cta_description || 'Let\'s collaborate to bring your ideas to life with innovative solutions';
  const ctaButtonText = settings?.projects_cta_button_text || 'Start a Project';
  const emptyMessage = settings?.projects_empty_message || 'No projects available at this time';

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
      <BackToAbout />
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-heading-light mb-4">
          {pageTitle.split(' ').map((word: string, i: number, arr: string[]) => (
            i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
          ))}
        </h1>
        <p className="text-text-light text-lg max-w-2xl mx-auto">
          {pageSubtitle}
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass p-4 md:p-6 rounded-2xl mb-12 flex flex-row gap-4 md:gap-6 items-center justify-between">
        <div className="relative flex-1 md:w-80 md:flex-none">
          <input
            type="text"
            placeholder="Search projects or tech..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 text-sm text-heading-light focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex-1 md:w-auto md:flex-none">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 text-sm text-heading-light focus:outline-none focus:border-primary font-medium cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-bg-dark text-heading-light">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Stack */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📂</div>
          <p className="text-text-light text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredProjects.map(project => {
            const isExpanded = expandedProjectId === project.id;

            return (
              <div
                id={`project-${project.id}`}
                key={project.id}
                className="glass rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 shadow-xl"
              >
                {/* Project Header / Main Card Block */}
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                  {/* Left: Thumbnail */}
                  {project.thumbnail_url ? (
                    <div className="w-full md:w-80 h-52 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10 shadow-md">
                      <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                      {project.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                          {project.category}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full md:w-80 h-52 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 relative">
                      <span className="text-text-light/50 font-bold">No Cover Image</span>
                      {project.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                          {project.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Right: Meta & Actions */}
                  <div className="flex-1 w-full flex flex-col justify-between h-full">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl md:text-3xl font-extrabold text-heading-light">{project.title}</h2>
                          {project.project_type && (
                            <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-md font-bold">
                              {project.project_type}
                            </span>
                          )}
                        </div>
                        {(project.start_date || project.end_date) && (
                          <span className="text-xs font-semibold text-text-light/70">
                            📅 {project.start_date} {project.end_date ? `— ${project.end_date}` : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-text-light text-base md:text-lg mb-6 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech Pills */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.map((tech: string) => (
                            <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 text-secondary text-xs font-semibold rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expand Case Study Toggle Button */}
                    <div>
                      <button
                        onClick={() => toggleExpand(project.id)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-all text-sm shadow-md"
                      >
                        {isExpanded ? 'Hide Project Details ▲' : 'View Project Details ▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED FULL CASE STUDY SECTION */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/20 p-8 md:p-12 space-y-12 animate-fadeIn">

                    {/* Role & Team Bar */}
                    {(project.my_role || project.team_size || project.responsibilities) && (
                      <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                        {project.my_role && (
                          <div>
                            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">My Role</span>
                            <span className="text-heading-light font-semibold">{project.my_role}</span>
                          </div>
                        )}
                        {project.team_size && (
                          <div>
                            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Team</span>
                            <span className="text-heading-light font-semibold">{project.team_size}</span>
                          </div>
                        )}
                        {project.responsibilities && (
                          <div className="md:col-span-1">
                            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Responsibilities</span>
                            <span className="text-heading-light text-sm">{project.responsibilities}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Problem & Solution */}
                    {(project.problem || project.solution) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {project.problem && (
                          <div className="glass p-6 md:p-8 rounded-2xl border border-red-500/20">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-red-400 mb-2">The Problem</h3>
                            <h4 className="text-xl font-bold text-heading-light mb-3">What Needed Solving</h4>
                            <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">{project.problem}</p>
                          </div>
                        )}
                        {project.solution && (
                          <div className="glass p-6 md:p-8 rounded-2xl border border-green-500/20">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-green-400 mb-2">The Solution</h3>
                            <h4 className="text-xl font-bold text-heading-light mb-3">How I Approached It</h4>
                            <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">{project.solution}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detailed Content / Writeup */}
                    {project.content && (
                      <div className="glass p-6 md:p-8 rounded-2xl">
                        <h3 className="text-xl font-bold text-heading-light mb-4">Detailed Overview</h3>
                        <p className="text-text-light text-base leading-relaxed whitespace-pre-line">{project.content}</p>
                      </div>
                    )}

                    {/* Key Features */}
                    {project.features && project.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-heading-light mb-6">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {project.features.map((feat: any, idx: number) => (
                            <div key={idx} className="glass p-5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </span>
                                <h4 className="text-base font-bold text-heading-light">{feat.name}</h4>
                              </div>
                              <p className="text-text-light text-xs leading-relaxed">{feat.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screenshots Gallery */}
                    {project.screenshots && project.screenshots.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-heading-light mb-6">Screenshots & Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {project.screenshots.map((s: any, idx: number) => (
                            <div key={idx} className="glass rounded-2xl overflow-hidden border border-white/10 group">
                              <div className="h-56 overflow-hidden relative">
                                <img src={s.image_url} alt={s.caption || `Screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              {s.caption && (
                                <div className="p-3 bg-black/40 text-center text-xs text-text-light font-medium">
                                  {s.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenges & Solutions */}
                    {project.challenges && project.challenges.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-heading-light mb-6">Challenges & Solutions</h3>
                        <div className="space-y-4">
                          {project.challenges.map((c: any, idx: number) => (
                            <div key={idx} className="glass p-6 rounded-2xl border border-white/10 space-y-3">
                              <div>
                                <span className="text-xs uppercase text-red-400 font-bold block mb-1">Challenge #{idx + 1}</span>
                                <h4 className="text-base font-bold text-heading-light">{c.challenge}</h4>
                              </div>
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-xs uppercase text-green-400 font-bold block mb-1">Solution</span>
                                <p className="text-text-light text-xs leading-relaxed">{c.solution}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outcomes, Lessons & Future */}
                    {(project.outcomes || project.lessons_learned || project.future_improvements) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {project.outcomes && (
                          <div className="glass p-5 rounded-xl">
                            <h4 className="text-xs uppercase font-bold text-primary mb-2">Outcomes & Impact</h4>
                            <p className="text-text-light text-xs leading-relaxed whitespace-pre-line">{project.outcomes}</p>
                          </div>
                        )}
                        {project.lessons_learned && (
                          <div className="glass p-5 rounded-xl">
                            <h4 className="text-xs uppercase font-bold text-secondary mb-2">Lessons Learned</h4>
                            <p className="text-text-light text-xs leading-relaxed whitespace-pre-line">{project.lessons_learned}</p>
                          </div>
                        )}
                        {project.future_improvements && (
                          <div className="glass p-5 rounded-xl">
                            <h4 className="text-xs uppercase font-bold text-primary mb-2">Future Next Steps</h4>
                            <p className="text-text-light text-xs leading-relaxed whitespace-pre-line">{project.future_improvements}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-right pt-4">
                      <button
                        onClick={() => toggleExpand(project.id)}
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        Collapse Case Study ▲
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}
