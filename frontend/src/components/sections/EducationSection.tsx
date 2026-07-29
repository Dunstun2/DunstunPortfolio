'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getFileUrl } from '@/utils/urls';

export default function EducationSection({ variant = 'full' }: { variant?: 'full' | 'highlights' }) {
  const [education, setEducation] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const refreshKey = useRealtimeRefresh('education');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/education'),
      fetchApi('/settings')
    ])
      .then(([eduRes, settingsRes]) => {
        setEducation(eduRes.data);
        setSettings(settingsRes.data);
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);

  let publishedEdu = education.filter(e => e.status === 'published');

  // Helper to rank degrees (lower number = higher priority)
  const getDegreeRank = (degreeStr: string) => {
    if (!degreeStr) return 99;
    const d = degreeStr.toLowerCase();
    if (d.includes('phd') || d.includes('doctorate') || d.includes('doctor')) return 1;
    if (d.includes('master') || d.includes('msc') || d.includes('m.a') || d.includes('mba') || d.includes('m.s')) return 2;
    if (d.includes('bachelor') || d.includes('bsc') || d.includes('b.a') || d.includes('b.s')) return 3;
    if (d.includes('associate')) return 4;
    if (d.includes('diploma') || d.includes('certificate')) return 5;
    if (d.includes('high school') || d.includes('secondary')) return 6;
    if (d.includes('primary') || d.includes('elementary')) return 7;
    return 8;
  };

  // Sort by Level of Education first, then by Date
  publishedEdu.sort((a, b) => {
    const rankA = getDegreeRank(a.degree);
    const rankB = getDegreeRank(b.degree);

    // 1. Highest level of education comes first
    if (rankA !== rankB) return rankA - rankB;

    // 2. If same level, current studies come first
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;

    // 3. Otherwise, sort by most recent date
    const dateA = new Date(a.end_date || a.start_date).getTime();
    const dateB = new Date(b.end_date || b.start_date).getTime();
    return dateB - dateA;
  });

  if (variant === 'highlights') {
    publishedEdu = publishedEdu.slice(0, 3);
  }

  if (!publishedEdu.length) return null;

  const sectionTitle = settings?.education_section_title || 'Academic Education';
  const pageTitle = settings?.education_page_title || 'Education & Learning';
  const pageSubtitle = settings?.education_page_subtitle || 'My academic background, degrees, and scholarly achievements';

  return (
    <section id="education" className={`px-4 bg-bg-dark/50 text-text-light relative ${variant === 'highlights' ? 'py-12 md:py-16 border-t border-text-light/10' : 'py-8 md:py-12'}`}>
      <div className={variant === 'highlights' ? 'w-full max-w-full mx-auto md:px-4' : 'max-w-4xl mx-auto'}>
        {variant === 'highlights' ? (
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-16 text-center">
            {sectionTitle.split(' ').map((word: string, i: number, arr: string[]) => (
              i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
            ))}
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
          {publishedEdu.map((edu, index) => {
            const startStr = new Date(edu.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            let endStr = '';
            if (edu.is_current && edu.expected_graduation) {
              endStr = 'Expected ' + new Date(edu.expected_graduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } else if (edu.is_current) {
              endStr = 'Present';
            } else {
              endStr = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            return (
              <div key={edu.id} className="relative animate-fade-in-up glass p-6 md:p-8 -mx-4 md:mx-0 rounded-none md:rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30" style={{ animationDelay: `${index * 100}ms` }}>

                {/* Timeline Dot */}
                <div className="hidden md:block absolute -left-[90px] top-10 w-6 h-6 rounded-full bg-bg-dark border-4 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                <div className="mb-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light">
                    {edu.degree && <span className="text-orange-500">{edu.degree}</span>}
                    {edu.degree && edu.field_of_study && ' in '}
                    {edu.field_of_study && <span className="text-primary">{edu.field_of_study}</span>}
                  </h3>
                  <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block w-max">
                    {startStr} – {endStr}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {edu.institution_logo && (
                    <img
                      src={getFileUrl(edu.institution_logo)}
                      alt={`${edu.institution} logo`}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-white/10 p-1.5 border border-text-light/10 flex-shrink-0"
                    />
                  )}
                  <h4 className="text-xl font-semibold text-subheading">
                    {edu.institution}
                    {edu.faculty && <span className="text-muted-light font-normal"> | {edu.faculty}</span>}
                    {edu.department && <span className="text-muted-light font-normal"> | {edu.department}</span>}
                  </h4>
                </div>

                <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-6 pb-2 md:pb-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {edu.gpa && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">GPA: {edu.gpa}</span>}
                  {edu.grade && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">Grade: {edu.grade}</span>}
                  {edu.honors && <span className="text-xs font-mono bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 whitespace-nowrap flex-shrink-0">{edu.honors}</span>}
                  {edu.specialization && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">Spec: {edu.specialization}</span>}
                </div>

                {edu.short_summary && (
                  <p className="text-text-light text-lg mb-4 border-l-4 border-primary pl-4 py-1 italic">
                    {edu.short_summary}
                  </p>
                )}

                {/* Expandable details — always visible in 'full' mode, toggled per-card in 'highlights' */}
                {(variant === 'full' || expandedCards[edu.id]) && (
                  <>
                    {edu.full_description && (
                      <div className="text-text-light text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap">
                        {edu.full_description}
                      </div>
                    )}

                    {edu.research_title && (
                      <div className="mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-text-light/10">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-2">🔬 Research / Thesis</h5>
                        <p className="font-semibold text-primary mb-1">{edu.research_title}</p>
                        {edu.research_supervisor && <p className="text-xs text-muted-light mb-2 border-b border-text-light/10 pb-2 inline-block">Supervisor: {edu.research_supervisor}</p>}
                        {edu.research_description && <p className="text-sm text-text-light mt-1">{edu.research_description}</p>}
                        {edu.research_link && (() => {
                          const href = edu.research_link?.startsWith('http') ? edu.research_link : `https://${edu.research_link}`;
                          return (
                            <a href={href} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded">
                              View Research ↗
                            </a>
                          );
                        })()}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {edu.coursework && edu.coursework.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">📚 Key Coursework</h5>
                          <div className="flex flex-wrap gap-2">
                            {edu.coursework.map((c: string, i: number) => (
                              <span key={i} className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {edu.activities && edu.activities.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🎯 Activities / Involvements</h5>
                          <div className="flex flex-wrap gap-2">
                            {edu.activities.map((a: string, i: number) => (
                              <span key={i} className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {edu.certifications && edu.certifications.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🏆 Related Certifications</h5>
                          <div className="flex flex-wrap gap-2">
                            {edu.certifications.map((c: string, i: number) => (
                              <span key={i} className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">⭐ Academic Achievements</h5>
                        <ul className="space-y-2">
                          {edu.achievements.map((a: string, i: number) => (
                            <li key={i} className="flex gap-3 text-text-light">
                              <span className="text-primary mt-1">★</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {((edu.related_projects && edu.related_projects.length > 0) || (edu.external_links && edu.external_links.length > 0)) && (
                      <div className="pt-6 border-t border-text-light/10 mt-8 space-y-4">
                        {edu.related_projects && edu.related_projects.length > 0 && (
                          <div>
                            <span className="block mb-2 md:inline-block md:mb-0 text-xs font-bold text-text-light/60 uppercase md:mr-3">Related Projects</span>
                            <div className="inline-flex flex-wrap gap-2">
                              {edu.related_projects.map((p: string, i: number) => (
                                <a href="#projects" key={i} className="text-xs text-primary hover:underline bg-primary/5 border border-primary/20 px-2 py-1 rounded transition-colors cursor-pointer">
                                  {p}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {edu.external_links && edu.external_links.length > 0 && (
                          <div className="flex items-center gap-3">
                            <span className="hidden md:inline-block text-xs font-bold text-text-light/60 uppercase">External Links</span>
                            <div className="flex flex-wrap gap-2">
                              {edu.external_links.filter(Boolean).map((link: string, i: number) => {
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
                  </>
                )}

                {/* Load More / Show Less toggle — only in highlights mode */}
                {variant === 'highlights' && (edu.full_description || edu.research_title || (edu.coursework && edu.coursework.length > 0) || (edu.activities && edu.activities.length > 0) || (edu.achievements && edu.achievements.length > 0) || (edu.certifications && edu.certifications.length > 0)) && (
                  <button
                    onClick={() => setExpandedCards(prev => ({ ...prev, [edu.id]: !prev[edu.id] }))}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                  >
                    {expandedCards[edu.id] ? (
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
            <a href="/education" className="btn btn-md btn-secondary">
              View Full Education Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
