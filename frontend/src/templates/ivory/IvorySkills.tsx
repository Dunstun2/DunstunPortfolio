'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';

export default function IvorySkills({ config }: TemplateSectionProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('skill');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/skills').then(res => {
      if (res.success) setSkills(res.data || []);
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey, refreshKeySettings]);

  if (!skills.length) return null;

  // Group skills by category if possible, else just map
  const categories = Array.from(new Set(skills.map(s => s.category || 'Core')));

  return (
    <section id="skills" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          <div className="lg:w-1/3">
            <div className="sticky top-40 text-center">
              <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="skills_section_subtitle" defaultValue="Capabilities" />
              </span>
              <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter mb-6">
                <ColoredTitle settingKey="skills_section_title" title={settings.skills_section_title || 'Skills & Expertise'} />
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed max-w-sm mx-auto">
                The tools, technologies, and methodologies I leverage to solve complex problems and build robust solutions.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="space-y-16">
              {categories.map((category, idx) => {
                const categorySkills = skills.filter(s => (s.category || 'Core') === category);
                return (
                  <div key={idx} className="border-t border-text-light/10 pt-10 first:border-0 first:pt-0">
                    <h3 className="text-2xl font-heading font-bold text-heading-light mb-8">
                      <InlineResourceText resource="skills" id="category" field={category} defaultValue={category} />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categorySkills.map((skill: any) => (
                        <div 
                          key={skill.id} 
                          className="group relative overflow-hidden px-6 py-4 rounded-xl border border-text-light/10 bg-text-light/5 text-text-light hover:border-primary/50 transition-colors"
                        >
                          <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {skill.icon_url ? (
                                <img src={skill.icon_url} alt={skill.name} className="w-8 h-8 object-contain transition-all" />
                              ) : skill.icon ? (
                                <i className={`${skill.icon} text-xl text-text-light/70 group-hover:text-primary transition-colors`}></i>
                              ) : null}
                              <span className="text-lg font-medium group-hover:text-primary transition-colors">
                                <InlineResourceText resource="skills" id={skill.id} field="name" defaultValue={skill.name} />
                              </span>
                            </div>
                            {skill.proficiency && (
                              <span className="text-sm font-mono text-text-light/50 group-hover:text-primary transition-colors">{skill.proficiency}%</span>
                            )}
                          </div>
                          {skill.proficiency && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-text-light/5">
                              <div 
                                className="h-full bg-primary/50 group-hover:bg-primary transition-all duration-1000" 
                                style={{ width: `${skill.proficiency}%` }} 
                              />
                            </div>
                          )}
                        </div>
                      ))}
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
