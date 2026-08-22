'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';

export default function IvoryExperience({ config }: TemplateSectionProps) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKeyExp = useRealtimeRefresh('experience');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/experience').then(res => {
      if (res.success) setExperiences(res.data || []);
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKeyExp, refreshKeySettings]);

  if (!experiences.length) return null;

  return (
    <section id="experience" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Sticky Left Column */}
          <div className="lg:w-1/3">
            <div className="sticky top-40 text-center">
              <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="experience_section_subtitle" defaultValue="Journey" />
              </span>
              <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter mb-6">
                <ColoredTitle settingKey="experience_section_title" title={settings.experience_section_title || 'Professional Journey'} />
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed max-w-sm mx-auto">
                A timeline of my professional roles, highlighting key responsibilities and impact across different organizations.
              </p>
            </div>
          </div>

          {/* Scrolling Right Column (The Timeline) */}
          <div className="lg:w-2/3">
            <div className="space-y-16">
              {experiences.map((exp: any, idx: number) => {
                const isCurrent = exp.is_current;
                const dateStr = `${exp.start_date} — ${isCurrent ? 'Present' : exp.end_date}`;

                return (
                  <div key={exp.id} className="group relative flex flex-col sm:flex-row gap-8">
                    {/* Visual Indicator */}
                    <div className="hidden sm:flex flex-col items-center mt-2">
                      <div className={`w-4 h-4 rounded-full border-2 border-primary bg-bg-dark z-10 ${isCurrent ? 'bg-primary' : 'group-hover:bg-primary'} transition-colors`}></div>
                      {idx !== experiences.length - 1 && (
                        <div className="w-[1px] h-full bg-text-light/10 my-2"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-12 sm:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4">
                        <h3 className="text-3xl font-heading font-bold text-heading-light mb-2 sm:mb-0">
                          <InlineResourceText resource="experience" id={exp.id} field="position" defaultValue={exp.position} />
                        </h3>
                        <div className="text-primary font-mono text-sm tracking-wide mt-2 sm:mt-0 flex items-center gap-2">
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>}
                          {dateStr}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {exp.company_logo && (
                          <div className="w-12 h-12 rounded-lg bg-bg-dark border border-text-light/10 p-1 flex-shrink-0">
                            <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <h4 className="text-xl text-text-light/90 font-medium flex items-center gap-2">
                          <InlineResourceText resource="experience" id={exp.id} field="company" defaultValue={exp.company} />
                          {exp.company_website && (
                            <a href={exp.company_website.startsWith('http') ? exp.company_website : `https://${exp.company_website}`} target="_blank" rel="noreferrer" className="text-text-light/40 hover:text-primary transition-colors">
                              <i className="fas fa-external-link-alt text-sm"></i>
                            </a>
                          )}
                        </h4>
                        
                        {exp.location && (
                          <div className="text-sm text-text-light/60 flex items-center gap-1 border-l border-text-light/10 pl-4 ml-2">
                            <i className="fas fa-map-marker-alt"></i> <InlineResourceText resource="experience" id={exp.id} field="location" defaultValue={exp.location} />
                          </div>
                        )}
                      </div>

                      {/* Job Meta Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {exp.employment_type && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">{exp.employment_type}</span>}
                        {exp.work_mode && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">{exp.work_mode}</span>}
                        {exp.department && <span className="text-xs font-mono bg-text-light/5 text-muted-light px-2 py-1 rounded border border-text-light/10">{exp.department}</span>}
                        {exp.industry && <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">{exp.industry}</span>}
                      </div>
                      
                      {exp.short_summary && (
                        <p className="text-muted-light leading-relaxed mb-6 text-lg border-l-2 border-primary pl-4">
                          {exp.short_summary}
                        </p>
                      )}

                      {exp.full_description && (
                        <div className="text-text-light/80 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                          {exp.full_description}
                        </div>
                      )}
                      
                      {/* Lists Grid */}
                      <div className="grid grid-cols-1 gap-6 mb-6">
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Responsibilities</h5>
                            <ul className="space-y-2">
                              {exp.responsibilities.map((r: string, i: number) => (
                                <li key={i} className="flex items-start text-text-light/80">
                                  <span className="text-primary mt-1 mr-3 text-xs leading-none">▹</span>
                                  <span className="leading-relaxed">{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.key_contributions && exp.key_contributions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Key Contributions</h5>
                            <ul className="space-y-2">
                              {exp.key_contributions.map((c: string, i: number) => (
                                <li key={i} className="flex items-start text-text-light/80">
                                  <span className="text-secondary mt-1 mr-3 text-xs leading-none">✓</span>
                                  <span className="leading-relaxed">{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.achievements && exp.achievements.length > 0 && (
                          <div>
                            <h5 className="text-sm font-mono uppercase tracking-widest text-text-light/50 mb-3">Key Achievements</h5>
                            <ul className="space-y-2">
                              {exp.achievements.map((achievement: string, i: number) => (
                                <li key={i} className="flex items-start text-text-light/80">
                                  <span className="text-primary mt-1 mr-3 text-xs leading-none">★</span>
                                  <span className="leading-relaxed">{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Relations */}
                      {((exp.associated_skills && exp.associated_skills.length > 0) || 
                        (exp.related_projects && exp.related_projects.length > 0) || 
                        (exp.external_links && exp.external_links.length > 0)) && (
                        <div className="pt-6 border-t border-text-light/10 mt-6 space-y-4">
                          {exp.associated_skills && exp.associated_skills.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-xs font-mono text-muted-light uppercase tracking-widest mr-2">Skills:</span>
                              {exp.associated_skills.map((s: string, i: number) => (
                                <span key={i} className="text-xs bg-text-light/5 text-text-light/80 px-2 py-1 rounded">{s}</span>
                              ))}
                            </div>
                          )}

                          {exp.related_projects && exp.related_projects.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-xs font-mono text-muted-light uppercase tracking-widest mr-2">Projects:</span>
                              {exp.related_projects.map((p: string, i: number) => (
                                <a href="#projects" key={i} className="text-xs bg-primary/5 border border-primary/20 text-primary hover:bg-primary/20 hover:underline px-2 py-1 rounded transition-colors">
                                  {p}
                                </a>
                              ))}
                            </div>
                          )}

                          {exp.external_links && exp.external_links.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-xs font-mono text-muted-light uppercase tracking-widest mr-2">Links:</span>
                              {exp.external_links.filter(Boolean).map((link: string, i: number) => {
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
