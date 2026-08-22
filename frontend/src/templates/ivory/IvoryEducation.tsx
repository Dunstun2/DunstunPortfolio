'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';

export default function IvoryEducation({ config }: TemplateSectionProps) {
  const [education, setEducation] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKeyEdu = useRealtimeRefresh('education');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/education').then(res => {
      if (res.success) setEducation(res.data || []);
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKeyEdu, refreshKeySettings]);

  if (!education.length) return null;

  return (
    <section id="education" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Sticky Left Column */}
          <div className="lg:w-1/3">
            <div className="sticky top-40 text-center">
              <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="education_section_subtitle" defaultValue="Background" />
              </span>
              <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter mb-6">
                <ColoredTitle settingKey="education_section_title" title={settings.education_section_title || 'Education & Learning'} />
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed max-w-sm mx-auto">
                Academic foundations, continuous learning, and scholarly achievements that shape my approach to problem-solving.
              </p>
            </div>
          </div>

          {/* Scrolling Right Column (The Timeline) */}
          <div className="lg:w-2/3">
            <div className="space-y-16">
              {education.map((edu: any, idx: number) => {
                const isCurrent = edu.is_current;
                const startStr = new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                
                let endStr = '';
                if (edu.is_current && edu.expected_graduation) {
                  endStr = 'Expected ' + new Date(edu.expected_graduation).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                } else if (edu.is_current) {
                  endStr = 'Present';
                } else {
                  endStr = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }
                const dateStr = `${startStr} — ${endStr}`;

                return (
                  <div key={edu.id} className="group relative flex flex-col sm:flex-row gap-8">
                    {/* Visual Indicator */}
                    <div className="hidden sm:flex flex-col items-center mt-2">
                      <div className={`w-4 h-4 rounded-full border-2 border-primary bg-bg-dark z-10 ${isCurrent ? 'bg-primary' : 'group-hover:bg-primary'} transition-colors`}></div>
                      {idx !== education.length - 1 && (
                        <div className="w-[1px] h-full bg-text-light/10 my-2"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-12 sm:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4">
                        <h3 className="text-3xl font-heading font-bold text-heading-light mb-2 sm:mb-0">
                          {edu.degree}
                        </h3>
                        <div className="text-primary font-mono text-sm tracking-wide mt-2 sm:mt-0 flex items-center gap-2">
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>}
                          {dateStr}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        {edu.institution_logo && (
                          <div className="w-12 h-12 rounded-lg bg-bg-dark border border-text-light/10 p-1 flex-shrink-0">
                            <img src={edu.institution_logo} alt={edu.institution} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <h4 className="text-xl text-text-light/90 font-medium flex items-center flex-wrap gap-1">
                          {edu.institution}
                          {edu.faculty && <span className="text-muted-light font-normal text-sm"> | {edu.faculty}</span>}
                          {edu.department && <span className="text-muted-light font-normal text-sm"> | {edu.department}</span>}
                        </h4>
                        {edu.location && (
                          <div className="text-sm text-text-light/60 flex items-center gap-1 border-l border-text-light/10 pl-4 ml-2">
                            <i className="fas fa-map-marker-alt"></i> {edu.location}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        {edu.field_of_study && (
                          <div className="text-primary font-medium">
                            {edu.field_of_study}
                          </div>
                        )}
                      </div>

                      {/* Job Meta Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {edu.gpa && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">GPA: {edu.gpa}</span>}
                        {edu.grade && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">Grade: {edu.grade}</span>}
                        {edu.honors && <span className="text-xs font-mono bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">{edu.honors}</span>}
                        {edu.specialization && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">Spec: {edu.specialization}</span>}
                      </div>
                      
                      {edu.short_summary && (
                        <p className="text-muted-light leading-relaxed mb-6 text-lg border-l-2 border-primary pl-4">
                          {edu.short_summary}
                        </p>
                      )}

                      {edu.full_description && (
                        <div className="text-text-light/80 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                          {edu.full_description}
                        </div>
                      )}

                      {edu.research_title && (
                        <div className="mb-6 bg-text-light/5 p-5 rounded-2xl border border-text-light/10">
                          <h5 className="text-xs font-mono uppercase tracking-widest text-text-light/50 mb-3">Research / Thesis</h5>
                          <p className="font-semibold text-primary mb-1">{edu.research_title}</p>
                          {edu.research_supervisor && <p className="text-xs text-muted-light mb-2">Supervisor: {edu.research_supervisor}</p>}
                          {edu.research_description && <p className="text-sm text-text-light/70 mt-1 leading-relaxed">{edu.research_description}</p>}
                          {edu.research_link && (() => {
                            const href = edu.research_link?.startsWith('http') ? edu.research_link : `https://${edu.research_link}`;
                            return (
                              <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline">
                                View Research <i className="fas fa-external-link-alt text-[10px]"></i>
                              </a>
                            );
                          })()}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-6 mb-6">
                        {edu.achievements && edu.achievements.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Key Achievements</h5>
                            <ul className="space-y-2">
                              {edu.achievements.map((achievement: string, i: number) => (
                                <li key={i} className="flex items-start text-text-light/80">
                                  <span className="text-primary mt-1 mr-3 text-xs leading-none">★</span>
                                  <span className="leading-relaxed">{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {edu.activities && edu.activities.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Extracurriculars</h5>
                            <ul className="space-y-2">
                              {edu.activities.map((act: string, i: number) => (
                                <li key={i} className="flex items-start text-text-light/80">
                                  <span className="text-secondary mt-1 mr-3 text-xs leading-none">▹</span>
                                  <span className="leading-relaxed">{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {edu.coursework && edu.coursework.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Relevant Coursework</h5>
                            <div className="flex flex-wrap gap-2">
                              {edu.coursework.map((course: string, i: number) => (
                                <span key={i} className="text-xs bg-text-light/5 border border-text-light/10 text-text-light/80 px-2 py-1 rounded">
                                  {course}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {edu.certifications && edu.certifications.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Certifications</h5>
                            <div className="flex flex-wrap gap-2">
                              {edu.certifications.map((c: string, i: number) => (
                                <span key={i} className="text-xs bg-text-light/5 border border-text-light/10 text-muted-light px-2 py-1 rounded">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Relations */}
                      {((edu.related_projects && edu.related_projects.length > 0) || 
                        (edu.external_links && edu.external_links.length > 0)) && (
                        <div className="pt-6 border-t border-text-light/10 mt-6 space-y-4">
                          {edu.related_projects && edu.related_projects.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-xs font-mono text-muted-light uppercase tracking-widest mr-2">Projects:</span>
                              {edu.related_projects.map((p: string, i: number) => (
                                <a href="#projects" key={i} className="text-xs bg-primary/5 border border-primary/20 text-primary hover:bg-primary/20 hover:underline px-2 py-1 rounded transition-colors">
                                  {p}
                                </a>
                              ))}
                            </div>
                          )}

                          {edu.external_links && edu.external_links.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-xs font-mono text-muted-light uppercase tracking-widest mr-2">Links:</span>
                              {edu.external_links.filter(Boolean).map((link: string, i: number) => {
                                let label = link.replace(/^https?:\/\/(www\.)?/, '');
                                if (label.length > 30) label = label.substring(0, 30) + '...';
                                const href = link.startsWith('http') ? link : `https://${link}`;
                                return (
                                  <a href={href} target="_blank" rel="noreferrer" key={i} className="flex items-center gap-1.5 text-xs bg-text-light/5 border border-text-light/10 text-text-light hover:border-primary hover:text-primary px-2 py-1 rounded transition-colors" title={href}>
                                    <i className="fas fa-link text-[10px]"></i> {label}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
