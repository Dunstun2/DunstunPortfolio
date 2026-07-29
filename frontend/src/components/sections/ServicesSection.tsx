'use client';
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
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading-light mb-3 md:mb-4">
            {sectionTitle.split(' ').map((word: string, i: number, arr: string[]) => (
              i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
            ))}
          </h2>
          <p className="text-text-light text-base md:text-lg max-w-2xl mx-auto px-4">
            {sectionSubtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="glass rounded-2xl p-6 md:p-8 group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)] flex flex-col"
            >
              {/* Cover Image */}
              {service.image_url && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden mb-4 md:mb-6 group-hover:scale-105 transition-transform">
                  <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Service Name */}
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light mb-2 md:mb-3">
                {service.name}
              </h3>

              {/* Short Description */}
              {service.short_description && (
                <p className="text-text-light text-sm mb-3 md:mb-4 flex-grow line-clamp-2 md:line-clamp-3">
                  {service.short_description}
                </p>
              )}

              {/* Price */}
              {service.price && (
                <div className="text-primary font-bold text-base md:text-lg mb-4 md:mb-6">
                  {service.price}
                </div>
              )}

              {/* CTA Button */}
              <Link
                href={service.cta_url?.startsWith('http') ? service.cta_url : `/services/${service.slug}`}
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-bold text-white bg-primary/80 rounded-full hover:bg-primary transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] group-hover:translate-x-1"
              >
                {service.cta_text || 'Learn More'} &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-transparent border-2 border-primary rounded-full hover:bg-primary hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1"
          >
            View All Services &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
