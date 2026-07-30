'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: string;
  features: string[];
  external_link: string;
  video_url: string | null;
  status: string;
  display_order: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}
import BackToAbout from '@/components/BackToAbout';

export default function ServicesPage() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const refreshKey = useRealtimeRefresh('settings');
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent, serviceSlug: string, serviceId: string) => {
    if (window.innerWidth < 768) {
      setExpandedCards(prev => ({
        ...prev,
        [serviceId]: !prev[serviceId]
      }));
    } else {
      router.push(`/services/${serviceSlug}`);
    }
  };

  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi(`/services/published?page=${currentPage}&limit=20`),
      fetchApi('/settings')
    ])
      .then(([servicesRes, settingsRes]) => {
        setServices(servicesRes.data || []);
        setPagination(servicesRes.pagination || null);
        setSettings(settingsRes.data || {});
        setLoading(false);
        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setLoading(false);
      });
  }, [currentPage, refreshKey]);

  const pageTitle = settings?.services_page_title || 'My Services';
  const pageSubtitle = settings?.services_page_subtitle || 'Professional services to help you build, grow, and succeed';
  const ctaTitle = settings?.services_cta_title || 'Need a Custom Solution?';
  const ctaDescription = settings?.services_cta_description || 'Don\'t see exactly what you\'re looking for? Let\'s discuss your unique needs and create a tailored solution.';
  const ctaButtonText = settings?.services_cta_button_text || 'Get in Touch';

  return (
    <div className="min-h-screen py-12 md:py-20">
      <BackToAbout />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            {pageTitle.split(' ').filter(w => w.trim() !== '').map((word: string, i: number) => {
              let colorClass = 'text-heading-light';
              if (i === 0) colorClass = 'text-orange-500';
              else if (i === 2) colorClass = 'text-blue-500';
              
              return (
                <span key={i} className={colorClass}>
                  {word}{' '}
                </span>
              );
            })}
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-text-light mt-4">Loading services...</p>
          </div>
        )}

        {/* Services List */}
        {!loading && services.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {services.map((service) => (
                <div
                  key={service.id}
                  id={service.slug}
                  onClick={(e) => handleCardClick(e, service.slug, service.id)}
                  className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] flex flex-col cursor-pointer"
                >
                  {/* Service Image or Icon */}
                  {service.image_url ? (
                    <div className="h-48 md:h-56 overflow-hidden relative">
                      <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={service.image_url}
                        alt={service.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 md:h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-text-light/10">
                      <span className="text-5xl md:text-6xl font-bold text-primary/30">{service.name[0]}</span>
                    </div>
                  )}

                  {/* Service Content */}
                  <div className="p-6 md:p-8 flex-grow flex flex-col">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-heading-light mb-2 md:mb-3">
                      {service.name}
                    </h2>

                    <p className={`text-text-light text-sm md:text-base mb-3 md:mb-4 flex-grow ${expandedCards[service.id] ? '' : 'line-clamp-2 md:line-clamp-3'}`}>
                      {service.description}
                    </p>

                    {/* Price */}
                    {service.price && (
                      <div className="text-primary font-bold text-lg md:text-xl mb-3 md:mb-4">
                        {service.price}
                      </div>
                    )}

                    {/* Features Preview */}
                    {expandedCards[service.id] && service.video_url && (
                      <div className="mb-4 md:mb-6 rounded-xl overflow-hidden bg-black/20 aspect-video relative md:hidden">
                        <video 
                          src={service.video_url} 
                          controls 
                          className="absolute inset-0 w-full h-full object-contain"
                          preload="metadata"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                        {service.features.slice(0, expandedCards[service.id] ? undefined : 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-text-light text-xs md:text-sm">
                            <span className="text-primary mt-0.5 md:mt-1">✓</span>
                            <span className={expandedCards[service.id] ? '' : 'line-clamp-1'}>{feature}</span>
                          </li>
                        ))}
                        {!expandedCards[service.id] && service.features.length > 3 && (
                          <li className="text-text-light/70 text-xs md:text-sm">
                            + {service.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Learn More Link & External Link */}
                    <div className="flex items-center justify-between gap-3 mt-auto">
                      <span className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                        <span className="md:hidden">
                          {expandedCards[service.id] ? 'Show Less ↑' : 'Learn More ↓'}
                        </span>
                        <span className="hidden md:inline">
                          Learn More &rarr;
                        </span>
                      </span>
                      {service.external_link && (
                        <a
                          href={service.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs md:text-sm text-text-light hover:text-primary transition-colors truncate max-w-[180px]"
                          title={service.external_link}
                        >
                          🔗 <span className="truncate underline">{service.external_link.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(pagination.prevPage!)}
                  disabled={!pagination.hasPrevPage}
                  className="px-6 py-3 rounded-full font-bold text-white bg-primary/80 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  &larr; Previous
                </button>

                {/* Page Info */}
                <span className="text-text-light">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(pagination.nextPage!)}
                  disabled={!pagination.hasNextPage}
                  className="px-6 py-3 rounded-full font-bold text-white bg-primary/80 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-light text-xl">No services available at the moment.</p>
          </div>
        )}


      </div>
    </div>
  );
}
