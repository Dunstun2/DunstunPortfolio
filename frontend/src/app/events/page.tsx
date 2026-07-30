'use client';
import { useState, useEffect } from 'react';
import BackToAbout from '@/components/BackToAbout';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function AllEventsPage() {
  const refreshKey = useRealtimeRefresh('events');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetchApi('/events/published'),
      fetchApi('/settings')
    ])
      .then(([eventsRes, settingsRes]) => {
        setEvents(eventsRes.data || []);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshKey, refreshKeySettings]);

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.short_description && event.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.my_experience && event.my_experience.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatBadgeColor = (format: string) => {
    switch (format) {
      case 'Virtual': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Hybrid': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-20 relative">
      <BackToAbout />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-heading-light">
            {(settings?.events_page_title || 'Events & Networking').split(' ').map((word: string, i: number, arr: string[]) => (
              i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
            ))}
          </h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-12 glass p-4 rounded-2xl">
          {/* Category Dropdown Menu */}
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <select
              id="category-select"
              aria-label="Filter events by category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-black/40 border border-text-light/20 rounded-full px-4 sm:px-5 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-text-light focus:outline-none focus:border-primary cursor-pointer hover:bg-black/60 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-900 text-white py-1">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-light/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-72 sm:flex-none">
            <input
              type="text"
              placeholder="Search events, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-text-light/15 rounded-full px-4 py-2.5 text-xs sm:text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-text-light/50 text-lg">
            Loading events...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl p-8">
            <h3 className="text-xl font-bold text-heading-light mb-2">No events found</h3>
            <p className="text-text-light/60">Try adjusting your search query or filter category.</p>
          </div>
        )}

        {/* Events Detailed List */}
        <div className="space-y-16">
          {filteredEvents.map(event => (
            <article
              key={event.id}
              id={`event-${event.id}`}
              className="glass rounded-3xl p-6 md:p-10 border border-text-light/10 space-y-8 scroll-mt-28"
            >
              {/* Event Header Banner */}
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-text-light/10 pb-8">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {event.category && (
                      <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 font-bold text-xs rounded-full">
                        {event.category}
                      </span>
                    )}
                    {event.format && (
                      <span className={`px-3 py-1 font-bold text-xs rounded-full border ${formatBadgeColor(event.format)}`}>
                        {event.format}
                      </span>
                    )}
                    {event.participation_type && (
                      <span className="px-3 py-1 bg-white/10 text-white/90 text-xs font-semibold rounded-full">
                        Role: {event.participation_type}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-4xl font-bold text-heading-light">
                    {event.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-light/80 pt-1">
                    {event.date && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {event.date}
                      </span>
                    )}
                    {event.organizer && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {event.organizer}
                      </span>
                    )}
                    {(event.venue || event.city || event.country) && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {event.website_url && (
                  <a
                    href={event.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-primary text-white text-sm font-bold transition-all"
                  >
                    Event Website &rarr;
                  </a>
                )}
              </div>

              {/* Cover Image */}
              {event.cover_image_url && (
                <div className="rounded-2xl overflow-hidden max-w-4xl mx-auto w-full border border-text-light/10 bg-black/40 flex justify-center">
                  <img src={event.cover_image_url} alt={event.title} className="w-full h-auto max-h-[500px] object-contain rounded-2xl" />
                </div>
              )}

              {/* Description & My Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {event.short_description && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-heading-light text-primary">About the Event</h3>
                    <p className="text-text-light/90 leading-relaxed text-sm md:text-base">
                      {event.short_description}
                    </p>
                  </div>
                )}
                {event.my_experience && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-heading-light text-primary">My Experience & Involvement</h3>
                    <p className="text-text-light/90 leading-relaxed text-sm md:text-base">
                      {event.my_experience}
                    </p>
                  </div>
                )}
              </div>

              {/* Lessons & Takeaways Grid */}
              {((event.lessons && event.lessons.length > 0) || (event.takeaways && event.takeaways.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-text-light/10">
                  {event.lessons && event.lessons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-heading-light text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" /> Lessons Learned
                      </h4>
                      <ul className="space-y-2 text-sm text-text-light/80">
                        {event.lessons.map((lesson: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.takeaways && event.takeaways.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-heading-light text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Key Takeaways
                      </h4>
                      <ul className="space-y-2 text-sm text-text-light/80">
                        {event.takeaways.map((takeaway: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Media Gallery (Photos) */}
              {event.photos && event.photos.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-text-light/10">
                  <h3 className="text-xl font-bold text-heading-light flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Event Photo Gallery
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {event.photos.map((photo: string, pIdx: number) => (
                      <div key={pIdx} className="rounded-2xl overflow-hidden h-48 border border-text-light/10 group relative">
                        <img
                          src={photo}
                          alt={`${event.title} photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {event.videos && event.videos.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-text-light/10">
                  <h3 className="text-xl font-bold text-heading-light flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Event Videos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.videos.map((vid: string, vIdx: number) => (
                      <div key={vIdx} className="bg-black/40 p-4 rounded-2xl border border-text-light/10 flex items-center justify-between">
                        <span className="text-sm font-mono text-text-light/80 truncate mr-4">{vid}</span>
                        <a href={vid} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-colors">
                          Watch Video &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* People Met / Network Connections */}
              {event.people_met && event.people_met.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-text-light/10">
                  <h3 className="text-lg font-bold text-heading-light flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Connections Made
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {event.people_met.map((person: any, pIdx: number) => (
                      <div key={pIdx} className="bg-black/30 px-4 py-2 rounded-xl border border-text-light/10 text-xs">
                        <span className="font-bold text-heading-light">{person.name}</span>
                        {person.role && <span className="text-text-light/60 ml-1.5">— {person.role}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection Footer */}
              {event.reflection && (
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl italic text-sm text-text-light/90">
                  <strong className="not-italic text-primary block mb-1">Personal Reflection:</strong>
                  &ldquo;{event.reflection}&rdquo;
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
