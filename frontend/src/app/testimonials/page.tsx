'use client';
import { useState, useEffect } from 'react';
import BackToAbout from '@/components/BackToAbout';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function AllTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('All');
  const refreshKey = useRealtimeRefresh('testimonials');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/testimonials/published'),
      fetchApi('/settings')
    ])
      .then(([testimonialsRes, settingsRes]) => {
        setTestimonials(testimonialsRes.data || []);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, refreshKeySettings]);

  // Get unique relationships
  const relationships = ['All', ...Array.from(new Set(testimonials.map(t => t.relationship).filter(Boolean)))];

  const filteredTestimonials = testimonials.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      t.author_name?.toLowerCase().includes(query) ||
      t.author_title?.toLowerCase().includes(query) ||
      t.company?.toLowerCase().includes(query) ||
      t.content?.toLowerCase().includes(query)
    );
    const matchesRelationship = filterRelationship === 'All' || t.relationship === filterRelationship;
    return matchesSearch && matchesRelationship;
  });

  const pageTitle = settings?.testimonials_page_title || 'What People Say';
  const pageSubtitle = settings?.testimonials_page_subtitle || 'Testimonials and endorsements from clients and colleagues';
  const ctaTitle = settings?.testimonials_cta_title || 'Want to Share Your Experience?';
  const ctaDescription = settings?.testimonials_cta_description || 'I\'d love to hear about your experience working with me';
  const ctaButtonText = settings?.testimonials_cta_button_text || 'Leave a Testimonial';
  const emptyMessage = settings?.testimonials_empty_message || 'No testimonials available yet';

  return (
    <div className="min-h-screen py-12 md:py-20 relative">
      <BackToAbout />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

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

        {/* Search & Filter Bar */}
        <div className="glass p-6 rounded-2xl mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, role, company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-heading-light focus:outline-none focus:border-primary"
              />
            </div>

            {/* Relationship Filter */}
            {relationships.length > 1 && (
              <div className="w-full md:w-64">
                <select
                  value={filterRelationship}
                  onChange={e => setFilterRelationship(e.target.value)}
                  className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-heading-light focus:outline-none focus:border-primary cursor-pointer"
                >
                  {relationships.map(rel => (
                    <option key={rel} value={rel} className="bg-bg-dark text-heading-light">
                      {rel === 'All' ? 'All Relationships' : rel}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-text-light text-lg">{searchQuery ? 'No testimonials match your search' : emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {filteredTestimonials.map((test) => {
                const showPhoto = (test.display_photo !== false) && !!test.avatar_url;
                const showName = test.display_name !== false;
                const showTitle = test.display_title !== false;
                const showCompany = test.display_company !== false;

                return (
                  <div key={test.id} className="glass p-8 rounded-3xl relative flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30 border border-white/10">
                    {/* Quote Icon */}
                    <div className="text-primary/20 absolute top-4 right-4">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path>
                      </svg>
                    </div>

                    {/* Content */}
                    <div>
                      <p className="text-text-light italic relative z-10 leading-relaxed text-base">
                        &ldquo;{test.content}&rdquo;
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                      {showPhoto ? (
                        <img
                          src={test.avatar_url}
                          alt={test.author_name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                        />
                      ) : showName ? (
                        <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-xl font-bold text-primary">
                          {test.author_name ? test.author_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      ) : null}

                      <div className="flex-1">
                        {showName && (
                          <h4 className="text-heading-light font-bold text-base">
                            {test.author_name}
                          </h4>
                        )}
                        <div className="text-primary text-sm">
                          {showTitle && test.author_title && <span>{test.author_title}</span>}
                          {showTitle && test.author_title && showCompany && test.company && <span> @ </span>}
                          {showCompany && test.company && <span>{test.company}</span>}
                        </div>
                        {test.relationship && (
                          <div className="mt-1">
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/30">
                              {test.relationship}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Stars */}
                    {test.rating && (
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < test.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
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
                  href="/#testimonials"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-1"
                >
                  {ctaButtonText} &rarr;
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
