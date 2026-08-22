'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getFileUrl } from '@/utils/urls';
import { useSearchParams } from 'next/navigation';
import { InnerSortableLayout } from '@/templateEngine/components/InnerSortableLayout';
import Link from '@/components/PreviewLink';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';

export default function ExperienceSection({ variant = 'full' }: { variant?: 'full' | 'highlights' }) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('experience');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');
  const [cardOrder, setCardOrder] = useState<string[]>(['header', 'tags', 'description', 'responsibilities', 'contributions', 'achievements', 'links']);

  useEffect(() => {
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.experience_card;
    if (configOrder && configOrder.length > 0) {
      setCardOrder(configOrder);
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_experience_card'] = cardOrder;
    }
  }, [cardOrder, isPreview]);

  useEffect(() => {
    Promise.all([
      fetchApi('/experience'),
      fetchApi('/settings')
    ])
      .then(([expRes, settingsRes]) => {
        setExperiences(expRes.data || []);
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

  const sectionTitle = settings?.experience_section_title || 'Professional Journey';
  const pageTitle = settings?.experience_page_title || 'Professional Journey';
  const pageSubtitle = settings?.experience_page_subtitle || 'My career journey, roles, and professional achievements';

  return (
    <section id="experience" className={`px-4 bg-bg-dark text-text-light relative ${variant === 'highlights' ? 'py-4 md:py-8' : 'py-8 md:py-12 pb-16 md:pb-24'}`}>
      <div className={variant === 'highlights' ? 'w-full max-w-full mx-auto md:px-4' : 'max-w-4xl mx-auto'}>
        {variant === 'highlights' ? (
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-10 text-center">
            <ColoredTitle settingKey="experience_section_title" title={sectionTitle} />
          </h2>
        ) : (
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-heading-light mb-4">
              <InlineText settingKey="experience_page_title" defaultValue="Professional Journey">
                {pageTitle}
              </InlineText>
            </h1>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              <InlineText settingKey="experience_page_subtitle" defaultValue="My career journey, roles, and professional achievements">
                {pageSubtitle}
              </InlineText>
            </p>
          </div>
        )}

        {publishedExp.length > 0 ? (
          (() => {
            const expIds = publishedExp.map(e => e.id);

            const handleReorder = (newIds: string[]) => {
              const newExp = newIds.map(id => publishedExp.find(e => e.id === id)!).filter(Boolean);
              setExperiences(newExp);

              window.__PREVIEW_DATA_REORDER__ = window.__PREVIEW_DATA_REORDER__ || {};
              window.__PREVIEW_DATA_REORDER__['experience'] = newIds;
            };

            const renderExp = (id: string) => {
              const exp = publishedExp.find(e => e.id === id);
              if (!exp) return null;
              const index = publishedExp.findIndex(e => e.id === id);
              const startStr = new Date(exp.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const endStr = exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const duration = calculateDuration(exp.start_date, exp.end_date, exp.is_current);

              const renderCardItem = (itemKey: string) => {
                switch (itemKey) {
                  case 'header':
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 w-full">
                        {exp.company_logo && (
                          <InlineResourceImage
                            resource="experience" id={exp.id} field="company_logo"
                            currentSrc={getFileUrl(exp.company_logo)} alt={`${exp.company} logo`}
                            className="w-16 h-16 rounded-xl object-contain bg-white/10 p-2 border border-text-light/10"
                            wrapperClassName="w-16 h-16 flex-shrink-0"
                            iconSize="sm"
                            width={160}
                            height={160}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl md:text-3xl font-bold text-heading-light flex items-center flex-wrap gap-2 mb-3">
                            <span><InlineResourceText resource="experience" id={exp.id} field="position" defaultValue={exp.position} /></span>
                            <span className="text-primary hidden sm:inline px-1">•</span>
                            <span className="text-primary font-semibold flex items-center gap-2">
                              <InlineResourceText resource="experience" id={exp.id} field="company" defaultValue={exp.company} />
                              {exp.is_current && (
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" title="Currently Working"></span>
                              )}
                            </span>
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                            {exp.location && (
                              <span className="text-text-light/80 font-medium flex items-center gap-1">
                                <span>📍</span> <InlineResourceText resource="experience" id={exp.id} field="location" defaultValue={exp.location} />
                              </span>
                            )}
                            {exp.location && exp.company_website && <span className="text-white/20 hidden sm:inline">•</span>}
                            {exp.company_website && (
                              <a
                                href={exp.company_website?.startsWith('http') ? exp.company_website : `https://${exp.company_website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-normal text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full"
                              >
                                Website ↗
                              </a>
                            )}
                            {(exp.location || exp.company_website) && <span className="text-white/20 hidden sm:inline">•</span>}
                            <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                              {startStr} – {endStr} · {duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  case 'tags':
                    return (exp.employment_type || exp.work_mode || exp.department || exp.industry) ? (
                      <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-6 pb-2 md:pb-0 scrollbar-hide w-full" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {exp.employment_type && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.employment_type}</span>}
                        {exp.work_mode && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.work_mode}</span>}
                        {exp.department && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">{exp.department}</span>}
                        {exp.industry && <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 whitespace-nowrap flex-shrink-0">{exp.industry}</span>}
                      </div>
                    ) : null;
                  case 'description':
                    return (variant === 'full' || expandedCards[exp.id]) && exp.full_description ? (
                      <div className="text-text-light text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap w-full">
                        <InlineResourceText resource="experience" id={exp.id} field="full_description" multiline defaultValue={exp.full_description || exp.short_summary} />
                      </div>
                    ) : null;
                  case 'responsibilities':
                    return (variant === 'full' || expandedCards[exp.id]) && exp.responsibilities && exp.responsibilities.length > 0 ? (
                      <div className="mb-6 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">📋 Key Responsibilities</h5>
                        <ul className="space-y-2">
                          <InlineEditableList
                            resource="experience"
                            id={exp.id}
                            field="responsibilities"
                            items={exp.responsibilities}
                            placeholder="Add responsibility"
                            renderItem={(text, i) => (
                              <li key={i} className="flex gap-3 text-text-light">
                                <span className="text-primary mt-1">▹</span>
                                <span>{text}</span>
                              </li>
                            )}
                          />
                        </ul>
                      </div>
                    ) : null;
                  case 'contributions':
                    return (variant === 'full' || expandedCards[exp.id]) && exp.key_contributions && exp.key_contributions.length > 0 ? (
                      <div className="mb-6 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🚀 Key Contributions</h5>
                        <ul className="space-y-2">
                          <InlineEditableList
                            resource="experience"
                            id={exp.id}
                            field="key_contributions"
                            items={exp.key_contributions}
                            placeholder="Add contribution"
                            renderItem={(text, i) => (
                              <li key={i} className="flex gap-3 text-text-light">
                                <span className="text-secondary mt-1">✓</span>
                                <span>{text}</span>
                              </li>
                            )}
                          />
                        </ul>
                      </div>
                    ) : null;
                  case 'achievements':
                    return (variant === 'full' || expandedCards[exp.id]) && exp.achievements && exp.achievements.length > 0 ? (
                      <div className="mb-6 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">⭐ Key Achievements</h5>
                        <ul className="space-y-2">
                          <InlineEditableList
                            resource="experience"
                            id={exp.id}
                            field="achievements"
                            items={exp.achievements}
                            placeholder="Add achievement"
                            renderItem={(text, i) => (
                              <li key={i} className="flex gap-3 text-text-light">
                                <span className="text-primary mt-1">★</span>
                                <span>{text}</span>
                              </li>
                            )}
                          />
                        </ul>
                      </div>
                    ) : null;
                  case 'links':
                    return (
                      <div className="w-full">
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
                  default:
                    return null;
                }
              };

              return (
                <div key={exp.id} className="relative animate-fade-in-up glass p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline Dot */}
                  <div className="hidden md:block absolute -left-[90px] top-10 w-6 h-6 rounded-full bg-bg-dark border-4 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                  <InnerSortableLayout
                    items={cardOrder}
                    onReorder={setCardOrder}
                    renderItem={renderCardItem}
                    isPreview={isPreview}
                    className="flex flex-col w-full"
                  />
                </div>
              );
            };

            return (
              <InnerSortableLayout
                items={expIds}
                onReorder={handleReorder}
                renderItem={renderExp}
                isPreview={isPreview}
                className="relative md:border-l-2 md:border-text-light/15 md:ml-8 md:pl-12 space-y-16"
              />
            );
          })()
        ) : null}

        {variant === 'highlights' && (
          <div className="mt-8 text-center">
            <Link href="/experience" className="btn btn-md btn-secondary">
              View Full Experience Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
