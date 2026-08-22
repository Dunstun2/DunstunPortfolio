'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { useParams } from 'next/navigation';
import Link from '@/components/PreviewLink';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';

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
}

export default function ServiceDetailPage() {
  const { isInlineEditing } = useInlineEdit();
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
    <div className="min-h-screen pt-8 pb-12 md:pb-20">
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
          {/* Hero: Image or Placeholder */}
          {(service.image_url || isInlineEditing) ? (
            <div className="overflow-hidden relative min-h-[300px]">
              <InlineResourceImage
                resource="services"
                id={service.id}
                field="image_url"
                currentSrc={service.image_url || ''}
                alt={service.name}
                className="w-full h-auto"
                wrapperClassName="w-full h-full"
                width={1000}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  <InlineResourceText resource="services" id={service.id} field="name" defaultValue={service.name} />
                </h1>
                {(service.price || isInlineEditing) && (
                  <div className="inline-block px-6 py-2 bg-primary rounded-full text-white font-bold text-xl">
                    <InlineResourceText resource="services" id={service.id} field="price" defaultValue={service.price || ''} placeholder="Set Price" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-b border-text-light/10 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="text-8xl mb-6 font-bold text-primary/20">{service.name[0]}</div>
              <h1 className="text-4xl md:text-6xl font-bold text-heading-light mb-4">
                <InlineResourceText resource="services" id={service.id} field="name" defaultValue={service.name} />
              </h1>
              {(service.price || isInlineEditing) && (
                <div className="inline-block px-6 py-2 bg-primary rounded-full text-white font-bold text-xl">
                  <InlineResourceText resource="services" id={service.id} field="price" defaultValue={service.price || ''} placeholder="Set Price" />
                </div>
              )}
            </div>
          )}

          {/* Service Content */}
          <div className="p-8 md:p-12">
            {/* Full Description */}
            <div className="prose prose-invert max-w-none mb-12">
              <p className="text-text-light leading-relaxed whitespace-pre-line">
                <InlineResourceText resource="services" id={service.id} field="description" multiline defaultValue={service.description} />
              </p>
            </div>

            {/* Features Section */}
            {(service.features || isInlineEditing) && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-6">
                  What's <span className="text-primary">Included</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InlineEditableList
                    resource="services"
                    id={service.id}
                    field="features"
                    items={service.features || []}
                    placeholder="Add feature"
                    renderItem={(feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-xl bg-black/20 border border-primary/20 hover:border-primary/40 transition-colors w-full"
                      >
                        <span className="text-primary text-xl mt-0.5">✓</span>
                        <span className="text-text-light">{feature}</span>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Video Section */}
            {service.video_url && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-6">
                  See It In <span className="text-primary">Action</span>
                </h2>
                <div className="rounded-xl overflow-hidden border border-primary/20 bg-black">
                  <video
                    src={service.video_url}
                    controls
                    playsInline
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
              </div>
            )}

            {/* External Link */}
            {service.external_link && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-text-light text-sm">🔗</span>
                <a
                  href={service.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {service.external_link}
                </a>
              </div>
            )}
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
