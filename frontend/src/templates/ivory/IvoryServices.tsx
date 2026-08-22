'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';
import { getOptimizedImageUrl } from '@/utils/urls';
import CorporateServices from '@/modes/corporate/components/CorporateServices';

export default function IvoryServices({ config, variant = 'full' }: TemplateSectionProps) {
  const { isInlineEditing } = useInlineEdit();
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('service');
  const refreshKeySettings = useRealtimeRefresh('settings');

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetchApi('/services/published').then(res => {
        if (res.success) {
          let data = res.data || [];
          if (variant === 'highlights') {
            const featured = data.filter((s: any) => s.featured);
            data = featured.length > 0 ? featured.slice(0, 3) : data.slice(0, 3);
          }
          setServices(data);
        }
      }).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings, variant]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateServices variant={variant} />;
  }

  if (!services.length) return null;

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="services" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="services_section_subtitle" defaultValue="Expertise" />
              </span>
          <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
            <ColoredTitle settingKey="services_section_title" title={settings.services_section_title || 'Services'} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, idx: number) => {
            const isExpanded = !!expandedCards[service.id];
            const isMobileExpanded = variant === 'full' && isExpanded;
            const featuresList = service.features || [];
            const visibleFeatures = isMobileExpanded ? featuresList : featuresList.slice(0, 3);
            const remainingCount = Math.max(0, featuresList.length - 3);

            return (
              <div 
                key={service.id} 
                className="group p-10 rounded-[2rem] bg-text-light/5 hover:bg-text-light/10 border border-text-light/10 transition-colors duration-500 flex flex-col h-full relative overflow-hidden"
              >
                {service.image_url ? (
                  <div className="absolute top-0 right-0 w-32 h-32 transition-opacity duration-500 pointer-events-none rounded-bl-full overflow-hidden z-0">
                    <img
                      src={getOptimizedImageUrl(service.image_url, { width: 600, height: 400 })}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="text-4xl text-primary mb-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 origin-left">
                    {service.icon ? <i className={service.icon}></i> : <i className="fas fa-cube"></i>}
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-heading-light mb-4">
                    <InlineResourceText resource="services" id={service.id} field="name" defaultValue={service.name} />
                  </h3>
                  
                  {service.price && (
                    <div className="inline-block bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider mb-4 w-fit">
                      <InlineResourceText resource="services" id={service.id} field="price" defaultValue={service.price} />
                    </div>
                  )}
                  
                  <p className={`text-text-light/80 leading-relaxed ${isMobileExpanded ? '' : 'line-clamp-3'}`}>
                    {isMobileExpanded ? (service.description || service.short_description) : (service.short_description || service.description)}
                  </p>

                  {/* Features List */}
                  {visibleFeatures.length > 0 && (
                    <div className="space-y-2 mt-4 mb-3">
                      {visibleFeatures.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-text-light/70">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                      {!isMobileExpanded && remainingCount > 0 && (
                        <p className="text-text-light/40 text-xs mt-1">
                          + {remainingCount} more feature{remainingCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-auto pt-8 border-t border-text-light/10 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-widest font-mono text-muted-light group-hover:text-primary transition-colors">
                      0{idx + 1}
                    </span>
                    
                    <div className="flex items-center gap-4">
                      {service.external_link && (
                        <a href={service.external_link} target="_blank" rel="noreferrer" className="text-text-light/40 hover:text-primary transition-colors">
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                      
                      {variant === 'highlights' ? (
                        <InlineButtonLink
                          href={service.cta_url?.startsWith('http') ? service.cta_url : `/services#${service.slug}`}
                          className="text-sm font-bold text-heading-light group-hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <InlineResourceText resource="services" id={service.id} field="cta_text" defaultValue={service.cta_text || 'Learn More'} /> <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-500"></i>
                        </InlineButtonLink>
                      ) : (
                        <>
                          {/* Desktop Link */}
                          <InlineButtonLink
                            href={`/services/${service.slug}`}
                            className="hidden md:flex text-sm font-bold text-heading-light group-hover:text-primary transition-colors items-center gap-2"
                          >
                            <InlineResourceText resource="services" id={service.id} field="cta_text" defaultValue={service.cta_text || 'Learn More'} /> <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-500"></i>
                          </InlineButtonLink>
                          {/* Mobile Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (isInlineEditing) {
                                const editable = (e.currentTarget as HTMLElement).querySelector('[contenteditable="true"]') as HTMLElement;
                                editable?.focus();
                                return;
                              }
                              toggleExpand(service.id);
                            }}
                            className="md:hidden text-sm font-bold text-heading-light group-hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {isExpanded ? 'Show Less' : <InlineResourceText resource="services" id={service.id} field="cta_text" defaultValue={service.cta_text || 'Learn More'} />} <i className={`fas ${isExpanded ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {variant === 'highlights' && (
          <div className="text-center mt-16">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-text-light/20 text-heading-light font-bold hover:bg-text-light/10 hover:border-text-light/40 transition-all duration-300"
            >
              View All Services
            </Link>
          </div>
        )}
        
      </div>
    </section>
  );
}
