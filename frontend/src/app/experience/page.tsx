'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getFileUrl } from '@/utils/urls';
import Link from 'next/link';

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const refreshKey = useRealtimeRefresh('experience');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/experience'),
      fetchApi('/settings')
    ])
      .then(([expRes, settingsRes]) => {
        setExperiences(expRes.data || []);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, refreshKeySettings]);

  let publishedExp = experiences.filter(e => e.status === 'published');

  // Sort: current roles first, then by most recent date
  publishedExp.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    const dateA = new Date(a.end_date || a.start_date).getTime();
    const dateB = new Date(b.end_date || b.start_date).getTime();
    return dateB - dateA;
  });

  // Filter options
  const employmentTypes = ['All', ...Array.from(new Set(publishedExp.map(e => e.employment_type).filter(Boolean)))];

  // Apply filter
  const filteredExp = filterType === 'All'
    ? publishedExp
    : publishedExp.filter(e => e.employment_type === filterType);

  // Helper to calculate duration
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

  const pageTitle = settings?.experience_page_title || 'Professional Journey';
  const pageSubtitle = settings?.experience_page_subtitle || 'My career journey, roles, and professional achievements';
  const ctaTitle = settings?.experience_cta_title || 'Let\'s Work Together';
  const ctaDescription = settings?.experience_cta_description || 'Bring my experience and expertise to your next project';
  const ctaButtonText = settings?.experience_cta_button_text || 'Get in Touch';
  const emptyMessage = settings?.experience_empty_message || 'Experience information coming soon';

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-5xl mx-auto">
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

        {/* Filter */}
        {employmentTypes.length > 1 && (
          <div className="glass p-6 rounded-2xl mb-12 flex flex-wrap gap-3 justify-center">
            {employmentTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${filterType === type
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-black/10 dark:bg-white/5 text-text-light hover:bg-primary/20 border border-white/10'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Experience Timeline */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredExp.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-text-light text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="relative md:border-l-2 md:border-text-light/15 md:ml-8 md:pl-12 space-y-16 mb-20">
            {filteredExp.map((exp, index) => {
              const startStr = new Date(exp.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const endStr = exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const duration = calculateDuration(exp.start_date, exp.end_date, exp.is_current);

              return (
                <div key={exp.id} className="relative glass p-8 rounded-3xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30">
                  {/* Timeline Dot */}
                  <div className="hidden md:block absolute -left-[90px] top-10 w-6 h-6 rounded-full bg-bg-dark border-4 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                  {/* Current Badge */}
                  {exp.is_current && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                      Currently Working
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-heading-light mb-2">{exp.position}</h3>
                    <div className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 inline-block">
                      {startStr} – {endStr} · {duration}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-4 mb-6">
                    {exp.company_logo && (
                      <img
                        src={getFileUrl(exp.company_logo)}
                        alt={`${exp.company} logo`}
                        className="w-16 h-16 rounded-xl object-contain bg-white/10 p-2 border border-text-light/10"
                      />
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-primary flex items-center gap-3 flex-wrap">
                        {exp.company}
                        {exp.company_website && (
                          <a
                            href={exp.company_website.startsWith('http') ? exp.company_website : `https://${exp.company_website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-normal text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full"
                          >
                            Website ↗
                          </a>
                        )}
                      </h4>
                      {exp.location && <p className="text-text-light/70 text-sm mt-1">📍 {exp.location}</p>}
                    </div>
                  </div>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {exp.employment_type && (
                      <span className="text-xs font-semibold bg-secondary/10 text-secondary px-3 py-1 rounded-lg border border-secondary/30">
                        {exp.employment_type}
                      </span>
                    )}
                    {exp.work_mode && (
                      <span className="text-xs font-semibold bg-black/10 dark:bg-white/5 text-text-light px-3 py-1 rounded-lg border border-white/10">
                        {exp.work_mode}
                      </span>
                    )}
                    {exp.department && (
                      <span className="text-xs font-semibold bg-black/10 dark:bg-white/5 text-text-light px-3 py-1 rounded-lg border border-white/10">
                        {exp.department}
                      </span>
                    )}
                    {exp.industry && (
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/20">
                        {exp.industry}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {exp.short_summary && (
                    <p className="text-text-light text-lg mb-6 border-l-4 border-primary pl-4 py-1 italic">
                      {exp.short_summary}
                    </p>
                  )}

                  {/* Full Description */}
                  {exp.full_description && (
                    <div className="text-text-light leading-relaxed mb-6 whitespace-pre-wrap">
                      {exp.full_description}
                    </div>
                  )}

                  {/* Responsibilities */}
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <div className="mb-6 glass p-6 rounded-2xl bg-black/20">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                        <span>📋</span> Key Responsibilities
                      </h5>
                      <ul className="space-y-2">
                        {exp.responsibilities.map((r: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-light text-sm">
                            <span className="text-primary mt-1">▹</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Contributions */}
                  {exp.key_contributions && exp.key_contributions.length > 0 && (
                    <div className="mb-6 glass p-6 rounded-2xl bg-black/20">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4 flex items-center gap-2">
                        <span>🚀</span> Key Contributions
                      </h5>
                      <ul className="space-y-2">
                        {exp.key_contributions.map((c: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-light text-sm">
                            <span className="text-secondary mt-1">✓</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Achievements */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mb-6 glass p-6 rounded-2xl bg-black/20">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                        <span>⭐</span> Key Achievements
                      </h5>
                      <ul className="space-y-2">
                        {exp.achievements.map((a: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-light text-sm">
                            <span className="text-primary mt-1">★</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Associated Skills & Links */}
                  {((exp.associated_skills && exp.associated_skills.length > 0) ||
                    (exp.related_projects && exp.related_projects.length > 0) ||
                    (exp.external_links && exp.external_links.length > 0)) && (
                      <div className="pt-6 border-t border-white/10 space-y-4">
                        {exp.associated_skills && exp.associated_skills.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-text-light/70 uppercase block mb-2">🛠️ Skills Used</span>
                            <div className="flex flex-wrap gap-2">
                              {exp.associated_skills.map((s: string, i: number) => (
                                <span key={i} className="text-xs bg-black/20 border border-white/10 text-text-light px-3 py-1 rounded-lg">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {exp.related_projects && exp.related_projects.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-text-light/70 uppercase block mb-2">Related Projects</span>
                            <div className="flex flex-wrap gap-2">
                              {exp.related_projects.map((p: string, i: number) => (
                                <Link href="/projects" key={i} className="text-xs text-primary hover:underline bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                                  {p}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {exp.external_links && exp.external_links.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-text-light/70 uppercase block mb-2">External Links</span>
                            <div className="flex flex-wrap gap-2">
                              {exp.external_links.map((link: string, i: number) => {
                                if (!link) return null;
                                const href = link.startsWith('http') ? link : `https://${link}`;
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={i}
                                    className="text-xs text-primary hover:bg-primary/20 bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                    Link
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        {filteredExp.length > 0 && (
          <div className="glass rounded-3xl p-8 md:p-12 text-center border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-heading-light mb-4">
                {ctaTitle.split(' ').map((word: string, i: number, arr: string[]) => (
                  i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
                ))}
              </h2>
              <p className="text-text-light text-lg mb-8">
                {ctaDescription}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-1"
              >
                {ctaButtonText} &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
