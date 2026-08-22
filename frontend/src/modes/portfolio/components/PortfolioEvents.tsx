'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';

export default function EventsSection() {
  const { isInlineEditing } = useInlineEdit();
  const [events, setEvents] = useState<any[]>([]);
  const refreshKey = useRealtimeRefresh('events');

  useEffect(() => {
    fetchApi('/events/published?limit=4')
      .then(res => setEvents(res.data || []))
      .catch(() => {});
  }, [refreshKey]);

  if (!events.length) return null;

  const formatBadgeColor = (format: string) => {
    switch (format) {
      case 'Virtual': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Hybrid': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <section id="events" className="py-4 md:py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-4 text-center">
          <ColoredTitle settingKey="events_section_title" title="Events & Networking" />
        </h2>
        <p className="text-text-light text-center mb-8 max-w-2xl mx-auto">
          <InlineText settingKey="events_section_subtitle" defaultValue="Conferences, workshops, and professional events I've attended — sharing lessons learned and connections made.">
            Conferences, workshops, and professional events I&apos;ve attended — sharing lessons learned and connections made.
          </InlineText>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {events.map((event) => (
            <div key={event.id} className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
              {/* Banner Image */}
              <div className="h-48 overflow-hidden relative w-full">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <InlineResourceImage
                  resource="events" id={event.id} field="cover_image_url"
                  currentSrc={event.cover_image_url} alt={event.title}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  width={600}
                  height={400}
                />
                {(event.category || isInlineEditing) && (
                  <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                    <InlineResourceText resource="events" id={event.id} field="category" defaultValue={event.category || 'Category'} />
                  </span>
                )}
                {(event.format || isInlineEditing) && (
                  <span className={`absolute top-3 right-3 z-20 px-3 py-1 backdrop-blur-md font-bold text-xs rounded-full border ${formatBadgeColor(event.format)}`}>
                    <InlineResourceText resource="events" id={event.id} field="format" defaultValue={event.format || 'Virtual'} />
                  </span>
                )}
                {event.date && (
                  <span className="absolute bottom-3 left-3 z-20 text-white/90 text-sm font-semibold flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <InlineResourceText resource="events" id={event.id} field="date" defaultValue={event.date} />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg md:text-xl font-bold text-heading-light mb-1 group-hover:text-primary transition-colors">
                  <InlineResourceText resource="events" id={event.id} field="title" defaultValue={event.title} />
                </h3>

                {/* Organizer & Location */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-light/70 mb-3">
                  {event.organizer && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <InlineResourceText resource="events" id={event.id} field="organizer" defaultValue={event.organizer} />
                    </span>
                  )}
                  {(event.city || event.country) && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <InlineResourceText resource="events" id={event.id} field="city" defaultValue={[event.city, event.country].filter(Boolean).join(', ')} />
                    </span>
                  )}
                  {event.participation_type && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <InlineResourceText resource="events" id={event.id} field="participation_type" defaultValue={event.participation_type} />
                    </span>
                  )}
                </div>

                {/* Short description */}
                {event.short_description && (
                  <p className="text-text-light text-sm mb-4 line-clamp-2 flex-1">
                    <InlineResourceText resource="events" id={event.id} field="short_description" multiline defaultValue={event.short_description} />
                  </p>
                )}

                {/* Takeaway pills */}
                {((event.takeaways && event.takeaways.length > 0) || isInlineEditing) && (
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-text-light/10">
                    <span className="text-xs text-text-light/50 font-semibold mr-1 self-center">Takeaways:</span>
                    <InlineEditableList
                      resource="events"
                      id={event.id}
                      field="takeaways"
                      items={event.takeaways || []}
                      placeholder="Add takeaway"
                      renderItem={(text) => (
                        <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full font-medium truncate max-w-[180px]">
                          {text}
                        </span>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1 border border-primary/50"
          >
            View All Events &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
