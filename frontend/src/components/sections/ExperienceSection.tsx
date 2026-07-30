'use client';
import SectionTitle from '@/components/SectionTitle';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getFileUrl } from '@/utils/urls';

export default function ExperienceSection({ variant = 'full' }: { variant?: 'full' | 'highlights' }) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('experience');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/experience'),
      fetchApi('/settings')
    ])
      .then(([expRes, settingsRes]) => {
        setExperiences(expRes.data);
        setSettings(settingsRes.data);
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);


  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  let publishedExp = experiences.filter(e => e.status === 'published');

  // Sort: current roles first, then by most recent date
  publishedExp.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    const dateA = new Date(a.end_date || a.start_date).getTime();
    const dateB = new Date(b.end_date || b.start_date).getTime();
    return dateB - dateA;
  });



  if (!publishedExp.length) return null;

  // Helper to calculate duration (e.g. "6 months", "2 years")
  const calculateDuration = (start: string, end: string, isCurrent: boolean) => {
    const startDate = new Date(start);
    const endDate = isCurrent ? new Date() : new Date(end);
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    months = months <= 0 ? 1 : months;

    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} yr ${remainingMonths} mo`;
  };

  const sectionTitle = settings?.experience_section_title || 'Work Experience';
  const pageTitle = settings?.experience_page_title || 'Professional Journey';
  const pageSubtitle = settings?.experience_page_subtitle || 'My career journey, roles, and professional achievements';

  return (
    <section id="experience" className={`px-4 bg-bg-dark text-text-light relative ${variant === 'highlights' ? 'py-12 md:py-16' : 'py-8 md:py-12 pb-16 md:pb-24'}`}>
      <div className={variant === 'highlights' ? 'w-full max-w-full mx-auto md:px-4' : 'max-w-4xl mx-auto'}>
        {variant === 'highlights' ? (
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-16 text-center">
            <SectionTitle title={sectionTitle} />
          </h2>
        ) : (
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
        )}

        <div className="relative md:border-l-2 md:border-text-light/15 md:ml-8 md:pl-12 space-y-16">
          {publishedExp.map((exp, index) => {
            const startStr = new Date(exp.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const endStr = exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const duration = calculateDuration(exp.start_date, exp.end_date, exp.is_current);

            return (
              <div key={exp.id} className="relative animate-fade-in-up glass p-6 md:p-8 -mx-4 md:mx-0 rounded-none md:rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30" style={{ animationDelay: `${index * 100}ms` }}>

                {/* Timeline Dot */}
                <div className="hidden md:block absolute -left-[90px] top-10 w-6 h-6 rounded-full bg-bg-dark border-4 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                <div className="mb-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold"><span className="text-orange-500">{exp.position}</span></h3>
                  <div className="text-xs md:text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block w-max">
                    {startStr} – {endStr} · {duration}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {exp.company_logo && (
                    <img
                      src={getFileUrl(exp.company_logo)}
                      alt={`${exp.company} logo`}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-white/10 p-1.5 border border-text-light/10 flex-shrink-0"
                    />
                  )}
                  <h4 className="text-xl font-semibold text-subheading flex items-center gap-2 flex-wrap">
                    <span className="text-primary">{exp.company}</span>
                    {exp.company_website && (() => {
                      const href = exp.company_website?.startsWith('http') ? exp.company_website : `https://${exp.company_website}`;
                      return (
                        <a href={href} target="_blank" rel="noreferrer" className="text-xs font-normal text-primary hover:underline bg-primary/10 px-2 py-1 rounded ml-2">
                          Website ↗
                        </a>
                      );
                    })()}
                    {exp.location && <span className="text-muted-light font-normal text-base ml-auto">· {exp.location}</span>}
                  </h4>
                </div>

                <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-6 pb-2 md:pb-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {exp.employment_type && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.employment_type}</span>}
                  {exp.work_mode && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.work_mode}</span>}
                  {exp.department && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.department}</span>}
                  {exp.industry && <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 whitespace-nowrap flex-shrink-0">{exp.industry}</span>}
                </div>

                {exp.short_summary && (
                  <p className="text-text-light text-lg mb-4 border-l-4 border-primary pl-4 py-1 italic">
                    {exp.short_summary}
                  </p>
                )}

                {(variant === 'full' || expandedCards[exp.id]) && exp.full_description && (
                  <div className="text-text-light text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap">
                    {exp.full_description}
                  </div>
                )}

                {(variant === 'full' || expandedCards[exp.id]) && exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">📋 Key Responsibilities</h5>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((r: string, i: number) => (
                        <li key={i} className="flex gap-3 text-text-light">
                          <span className="text-primary mt-1">▹</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(variant === 'full' || expandedCards[exp.id]) && exp.key_contributions && exp.key_contributions.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🚀 Key Contributions</h5>
                    <ul className="space-y-2">
                      {exp.key_contributions.map((c: string, i: number) => (
                        <li key={i} className="flex gap-3 text-text-light">
                          <span className="text-secondary mt-1">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(variant === 'full' || expandedCards[exp.id]) && exp.achievements && exp.achievements.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">⭐ Key Achievements</h5>
                    <ul className="space-y-2">
                      {exp.achievements.map((a: string, i: number) => (
                        <li key={i} className="flex gap-3 text-text-light">
                          <span className="text-primary mt-1">★</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Relational Links */}
                {(variant === 'full' || expandedCards[exp.id]) && ((exp.associated_skills && exp.associated_skills.length > 0) ||
                  (exp.related_projects && exp.related_projects.length > 0) ||
                  (exp.external_links && exp.external_links.length > 0)) && (
                    <div className="pt-6 border-t border-text-light/10 mt-8 space-y-4">
                      {exp.associated_skills && exp.associated_skills.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-muted-light uppercase mr-3">🛠️ Skills Used</span>
                          <div className="inline-flex flex-wrap gap-2">
                            {exp.associated_skills.map((s: string, i: number) => (
                              <span key={i} className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {exp.related_projects && exp.related_projects.length > 0 && (
                        <div>
                          <span className="block mb-2 md:inline-block md:mb-0 text-xs font-bold text-muted-light uppercase md:mr-3">Related Projects</span>
                          <div className="inline-flex flex-wrap gap-2">
                            {exp.related_projects.map((p: string, i: number) => (
                              <a href="#projects" key={i} className="text-xs text-primary hover:underline bg-primary/5 border border-primary/20 px-2 py-1 rounded transition-colors cursor-pointer">
                                {p}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {exp.external_links && exp.external_links.length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="hidden md:inline-block text-xs font-bold text-muted-light uppercase">External Links</span>
                          <div className="flex flex-wrap gap-2">
                            {exp.external_links.filter(Boolean).map((link: string, i: number) => {
                              let label = link.replace(/^https?:\/\/(www\.)?/, '');
                              if (label.length > 30) label = label.substring(0, 30) + '...';
                              const href = link.startsWith('http') ? link : `https://${link}`;
                              return (
                                <a href={href} target="_blank" rel="noreferrer" key={i} className="flex items-center gap-2 text-xs text-primary hover:bg-primary/10 bg-primary/5 border border-primary/20 px-2.5 py-1.5 md:px-2 md:py-1 rounded transition-colors cursor-pointer" title={href}>
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                  <span className="hidden md:inline">{label}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Load More / Show Less toggle — only in highlights mode */}
                {variant === 'highlights' && (exp.full_description || (exp.responsibilities && exp.responsibilities.length > 0) || (exp.key_contributions && exp.key_contributions.length > 0) || (exp.achievements && exp.achievements.length > 0) || (exp.associated_skills && exp.associated_skills.length > 0) || (exp.related_projects && exp.related_projects.length > 0) || (exp.external_links && exp.external_links.length > 0)) && (
                  <button
                    onClick={() => setExpandedCards(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                  >
                    {expandedCards[exp.id] ? (
                      <>
                        Show Less
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </>
                    ) : (
                      <>
                        Load More
                        <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </>
                    )}
                  </button>
                )}

              </div>
            );
          })}
        </div>

        {variant === 'highlights' && (
          <div className="mt-16 text-center">
            <a href="/experience" className="btn btn-md btn-secondary">
              View Full Experience Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
