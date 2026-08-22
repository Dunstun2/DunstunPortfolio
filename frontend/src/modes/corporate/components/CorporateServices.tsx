'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import { useSearchParams } from 'next/navigation';
import { InnerSortableLayout } from '@/templateEngine/components/InnerSortableLayout';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';
import type { TemplateSectionProps } from '@/templateEngine/types';

interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  icon: string;
  image_url: string | null;
  price: string;
  features: string[];
  cta_text: string;
  cta_url: string;
  featured: boolean;
  external_link?: string;
}

const MAX_VISIBLE_FEATURES = 3;

export default function ServicesSection({ config, variant = 'highlights' }: TemplateSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const refreshKey = useRealtimeRefresh('services');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [cardOrder, setCardOrder] = useState<string[]>(['image', 'title', 'description', 'features', 'price', 'cta']);

  useEffect(() => {
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.service_card;
    if (configOrder && configOrder.length > 0) {
      setCardOrder(configOrder);
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_service_card'] = cardOrder;
    }
  }, [cardOrder, isPreview]);

  const [businessType, setBusinessType] = useState<string>('both');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/corporate/services/published').catch(() => fetchApi('/services/published')),
      fetchApi('/settings'),
      fetchApi('/corporate/about/published').catch(() => fetchApi('/about'))
    ])
      .then(([servicesRes, settingsRes, aboutRes]) => {
        let data = servicesRes.data || [];
        if (variant === 'highlights') {
          const featured = data.filter((s: Service) => s.featured);
          data = featured.length > 0 ? featured.slice(0, 3) : data.slice(0, 3);
        }
        setServices(data);
        setSettings(settingsRes.data || {});

        const aboutData = aboutRes?.data;
        let corpData = (Array.isArray(aboutData) ? aboutData[0]?.corporate_data : aboutData?.corporate_data) || {};
        while (typeof corpData === 'string') {
          try { corpData = JSON.parse(corpData); } catch { break; }
        }
        if (corpData.business_type) {
          setBusinessType(corpData.business_type);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setLoading(false);
      });
  }, [refreshKey, refreshKeySettings, variant]);

  if (businessType === 'products') return null;


  if (loading) {
    return (
      <section id="services" className="py-2 md:py-4 bg-bg-dark/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-text-light/50">Loading services...</div>
        </div>
      </section>
    );
  }

  if (!services.length) return null;

  const sectionTitle = settings?.services_section_title || 'What I Offer';

  return (
    <section id="services" className="pt-6 md:pt-10 pb-8 md:pb-12 bg-bg-dark/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
            <ColoredTitle settingKey="services_section_title" title={sectionTitle} />
          </h2>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          (() => {
            const serviceIds = services.map(s => s.id);

            const handleReorder = (newIds: string[]) => {
              const newServices = newIds.map(id => services.find(s => s.id === id)!).filter(Boolean);
              setServices(newServices);

              window.__PREVIEW_DATA_REORDER__ = window.__PREVIEW_DATA_REORDER__ || {};
              window.__PREVIEW_DATA_REORDER__['services'] = newIds;
            };

            const renderService = (id: string) => {
              const service = services.find(s => s.id === id);
              if (!service) return null;
              
              const isMobileExpanded = expandedCards[service.id];
              const features = service.features || [];
              const visibleFeatures = isMobileExpanded ? features : features.slice(0, MAX_VISIBLE_FEATURES);
              const remainingCount = Math.max(0, features.length - MAX_VISIBLE_FEATURES);

              const renderCardItem = (itemKey: string) => {
                switch (itemKey) {
                  case 'image':
                    return (
                      <div className="h-48 overflow-hidden relative w-full">
                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                        <InlineResourceImage
                          resource="services" id={service.id} field="image_url"
                          currentSrc={service.image_url} alt={service.name}
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                          width={600}
                          height={400}
                        />
                      </div>
                    );
                  case 'title':
                    return (
                      <div className="px-6 pt-6 w-full">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light mb-2">
                          <InlineResourceText resource="services" id={service.id} field="name" defaultValue={service.name} />
                        </h3>
                      </div>
                    );
                  case 'description':
                    return (
                      <div className="px-6 py-1 w-full">
                        <p className={`text-text-light text-sm mb-4 ${isMobileExpanded ? '' : 'line-clamp-3 md:line-clamp-3'}`}>
                          <InlineResourceText resource="services" id={service.id} field="short_description" multiline defaultValue={service.short_description || service.description} />
                        </p>
                      </div>
                    );
                  case 'features':
                    return visibleFeatures.length > 0 ? (
                      <div className="px-6 py-1 space-y-2 mb-3 w-full">
                        <InlineEditableList
                          resource="services"
                          id={service.id}
                          field="features"
                          items={features}
                          placeholder="Add feature"
                          renderItem={(text, _idx) => (
                            <div className="flex items-start gap-2">
                              <span className="text-primary text-sm flex-shrink-0 mt-0.5">✓</span>
                              <span className="text-text-light text-sm">{text}</span>
                            </div>
                          )}
                        />
                        {!isMobileExpanded && remainingCount > 0 && (
                          <p className="text-text-light/50 text-xs mt-1">
                            + {remainingCount} more feature{remainingCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ) : null;
                  case 'price':
                    return service.price ? (
                      <div className="px-6 py-1 text-primary font-bold text-base md:text-lg mt-2 w-full">
                        <InlineResourceText resource="services" id={service.id} field="price" defaultValue={service.price} />
                      </div>
                    ) : null;
                  case 'cta':
                    return (
                      <div className="px-6 pb-6 pt-1 flex items-center justify-between gap-3 w-full mt-auto">
                        {variant === 'highlights' ? (
                          <InlineButtonLink
                            href={service.cta_url?.startsWith('http') ? service.cta_url : `/services#${service.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            <InlineResourceText resource="services" id={service.id} field="cta_text" defaultValue={service.cta_text || 'Learn More'} /> &rarr;
                          </InlineButtonLink>
                        ) : (
                          <>
                            <InlineButtonLink
                              href={`/services/${service.slug}`}
                              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                              <InlineResourceText resource="services" id={service.id} field="cta_text" defaultValue={service.cta_text || 'Learn More'} /> &rarr;
                            </InlineButtonLink>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isInlineEditing) {
                                  const editable = (e.currentTarget as HTMLElement).querySelector('[contenteditable="true"]') as HTMLElement;
                                  editable?.focus();
                                  return;
                                }
                                setExpandedCards(prev => ({
                                  ...prev,
                                  [service.id]: !prev[service.id]
                                }));
                              }}
                              className="md:hidden inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                              {isMobileExpanded ? 'Show Less ↑' : `${service.cta_text || 'Learn More'} ↓`}
                            </button>
                          </>
                        )}
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
                    );
                  default:
                    return null;
                }
              };

              return (
                <div className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between h-full w-full">
                  <InnerSortableLayout
                    items={cardOrder}
                    onReorder={setCardOrder}
                    renderItem={renderCardItem}
                    isPreview={isPreview}
                    className="flex flex-col h-full w-full"
                  />
                </div>
              );
            };

            return (
              <InnerSortableLayout
                items={serviceIds}
                onReorder={handleReorder}
                renderItem={renderService}
                isPreview={isPreview}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative z-10"
              />
            );
          })()
        ) : null}

        {/* View All Services Button */}
        {variant === 'highlights' && (
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-transparent border-2 border-primary rounded-full hover:bg-primary hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1"
            >
              View All Services
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
