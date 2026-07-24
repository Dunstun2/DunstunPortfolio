'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  icon: string;
  image_url: string | null;
  price: string;
  features: string[];
  cta_text: string;
  cta_url: string;
  status: string;
}

export default function ServiceDetailPage() {
  const refreshKeySettings = useRealtimeRefresh('settings');
  const params = useParams();
  const slug = params.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchApi(`/services/${slug}`),
      fetchApi('/settings')
    ])
      .then(([serviceRes, settingsRes]) => {
        setService(serviceRes.data);
        setSettings(settingsRes.data || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch service:', err);
        setError(err.message || 'Service not found');
        setLoading(false);
      });
  }, [slug, refreshKeySettings]);

  const ctaTitle = settings?.services_detail_cta_title || 'Ready to Get Started?';
  const ctaDescription = settings?.services_detail_cta_description || 'Let\'s discuss your project and how I can help bring your vision to life.';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-text-light mt-4">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-heading-light mb-4">Service Not Found</h1>
          <p className="text-text-light mb-8">{error || 'The service you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all"
          >
            &larr; Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors mb-8"
        >
          &larr; Back to Services
        </Link>

        {/* Service Header */}
        <div className="glass rounded-2xl overflow-hidden mb-8">
          {/* Hero Image or Icon */}
          {service.image_url ? (
            <div className="h-96 overflow-hidden relative">
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {service.name}
                </h1>
                {service.price && (
                  <div className="inline-block px-6 py-2 bg-primary rounded-full text-white font-bold text-xl">
                    {service.price}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-b border-text-light/10">
              <div className="text-8xl mb-6">
                {service.icon}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-heading-light mb-4">
                {service.name}
              </h1>
              {service.price && (
                <div className="inline-block px-6 py-2 bg-primary rounded-full text-white font-bold text-xl">
                  {service.price}
                </div>
              )}
            </div>
          )}

          {/* Service Content */}
          <div className="p-8 md:p-12">
            {/* Short Description */}
            {service.short_description && (
              <p className="text-xl text-text-light mb-8 font-medium">
                {service.short_description}
              </p>
            )}

            {/* Full Description */}
            <div className="prose prose-invert max-w-none mb-12">
              <p className="text-text-light leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Features Section */}
            {service.features && service.features.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-6">
                  What's <span className="text-primary">Included</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl bg-black/20 border border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <span className="text-primary text-xl mt-0.5">✓</span>
                      <span className="text-text-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="text-center py-8 px-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <h3 className="text-2xl font-bold text-heading-light mb-4">
                {ctaTitle}
              </h3>
              <p className="text-text-light mb-6 max-w-2xl mx-auto">
                {ctaDescription}
              </p>
              <Link
                href={service.cta_url}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1"
              >
                {service.cta_text || 'Get Started'} &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Related Services CTA */}
        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors"
          >
            View All Services &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
