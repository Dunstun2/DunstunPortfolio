'use client';
import SectionTitle from '@/components/SectionTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  icon: string;
  image_url: string | null;
  price: string;
  cta_text: string;
  cta_url: string;
  featured: boolean;
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const refreshKey = useRealtimeRefresh('services');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/services/featured'),
      fetchApi('/settings')
    ])
      .then(([servicesRes, settingsRes]) => {
        setServices(servicesRes.data || []);
        setSettings(settingsRes.data || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch featured services:', err);
        setLoading(false);
      });
  }, [refreshKey, refreshKeySettings]);

  if (loading) {
    return (
      <section id="services" className="py-12 md:py-16 bg-bg-dark/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-text-light/50">Loading services...</div>
        </div>
      </section>
    );
  }

  if (!services.length) return null;

  const sectionTitle = settings?.services_section_title || 'What I Offer';
  const sectionSubtitle = settings?.services_section_subtitle || 'Professional services tailored to bring your ideas to life';

  return (
    <section id="services" className="py-12 md:py-16 bg-bg-dark/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
            <SectionTitle title={sectionTitle} />
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                {service.image_url ? (
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 bg-black/10 flex items-center justify-center border-b border-text-light/10 relative">
                    <span className="text-text-light/50 font-bold">No Cover Image</span>
                  </div>
                )}

                {/* Content Container */}
                <div className="p-6 pb-2">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light mb-2">
                    {service.name}
                  </h3>

                  {service.short_description && (
                    <p className="text-text-light text-sm mb-2 line-clamp-3">
                      {service.short_description}
                    </p>
                  )}

                  {service.price && (
                    <div className="text-primary font-bold text-base md:text-lg mt-2">
                      {service.price}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Link */}
              <div className="px-6 pb-6 pt-1 flex items-center justify-between gap-3">
                <Link
                  href={service.cta_url?.startsWith('http') ? service.cta_url : `/services#${service.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {service.cta_text || 'Learn More'} &rarr;
                </Link>
                {service.external_link && (
                  <a
                    href={service.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs md:text-sm text-text-light hover:text-primary transition-colors truncate max-w-[150px]"
                    title={service.external_link}
                  >
                    🔗 <span className="truncate underline">{service.external_link.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-transparent border-2 border-primary rounded-full hover:bg-primary hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
