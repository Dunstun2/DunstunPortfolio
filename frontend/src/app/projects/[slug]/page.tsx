'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';
import { getOptimizedImageUrl } from '@/utils/urls';

export default function ProjectCaseStudyPage() {
  const { isInlineEditing } = useInlineEdit();
  const refreshKeySettings = useRealtimeRefresh('settings');
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetchApi(`/projects/published/${slug}`).catch(err => {
        // Fallback to fetch by ID if slug lookup fails
        return fetchApi(`/projects`).then(res => {
          const found = res.data?.find((p: any) => p.id === slug || p.slug === slug);
          return { data: found };
        });
      }),
      fetchApi('/settings')
    ])
      .then(([projectRes, settingsRes]) => {
        if (projectRes.data) setProject(projectRes.data);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, refreshKeySettings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-heading-light mb-4">Project Not Found</h1>
        <p className="text-text-light mb-8">The project case study you're looking for does not exist.</p>
        <Link href="/projects" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
          &larr; Back to All Projects
        </Link>
      </div>
    );
  }

  const detailCtaTitle = settings?.projects_detail_cta_title || 'Interested in Similar Work?';
  const detailCtaDescription = settings?.projects_detail_cta_description || 'Let\'s discuss how I can help with your project needs';
  const ctaButtonText = settings?.projects_cta_button_text || 'Start a Project';

  return (
    <div className="min-h-screen pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark pt-8 pb-16 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8 font-semibold">
            &larr; Back to All Projects
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {project.category && (
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
                <InlineResourceText resource="projects" id={project.id} field="category" defaultValue={project.category} />
              </span>
            )}
            {project.project_type && (
              <span className="px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-xs font-bold">
                {project.project_type}
              </span>
            )}
            {(project.start_date || project.end_date) && (
              <span className="text-xs text-text-light/70 ml-auto font-medium">
                📅 {project.start_date} {project.end_date ? `— ${project.end_date}` : ''}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-heading-light mb-6">
            <InlineResourceText resource="projects" id={project.id} field="title" defaultValue={project.title} />
          </h1>

          <p className="text-text-light text-lg md:text-xl leading-relaxed mb-8 max-w-3xl">
            <InlineResourceText resource="projects" id={project.id} field="description" multiline defaultValue={project.description} />
          </p>

          {/* Role Meta Bar */}
          {(project.my_role || project.team_size || project.responsibilities || isInlineEditing) && (
            <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              {(project.my_role || isInlineEditing) && (
                <div>
                  <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">My Role</span>
                  <span className="text-heading-light font-semibold">
                    <InlineResourceText resource="projects" id={project.id} field="my_role" defaultValue={project.my_role || ''} placeholder="My Role" />
                  </span>
                </div>
              )}
              {(project.team_size || isInlineEditing) && (
                <div>
                  <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Team</span>
                  <span className="text-heading-light font-semibold">
                    <InlineResourceText resource="projects" id={project.id} field="team_size" defaultValue={project.team_size || ''} placeholder="Team Size" />
                  </span>
                </div>
              )}
              {(project.responsibilities || isInlineEditing) && (
                <div className="md:col-span-1">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Responsibilities</span>
                  <span className="text-heading-light text-sm">
                    <InlineResourceText resource="projects" id={project.id} field="responsibilities" defaultValue={project.responsibilities || ''} placeholder="Responsibilities" />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cover Image Banner */}
          {(project.thumbnail_url || isInlineEditing) && (
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 mt-8 max-h-[500px] relative min-h-[300px]">
              <InlineResourceImage
                resource="projects"
                id={project.id}
                field="thumbnail_url"
                currentSrc={project.thumbnail_url || ''}
                alt={project.title}
                className="w-full h-full object-cover"
                wrapperClassName="w-full h-full"
                width={1200}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">

        {/* 2. Problem & Solution */}
        {(project.problem || project.solution || isInlineEditing) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(project.problem || isInlineEditing) && (
              <div className="glass p-8 rounded-3xl border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs uppercase font-bold tracking-widest text-red-400 mb-3">The Problem</h3>
                <h2 className="text-2xl font-bold text-heading-light mb-4">What Needed Solving</h2>
                <p className="text-text-light leading-relaxed whitespace-pre-line">
                  <InlineResourceText resource="projects" id={project.id} field="problem" multiline defaultValue={project.problem || ''} placeholder="Describe the problem..." />
                </p>
              </div>
            )}
            {(project.solution || isInlineEditing) && (
              <div className="glass p-8 rounded-3xl border border-green-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs uppercase font-bold tracking-widest text-green-400 mb-3">The Solution</h3>
                <h2 className="text-2xl font-bold text-heading-light mb-4">How I Approached It</h2>
                <p className="text-text-light leading-relaxed whitespace-pre-line">
                  <InlineResourceText resource="projects" id={project.id} field="solution" multiline defaultValue={project.solution || ''} placeholder="Describe the solution..." />
                </p>
              </div>
            )}
          </section>
        )}

        {/* 3. Detailed Description / Overview */}
        {(project.content || isInlineEditing) && (
          <section className="glass p-8 md:p-12 rounded-3xl">
            <h2 className="text-2xl font-bold text-heading-light mb-6">Detailed Overview</h2>
            <div className="text-text-light leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none text-lg">
              <InlineResourceText resource="projects" id={project.id} field="content" multiline defaultValue={project.content || ''} placeholder="Write case study details..." />
            </div>
          </section>
        )}

        {/* 4. Technologies Used */}
        {(project.technologies || isInlineEditing) && (
          <section>
            <h2 className="text-2xl font-bold text-heading-light mb-6">Technologies & Tools</h2>
            <div className="flex flex-wrap gap-3">
              <InlineEditableList
                resource="projects"
                id={project.id}
                field="technologies"
                items={project.technologies || []}
                placeholder="Add technology"
                renderItem={(tech) => (
                  <span className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-xl font-semibold text-sm">
                    {tech}
                  </span>
                )}
              />
            </div>
          </section>
        )}

        {/* 5. Key Features */}
        {project.features && project.features.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.features.map((feat: any, idx: number) => (
                <div key={idx} className="glass p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-heading-light">{feat.name}</h3>
                  </div>
                  <p className="text-text-light text-sm leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Screenshots & Media Gallery */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-8">Screenshots & Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.screenshots.map((s: any, idx: number) => (
                <div key={idx} className="glass rounded-2xl overflow-hidden border border-white/10 group">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={getOptimizedImageUrl(s.image_url, { width: 800, height: 500 })}
                      alt={s.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {s.caption && (
                    <div className="p-4 bg-black/40 text-center text-xs text-text-light font-medium">
                      {s.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Challenges & Solutions */}
        {project.challenges && project.challenges.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-8">Challenges & Solutions</h2>
            <div className="space-y-6">
              {project.challenges.map((c: any, idx: number) => (
                <div key={idx} className="glass p-8 rounded-3xl border border-white/10 space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-red-400 font-bold block mb-1">Challenge #{idx + 1}</span>
                    <h3 className="text-lg font-bold text-heading-light">{c.challenge}</h3>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-xs uppercase tracking-wider text-green-400 font-bold block mb-1">Solution</span>
                    <p className="text-text-light text-sm leading-relaxed">{c.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Results, Lessons & Future */}
        {(project.outcomes || project.lessons_learned || project.future_improvements) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.outcomes && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-sm uppercase font-bold text-primary mb-3">Outcomes & Impact</h3>
                <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">{project.outcomes}</p>
              </div>
            )}
            {project.lessons_learned && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-sm uppercase font-bold text-secondary mb-3">Lessons Learned</h3>
                <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">{project.lessons_learned}</p>
              </div>
            )}
            {project.future_improvements && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-sm uppercase font-bold text-primary mb-3">Future Next Steps</h3>
                <p className="text-text-light text-sm leading-relaxed whitespace-pre-line">{project.future_improvements}</p>
              </div>
            )}
          </section>
        )}

        {/* CTA Section - Interested in Similar Work? */}
        <section className="glass rounded-3xl p-8 md:p-12 text-center border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-heading-light mb-4">
              {detailCtaTitle.split(' ').map((word: string, i: number, arr: string[]) => (
                i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
              ))}
            </h2>
            <p className="text-text-light text-lg mb-8">
              {detailCtaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-1 whitespace-nowrap"
              >
                {ctaButtonText} &rarr;
              </Link>
              <Link 
                href="/projects" 
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all hover:-translate-y-1 gap-2 whitespace-nowrap"
              >
                &larr; Explore More Projects
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
