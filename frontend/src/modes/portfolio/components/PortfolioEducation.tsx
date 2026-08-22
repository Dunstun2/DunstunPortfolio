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

export default function EducationSection({ variant = 'full' }: { variant?: 'full' | 'highlights' }) {
  const [education, setEducation] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const refreshKey = useRealtimeRefresh('education');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');
  const [cardOrder, setCardOrder] = useState<string[]>(['header', 'summary', 'coursework_activities', 'description', 'research', 'certifications', 'achievements', 'links']);

  useEffect(() => {
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.education_card;
    if (configOrder && configOrder.length > 0) {
      setCardOrder(configOrder);
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_education_card'] = cardOrder;
    }
  }, [cardOrder, isPreview]);

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

  let publishedEdu = education ? education.filter(e => e.status === 'published') : [];

  // Sort: current studies first, then by end date, then start date
  publishedEdu.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    const dateA = new Date(a.end_date || a.start_date).getTime();
    const dateB = new Date(b.end_date || b.start_date).getTime();
    return dateB - dateA;
  });

  if (!publishedEdu.length) return null;

  const sectionTitle = settings?.education_section_title || 'Education & Learning';
  const pageTitle = settings?.education_page_title || 'Academic Background';
  const pageSubtitle = settings?.education_page_subtitle || 'My academic journey, degrees, achievements, and courseworks';

  return (
    <section id="education" className={`px-4 bg-bg-dark text-text-light relative ${variant === 'highlights' ? 'py-4 md:py-8' : 'py-8 md:py-12 pb-16 md:pb-24'}`}>
      <div className={variant === 'highlights' ? 'w-full max-w-full mx-auto md:px-4' : 'max-w-4xl mx-auto'}>
        {variant === 'highlights' ? (
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-10 text-center">
            <ColoredTitle settingKey="education_section_title" title={sectionTitle} />
          </h2>
        ) : (
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-heading-light mb-4">
              <InlineText settingKey="education_page_title" defaultValue="Academic Background">
                {pageTitle}
              </InlineText>
            </h1>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              <InlineText settingKey="education_page_subtitle" defaultValue="My academic journey, degrees, achievements, and courseworks">
                {pageSubtitle}
              </InlineText>
            </p>
          </div>
        )}

        {publishedEdu.length > 0 ? (
          (() => {
            const eduIds = publishedEdu.map(e => e.id);

            const handleReorder = (newIds: string[]) => {
              const newEdu = newIds.map(id => publishedEdu.find(e => e.id === id)!).filter(Boolean);
              setEducation(newEdu);

              window.__PREVIEW_DATA_REORDER__ = window.__PREVIEW_DATA_REORDER__ || {};
              window.__PREVIEW_DATA_REORDER__['education'] = newIds;
            };

            const renderEdu = (id: string) => {
              const edu = publishedEdu.find(e => e.id === id);
              if (!edu) return null;
              const index = publishedEdu.findIndex(e => e.id === id);
              const startStr = new Date(edu.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

              let endStr = '';
              if (edu.is_current && edu.expected_graduation) {
                endStr = 'Expected ' + new Date(edu.expected_graduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              } else if (edu.is_current) {
                endStr = 'Present';
              } else {
                endStr = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              }

              const renderCardItem = (itemKey: string) => {
                switch (itemKey) {
                  case 'header':
                    return (
                      <div className="w-full">
                        <div className="mb-2">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light leading-snug break-words">
                            {edu.degree && <span className="text-orange-500"><InlineResourceText resource="education" id={edu.id} field="degree" defaultValue={edu.degree} /></span>}
                            {edu.degree && edu.field_of_study && ' in '}
                            {edu.field_of_study && <span className="text-primary"><InlineResourceText resource="education" id={edu.id} field="field_of_study" defaultValue={edu.field_of_study} /></span>}
                            <span className="inline-block ml-3 align-middle text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap mb-1">
                              {startStr} – {endStr}
                            </span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          {edu.institution_logo && (
                            <InlineResourceImage
                              resource="education" id={edu.id} field="institution_logo"
                              currentSrc={getFileUrl(edu.institution_logo)} alt={`${edu.institution} logo`}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-white/10 p-1.5 border border-text-light/10"
                              wrapperClassName="w-12 h-12 md:w-14 md:h-14 flex-shrink-0"
                              iconSize="sm"
                              width={160}
                              height={160}
                            />
                          )}
                          <h4 className="text-xl font-semibold text-subheading">
                            <InlineResourceText resource="education" id={edu.id} field="institution" defaultValue={edu.institution} />
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
                      </div>
                    );
                  case 'summary':
                    return edu.short_summary ? (
                      <p className="text-text-light text-lg mb-4 border-l-4 border-primary pl-4 py-1 italic w-full">
                        {edu.short_summary}
                      </p>
                    ) : null;
                  case 'coursework_activities':
                    return (edu.coursework && edu.coursework.length > 0) || (edu.activities && edu.activities.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
                        {((edu.coursework && edu.coursework.length > 0) || isPreview) && (
                          <div>
                            <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">📚 Key Coursework</h5>
                            <div className="flex flex-wrap gap-2">
                              <InlineEditableList
                                resource="education"
                                id={edu.id}
                                field="coursework"
                                items={edu.coursework || []}
                                placeholder="Add course"
                                renderItem={(text) => (
                                  <span className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{text}</span>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {((edu.activities && edu.activities.length > 0) || isPreview) && (
                          <div>
                            <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🎯 Activities / Involvements</h5>
                            <div className="flex flex-wrap gap-2">
                              <InlineEditableList
                                resource="education"
                                id={edu.id}
                                field="activities"
                                items={edu.activities || []}
                                placeholder="Add activity"
                                renderItem={(text) => (
                                  <span className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{text}</span>
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null;
                  case 'description':
                    return (variant === 'full' || expandedCards[edu.id]) && edu.full_description ? (
                      <div className="text-text-light text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap w-full">
                        <InlineResourceText resource="education" id={edu.id} field="full_description" multiline defaultValue={edu.full_description || edu.short_summary} />
                      </div>
                    ) : null;
                  case 'research':
                    return (variant === 'full' || expandedCards[edu.id]) && (edu.research_title || isPreview) ? (
                      <div className="mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-text-light/10 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-2">🔬 Research / Thesis</h5>
                        <p className="font-semibold text-primary mb-1">
                          <InlineResourceText resource="education" id={edu.id} field="research_title" defaultValue={edu.research_title || 'Thesis Title'} />
                        </p>
                        <p className="text-xs text-muted-light mb-2 border-b border-text-light/10 pb-2 inline-block">
                          Supervisor: <InlineResourceText resource="education" id={edu.id} field="research_supervisor" defaultValue={edu.research_supervisor || 'Supervisor Name'} />
                        </p>
                        <p className="text-sm text-text-light mt-1">
                          <InlineResourceText resource="education" id={edu.id} field="research_description" multiline defaultValue={edu.research_description || 'Brief description of research...'} />
                        </p>
                        {edu.research_link && (() => {
                          const href = edu.research_link?.startsWith('http') ? edu.research_link : `https://${edu.research_link}`;
                          return (
                            <a href={href} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded">
                              View Research ↗
                            </a>
                          );
                        })()}
                      </div>
                    ) : null;
                  case 'certifications':
                    return (variant === 'full' || expandedCards[edu.id]) && ((edu.certifications && edu.certifications.length > 0) || isPreview) ? (
                      <div className="mb-6 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">🏆 Related Certifications</h5>
                        <div className="flex flex-wrap gap-2">
                          <InlineEditableList
                            resource="education"
                            id={edu.id}
                            field="certifications"
                            items={edu.certifications || []}
                            placeholder="Add cert"
                            renderItem={(text) => (
                              <span className="text-xs bg-black/5 dark:bg-white/5 border border-text-light/15 text-muted-light px-2 py-1 rounded">{text}</span>
                            )}
                          />
                        </div>
                      </div>
                    ) : null;
                  case 'achievements':
                    return (variant === 'full' || expandedCards[edu.id]) && ((edu.achievements && edu.achievements.length > 0) || isPreview) ? (
                      <div className="mb-6 w-full">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-subheading mb-3">⭐ Academic Achievements</h5>
                        <ul className="space-y-2">
                          <InlineEditableList
                            resource="education"
                            id={edu.id}
                            field="achievements"
                            items={edu.achievements || []}
                            placeholder="Add achievement"
                            renderItem={(text) => (
                              <li className="flex gap-3 text-text-light">
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
                        {(variant === 'full' || expandedCards[edu.id]) && ((edu.related_projects && edu.related_projects.length > 0) || (edu.external_links && edu.external_links.length > 0)) && (
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
                          </div>
                        )}

                        {/* Load More toggle — only when collapsed */}
                        {variant === 'highlights' && !expandedCards[edu.id] && (edu.full_description || edu.research_title || (edu.certifications && edu.certifications.length > 0) || (edu.achievements && edu.achievements.length > 0) || (edu.related_projects && edu.related_projects.length > 0) || (edu.external_links && edu.external_links.length > 0)) && (
                          <button
                            onClick={() => setExpandedCards(prev => ({ ...prev, [edu.id]: true }))}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                          >
                            Load More
                            <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}

                        {/* Show Less toggle — only when expanded */}
                        {variant === 'highlights' && expandedCards[edu.id] && (
                          <button
                            onClick={() => setExpandedCards(prev => ({ ...prev, [edu.id]: false }))}
                            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
                          >
                            Show Less
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          </button>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div key={edu.id} className="relative animate-fade-in-up glass p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30" style={{ animationDelay: `${index * 100}ms` }}>
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
                items={eduIds}
                onReorder={handleReorder}
                renderItem={renderEdu}
                isPreview={isPreview}
                className="relative md:border-l-2 md:border-text-light/15 md:ml-8 md:pl-12 space-y-16"
              />
            );
          })()
        ) : null}

        {variant === 'highlights' && (
          <div className="mt-8 text-center">
            <Link href="/education" className="btn btn-md btn-secondary">
              View Full Education Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
