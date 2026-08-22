'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';
import { getOptimizedImageUrl } from '@/utils/urls';
import CorporateTestimonials from '@/modes/corporate/components/CorporateTestimonials';

export default function IvoryTestimonials({ config, variant = 'full' }: TemplateSectionProps) {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('testimonial');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/testimonials/published').then(res => {
        if (res.success) {
          let data = res.data || [];
          if (variant === 'highlights') {
            data = data.slice(0, 3);
          }
          setTestimonials(data);
        }
      }).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings, variant]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateTestimonials variant={variant} />;
  }

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="py-32 bg-bg-dark">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="testimonials_section_subtitle" defaultValue="Endorsements" />
              </span>
          <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
            <ColoredTitle settingKey="testimonials_section_title" title={settings.testimonials_section_title || 'What People Say'} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t: any) => (
            <div 
              key={t.id} 
              className="p-10 rounded-[2rem] bg-text-light/5 border border-text-light/10 flex flex-col justify-between"
            >
              <div className="text-primary text-4xl font-serif mb-6 opacity-30">&ldquo;</div>
              
              <p className="text-text-light/80 text-lg leading-relaxed mb-8 italic">
                <InlineResourceText resource="testimonials" id={t.id} field="content" multiline defaultValue={t.content} />
              </p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-text-light/10">
                {t.avatar_url ? (
                  <img 
                    src={getOptimizedImageUrl(t.avatar_url, { width: 100, height: 100 })} 
                    alt={t.author_name} 
                    className="w-12 h-12 rounded-full object-cover grayscale" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-text-light/10 flex items-center justify-center font-bold text-heading-light font-heading">
                    {t.author_name ? t.author_name.charAt(0) : '?'}
                  </div>
                )}
                
                <div>
                  <h3 className="font-heading font-bold text-heading-light">
                    <InlineResourceText resource="testimonials" id={t.id} field="author_name" defaultValue={t.author_name} />
                  </h3>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-light">
                    {t.author_title && <span><InlineResourceText resource="testimonials" id={t.id} field="author_title" defaultValue={t.author_title} /></span>}
                    {t.author_title && t.company && <span> @ </span>}
                    {t.company && <span><InlineResourceText resource="testimonials" id={t.id} field="company" defaultValue={t.company} /></span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {variant === 'highlights' && (
          <div className="text-center mt-16">
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-text-light/20 text-heading-light font-bold hover:bg-text-light/10 hover:border-text-light/40 transition-all duration-300"
            >
              View All Testimonials
            </Link>
          </div>
        )}
        
      </div>
    </section>
  );
}
