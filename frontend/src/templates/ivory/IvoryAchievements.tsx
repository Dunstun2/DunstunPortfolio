'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';

export default function IvoryAchievements({ config }: TemplateSectionProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('achievement');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/achievements/published').then(res => {
      if (res.success) setAchievements(res.data || []);
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey, refreshKeySettings]);

  if (!achievements.length) return null;

  return (
    <section id="achievements" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-20 gap-8">
          <div>
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="achievements_section_subtitle" defaultValue="Recognition" />
              </span>
            <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
              <ColoredTitle settingKey="achievements_section_title" title={settings.achievements_section_title || 'Awards & Honors'} />
            </h2>
          </div>
          <div className="max-w-md text-text-light/80 text-lg">
            Milestones and industry recognition that highlight a commitment to excellence and innovation.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {achievements.map((item: any, idx: number) => (
            <div key={item.id} className="group flex flex-col h-full border-t border-text-light/20 pt-8 hover:border-primary transition-colors duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="text-primary font-mono text-sm uppercase tracking-widest bg-text-light/5 px-3 py-1 rounded-full">
                  <InlineResourceText resource="achievements" id={item.id} field="date" defaultValue={item.date || ''} />
                </div>
                <div className="flex items-center gap-3">
                  {item.category && (
                    <span className="text-muted-light text-xs uppercase tracking-wider">
                      <InlineResourceText resource="achievements" id={item.id} field="category" defaultValue={item.category} />
                    </span>
                  )}
                  {item.organization && (
                    <div className="text-muted-light text-sm font-medium">
                      <InlineResourceText resource="achievements" id={item.id} field="organization" defaultValue={item.organization} />
                    </div>
                  )}
                </div>
              </div>

              {/* Featured image */}
              {item.featured_image && (
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-bg-dark border border-text-light/10">
                  <img
                    src={item.featured_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
              
              <h3 className="text-2xl font-heading font-bold text-heading-light mb-4 group-hover:text-primary transition-colors">
                <InlineResourceText resource="achievements" id={item.id} field="title" defaultValue={item.title} />
              </h3>
              
              <p className="text-text-light/80 leading-relaxed mb-6 flex-grow">
                <InlineResourceText resource="achievements" id={item.id} field="short_description" multiline defaultValue={item.short_description} />
              </p>
              
              <div className="flex gap-4 mt-auto">
                {item.verification_url && (
                  <a 
                    href={item.verification_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                  >
                    <i className="fas fa-check-circle"></i> Verify
                  </a>
                )}
                {item.external_url && (
                  <a 
                    href={item.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-heading-light hover:text-primary transition-colors"
                  >
                    View Details <i className="fas fa-arrow-right"></i>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
