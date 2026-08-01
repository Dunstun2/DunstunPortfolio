'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

const ColoredTitle = ({ title }: { title: string }) => {
  const words = title.trim().split(/\s+/);
  if (words.length === 2) {
    return (
      <>
        <span className="text-secondary">{words[0]}</span> <span className="text-primary">{words[1]}</span>
      </>
    );
  } else if (words.length > 2) {
    return (
      <>
        <span className="text-secondary">{words[0]}</span>{' '}
        <span className="text-primary">{words[1]}</span>{' '}
        <span className="text-heading-light">{words.slice(2).join(' ')}</span>
      </>
    );
  }
  return <span className="text-primary">{title}</span>;
};

export default function AboutPage() {
  const [about, setAbout] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandIntro, setExpandIntro] = useState(false);
  const [expandSummary, setExpandSummary] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchApi('/about/published')
        .then(res => setAbout(res.data))
        .catch(err => {
          console.warn('No published about section found:', err);
          setAbout(null);
        }),
      fetchApi('/skills')
        .then(res => setSkills(res.data || []))
        .catch(err => {
          console.warn('Could not fetch skills:', err);
        }),
      fetchApi('/achievements?limit=4')
        .then(res => setAchievements(res.data || []))
        .catch(err => {
          console.warn('Could not fetch achievements:', err);
        }),
      fetchApi('/sections/available')
        .then(res => setAvailableSections(res.data))
        .catch(() => {
          // fallback
          setAvailableSections({
            experience: true, education: true, projects: true,
            services: true, events: true, testimonials: true
          });
        })
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!about) {
    return null;
  }

  const validHighlights = about.highlights?.filter((h: any) => h.title) || [];
  const validExplorations = about.explorations?.filter((e: any) => e.title && e.category) || [];
  const validValues = about.values?.filter((v: any) => v.title) || [];
  
  let validInterests: string[] = [];
  try {
    validInterests = typeof about.interests === 'string' ? JSON.parse(about.interests) : about.interests;
  } catch (e) { }
  if (!Array.isArray(validInterests)) validInterests = [];

  let validStatistics: {label: string, value: string}[] = [];
  try {
    validStatistics = typeof about.statistics === 'string' ? JSON.parse(about.statistics) : about.statistics;
  } catch (e) { }
  if (!Array.isArray(validStatistics)) validStatistics = [];

  // Group skills by category for display
  const groupedSkills: Record<string, any[]> = skills.reduce((acc: Record<string, any[]>, skill: any) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});
  
  // Show all skill categories on the About page
  const skillCategories = Object.keys(groupedSkills);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] pb-8">

      {/* 1. Hero Section */}
      <section className="relative z-20 w-full pt-8 md:pt-12 pb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`relative ${expandIntro ? "" : "overflow-hidden max-h-[32rem] md:max-h-[28rem]"}`}>
            {about.image_url && (
              <div className="relative group float-none md:float-left md:mr-14 mb-8 flex justify-center md:block">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.3)]">
                    <img src={about.image_url} alt={about.title || "Profile"} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            )}
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-heading-light mb-4 tracking-tight leading-tight mt-2">
                <span className="text-primary">{about.title}</span>
              </h1>
              {about.professional_title && (
                <h2 className="text-lg md:text-2xl text-secondary font-medium mb-6">
                  {about.professional_title}
                </h2>
              )}
              {about.personal_introduction && (
                <div className="mt-2">
                  <p className="text-text-light text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {about.personal_introduction}
                  </p>
                </div>
              )}
            </div>
            <div className="clear-both"></div>
            {!expandIntro && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgb(var(--color-bg-dark-rgb))] to-transparent pointer-events-none"></div>
            )}
          </div>
          
          {about.personal_introduction && (
            <button
              onClick={() => setExpandIntro(!expandIntro)}
              className="mt-4 text-primary font-semibold text-sm hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              {expandIntro ? 'Read Less ↑' : 'Read More ↓'}
            </button>
          )}
        </div>
      </section>

      {/* 3. Professional Summary */}
      {about.professional_summary && (
        <section className="pt-4 pb-8 md:pb-12 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="glass p-5 md:p-12 rounded-none sm:rounded-3xl border-t-4 border-t-secondary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl font-bold mb-8 relative z-10"><ColoredTitle title="Professional Summary" /></h2>
            
            <div className="relative z-10">
              <div className={`relative ${expandSummary ? "" : "overflow-hidden max-h-[18rem] md:max-h-[16rem]"}`}>
                <p className="text-text-light text-lg leading-relaxed whitespace-pre-line">
                  {about.professional_summary}
                </p>

                {!expandSummary && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgb(var(--color-bg-dark-rgb))] to-transparent pointer-events-none"></div>
                )}
              </div>
              <button
                onClick={() => setExpandSummary(!expandSummary)}
                className="mt-6 text-secondary font-semibold text-sm hover:text-secondary/80 transition-colors inline-flex items-center gap-1"
              >
                {expandSummary ? 'Read Less ↑' : 'Read More ↓'}
              </button>
            </div>
          </div>
        </section>
      )}



      {/* 4. Mission & Vision */}
      {(about.mission_statement || (about as any).vision_statement) && (
        <section className="pb-8 md:pb-12 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="glass p-5 md:p-12 rounded-none sm:rounded-3xl border-t-4 border-t-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex flex-col gap-6 text-left">
              {(about as any).vision_statement && (
                <div className="flex-1 border-l-4 border-secondary pl-6 md:pl-8">
                  <h2 className="text-sm tracking-widest uppercase font-bold mb-4"><ColoredTitle title="Vision Statement" /></h2>
                  <p className="text-xl md:text-2xl text-heading-light font-medium leading-relaxed">
                    {(about as any).vision_statement}
                  </p>
                </div>
              )}
              {about.mission_statement && (
                <div className="flex-1 border-l-4 border-primary pl-6 md:pl-8">
                  <h2 className="text-sm tracking-widest uppercase font-bold mb-4"><ColoredTitle title="Mission Statement" /></h2>
                  <p className="text-xl md:text-2xl text-heading-light font-medium leading-relaxed">
                    {about.mission_statement}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. Core Values */}
      {validValues.length > 0 && (
        <section className="py-8 md:py-12 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full">
          <h2 className="text-3xl font-bold mb-6 md:mb-8 text-center"><ColoredTitle title="My Values" /></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {validValues.map((val: any) => (
              <div key={val.id} className="glass p-5 md:p-8 rounded-none sm:rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
                <h3 className="text-xl font-bold text-heading-light mb-4">{val.title}</h3>
                <p className="text-text-light leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Skills Overview */}
      {skillCategories.length > 0 && (
        <section className="py-8 md:py-12 bg-black/5 dark:bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6 md:mb-8 text-center"><ColoredTitle title="Skills & Expertise" /></h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {skillCategories.map((category, idx) => {
                const skillsArray = groupedSkills[category] || [];
                return (
                  <div key={`${category}-${idx}`} className="glass p-5 md:p-8 rounded-none sm:rounded-3xl border border-white/10 text-left">
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                      <h3 className="text-2xl font-bold text-heading-light">{category}</h3>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        {skillsArray.length} {skillsArray.length === 1 ? 'Skill' : 'Skills'}
                      </span>
                    </div>

                    {/* Skills List */}
                    <div className="space-y-6">
                      {skillsArray.map((skill: any) => (
                        <div key={skill.id} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              {skill.icon_url && (
                                <div className="w-8 h-8 flex-shrink-0">
                                  <img
                                    src={skill.icon_url}
                                    alt={skill.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <span className="text-text-light font-semibold text-base group-hover:text-primary transition-colors">
                                {skill.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {skill.proficiency}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-black/20 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-700 group-hover:shadow-lg"
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>

                          {/* Description (if available) */}
                          {skill.description && (
                            <p className="text-xs text-text-light/70 mt-2 leading-relaxed">
                              {skill.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Timeline & Exploring */}
      {(validHighlights.length > 0 || validExplorations.length > 0) && (
        <section className="py-8 md:py-12 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Key Milestones */}
            {validHighlights.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6 md:mb-8"><ColoredTitle title="Key Milestones" /></h2>
                <div className="relative border-l-2 border-primary/30 ml-4 md:ml-8 space-y-12">
                  {validHighlights.map((item: any) => (
                    <div key={item.id} className="relative pl-8 md:pl-12">
                      <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary ring-4 ring-bg-light dark:ring-bg-dark"></div>
                      <div className="flex flex-wrap items-baseline gap-x-3 mb-2">
                        <span className="text-primary font-bold tracking-widest text-sm">{item.date}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-heading-light">{item.title}</h3>
                      </div>
                      <p className="text-text-light text-lg">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Currently Exploring */}
            {validExplorations.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6 md:mb-8"><ColoredTitle title="Currently Exploring" /></h2>
                <div className="flex flex-col gap-6">
                  {validExplorations.map((exp: any) => (
                    <div key={exp.id} className="glass px-6 py-5 rounded-none sm:rounded-2xl flex flex-col gap-2 hover:border-primary/50 transition-colors w-full">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{exp.category}</span>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-heading-light font-medium text-lg flex-1">{exp.title}</span>
                        {exp.link_url && (
                          <a href={exp.link_url?.startsWith('http') ? exp.link_url : `https://${exp.link_url}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary/80 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* 8. Awards & Interests */}
      {(achievements.length > 0 || validInterests.length > 0) && (
        <section className="py-8 md:py-12 bg-black/5 dark:bg-white/5 border-y border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Awards */}
              {achievements.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 md:mb-8"><ColoredTitle title="Awards & Recognition" /></h2>
                  <div className="flex flex-col gap-4">
                    {achievements.map((ach: any) => (
                      <div key={ach.id} className="glass p-5 rounded-xl border-l-4 border-l-secondary">
                        <h3 className="font-bold text-heading-light">{ach.title}</h3>
                        {ach.issuer && <p className="text-text-light text-sm mt-1">{ach.issuer}</p>}
                      </div>
                    ))}
                  </div>
                  <Link href="/achievements" className="text-primary hover:text-primary/80 font-bold text-sm inline-block mt-6">
                    View All Achievements →
                  </Link>
                </div>
              )}

              {/* Interests */}
              {validInterests.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 md:mb-8"><ColoredTitle title="Personal Interests" /></h2>
                  <div className="flex flex-wrap gap-3">
                    {validInterests.map((interest, i) => (
                      <span key={i} className="px-4 py-2 glass rounded-full text-heading-light font-medium border border-white/5">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 9. Statistics */}
      {validStatistics.length > 0 && (
        <section className="py-8 md:py-12 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full">
          <h2 className="text-3xl font-bold mb-6 md:mb-8 text-center"><ColoredTitle title="Impact in Numbers" /></h2>
          
          {/* Mobile: single card with rows */}
          <div className="block md:hidden glass p-5 rounded-none sm:rounded-3xl divide-y divide-white/10">
            {validStatistics.map((stat, i) => (
              <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <span className="text-text-light font-medium uppercase tracking-wider text-sm">{stat.label}</span>
                <span className="text-3xl font-bold text-primary">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Desktop: grid cards */}
          <div className="hidden md:grid grid-cols-4 gap-6 text-center">
            {validStatistics.map((stat, i) => (
              <div key={i} className="glass p-8 rounded-3xl flex flex-col items-center justify-center border-t-2 border-t-primary hover:-translate-y-2 transition-transform">
                <span className="text-5xl font-bold text-primary mb-2">{stat.value}</span>
                <span className="text-text-light font-medium uppercase tracking-wider text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9.5 Quick Links */}
      <section id="explore-more" className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold mb-6 md:mb-8 text-center"><ColoredTitle title="Explore More" /></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { title: 'Experience', path: '/experience?from=about', icon: '💼', key: 'experience' },
            { title: 'Education', path: '/education?from=about', icon: '🎓', key: 'education' },
            { title: 'Projects', path: '/projects?from=about', icon: '🚀', key: 'projects' },
            { title: 'Services', path: '/services?from=about', icon: '⚡', key: 'services' },
            { title: 'Events', path: '/events?from=about', icon: '📅', key: 'events' },
            { title: 'Testimonials', path: '/testimonials?from=about', icon: '💬', key: 'testimonials' },
          ].filter(link => !availableSections || availableSections[link.key]).map((link, i) => (
            <Link
              key={i}
              href={link.path}
              className="glass p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)] transition-all duration-300 group border border-white/5 hover:border-primary/30"
            >
              <span className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
              <span className="font-bold text-heading-light text-sm md:text-base group-hover:text-primary transition-colors">{link.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-8 md:py-12 max-w-5xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 w-full text-center">
        <div className="glass p-5 md:p-12 rounded-none sm:rounded-[3rem] relative overflow-hidden border border-primary/20 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-screen pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl mix-blend-screen pointer-events-none group-hover:bg-secondary/20 transition-colors duration-700"></div>
          
          <div className="relative z-10">
            <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1 hover:scale-105 border border-primary/50">
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
