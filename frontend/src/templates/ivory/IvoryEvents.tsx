'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';
import CorporateEvents from '@/modes/corporate/components/CorporateEvents';

export default function IvoryEvents({ config, variant = 'full' }: TemplateSectionProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('event');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/events/published').then(res => {
        if (res.success) {
          let data = res.data || [];
          if (variant === 'highlights') {
            data = data.slice(0, 4);
          }
          setEvents(data);
        }
      }).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings, variant]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateEvents variant={variant} />;
  }

  if (!events.length) return null;

  return (
    <section id="events" className="py-32 bg-text-light/5 border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-20 gap-8">
          <div>
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="events_section_subtitle" defaultValue="Engagements" />
              </span>
            <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
              <ColoredTitle settingKey="events_section_title" title={settings.events_section_title || 'Speaking & Events'} />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event: any) => {
            const displayLocation = [event.city, event.country].filter(Boolean).join(', ') || event.location;
            
            return (
              <div key={event.id} className="group bg-bg-dark rounded-[2rem] p-8 md:p-10 border border-text-light/10 hover:border-primary/30 transition-colors flex flex-col md:flex-row gap-8 items-start">
                
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-text-light/5 border border-text-light/10 flex flex-col items-center justify-center text-center group-hover:border-primary/30 transition-colors relative">
                  {event.logo_url || event.cover_image_url ? (
                    <img src={event.logo_url || event.cover_image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <>
                      <span className="text-sm font-mono uppercase tracking-widest text-primary mb-1">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-3xl font-heading font-black text-heading-light">
                        {new Date(event.date).getDate()}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-grow flex flex-col h-full">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-mono text-muted-light">
                    {displayLocation && (
                      <>
                        <span className="flex items-center gap-2">
                          <i className="fas fa-map-marker-alt text-primary/70"></i>
                          <InlineResourceText resource="events" id={event.id} field="city" defaultValue={displayLocation} />
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {(event.participation_type || event.organizer) && (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-users text-primary/70"></i>
                        {event.participation_type || event.organizer}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.category && (
                      <span className="px-2 py-1 bg-text-light/5 border border-text-light/10 text-xs font-mono uppercase tracking-widest rounded text-text-light/70">
                        <InlineResourceText resource="events" id={event.id} field="category" defaultValue={event.category} />
                      </span>
                    )}
                    {event.format && (
                      <span className={`px-2 py-1 border text-xs font-mono uppercase tracking-widest rounded ${
                        event.format === 'Virtual' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                        event.format === 'Hybrid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <InlineResourceText resource="events" id={event.id} field="format" defaultValue={event.format} />
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-heading-light mb-4 group-hover:text-primary transition-colors">
                    <InlineResourceText resource="events" id={event.id} field="title" defaultValue={event.title} />
                  </h3>
                  
                  <p className="text-text-light/80 leading-relaxed mb-6">
                    <InlineResourceText resource="events" id={event.id} field="short_description" multiline defaultValue={event.short_description} />
                  </p>
                  
                  {event.takeaways && event.takeaways.length > 0 && (
                    <div className="mb-6 pt-4 border-t border-text-light/10">
                      <span className="text-xs uppercase tracking-widest font-mono text-text-light/40 block mb-3">Key Takeaways</span>
                      <ul className="space-y-2">
                        {event.takeaways.map((t: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-text-light/70">
                            <span className="text-primary mr-2">▹</span>
                            <span className="leading-relaxed">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4">
                    {event.website_url && (
                      <a 
                        href={event.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-heading-light hover:text-primary transition-colors"
                      >
                        Event Details <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
        
        {variant === 'highlights' && (
          <div className="text-center mt-16">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-text-light/20 text-heading-light font-bold hover:bg-text-light/10 hover:border-text-light/40 transition-all duration-300"
            >
              View All Events
            </Link>
          </div>
        )}
        
      </div>
    </section>
  );
}
