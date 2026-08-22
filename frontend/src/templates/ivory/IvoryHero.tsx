'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { getOptimizedImageUrl } from '@/utils/urls';
import CorporateHero from '@/modes/corporate/components/CorporateHero';

export default function IvoryHero({ config }: TemplateSectionProps) {
  const [heroData, setHeroData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('hero');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/hero/published').then(res => setHeroData(res.data)).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateHero />;
  }

  if (!heroData) return null;

  return (
    <section className="relative min-h-[90vh] bg-bg-dark flex flex-col md:flex-row overflow-hidden border-b border-text-light/10 pt-24 md:pt-0">
      
      {/* Left Text Content */}
      <div className="w-full md:w-1/2 flex items-center p-8 md:p-16 lg:p-24 z-10">
        <div className="max-w-xl w-full">
          {heroData.greeting && (
            <div className="text-secondary font-semibold tracking-wider uppercase text-sm md:text-base mb-2 animate-fade-in-up">
              {heroData.greeting}, I am{heroData.title_prefix ? ` ${heroData.title_prefix}` : ''}
            </div>
          )}
          {!heroData.greeting && heroData.title_prefix && (
            <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
              <div className="w-12 h-[2px] bg-primary"></div>
              <span className="text-primary font-bold tracking-widest uppercase text-sm md:text-base">
                {heroData.title_prefix}
              </span>
            </div>
          )}
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black text-heading-light mb-6 tracking-tighter leading-[1.1] animate-fade-in-up delay-100">
            {heroData.headline}
          </h1>
          
          {heroData.professional_title && (
            <h2 className="text-2xl md:text-3xl text-text-light/90 font-light mb-6 animate-fade-in-up delay-200">
              {heroData.professional_title}
            </h2>
          )}
          
          {heroData.subheadline && (
            <p className="text-lg text-muted-light mb-6 leading-relaxed max-w-lg animate-fade-in-up delay-300">
              {heroData.subheadline}
            </p>
          )}

          {heroData.highlighted_text && (
            <p className="text-xl md:text-2xl font-semibold text-primary/90 italic mb-8 animate-fade-in-up delay-300">
              {heroData.highlighted_text}
            </p>
          )}
          
          {/* Availability Badge */}
          {heroData.show_availability && heroData.availability_text && (
            <div className="mb-8 animate-fade-in-up delay-300">
              {heroData.availability_link ? (
                <Link href={heroData.availability_link} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-text-light/5 border border-text-light/10 hover:border-primary/50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${heroData.availability_type === 'available' ? 'bg-green-500' : heroData.availability_type === 'busy' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-sm font-medium text-text-light">{heroData.availability_text}</span>
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-text-light/5 border border-text-light/10">
                  <div className={`w-2.5 h-2.5 rounded-full ${heroData.availability_type === 'available' ? 'bg-green-500' : heroData.availability_type === 'busy' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-sm font-medium text-text-light">{heroData.availability_text}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-400">
            {heroData.cta_buttons?.filter((btn: any) => !btn.is_hidden).map((btn: any, idx: number) => {
              const baseClasses = "px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300";
              const styleClasses = btn.style === 'primary' 
                ? 'bg-heading-light text-bg-dark hover:bg-primary hover:text-white hover:scale-105 shadow-lg' 
                : 'bg-transparent text-heading-light border-2 border-heading-light/20 hover:border-heading-light hover:bg-heading-light/5';
              const className = `${baseClasses} ${styleClasses}`;
              
              if (btn.link_type === 'file') {
                const handleDownload = async (e: React.MouseEvent) => {
                  e.preventDefault();
                  const url = btn.target || '';
                  if (!url) return;
                  if (url.includes('cloudinary.com')) {
                    const dlUrl = url.replace('/upload/', '/upload/fl_attachment/');
                    window.open(dlUrl, '_blank');
                  } else {
                    window.open(url, '_blank');
                  }
                };
                return <button key={idx} onClick={handleDownload} className={className}>{btn.label}</button>;
              }
              if (btn.link_type === 'view') {
                const handleView = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const url = btn.target || '';
                  if (!url) return;
                  const ext = url.split('.').pop()?.toLowerCase() || '';
                  const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
                  if (officeExts.includes(ext)) {
                    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`, '_blank');
                  } else {
                    window.open(url, '_blank');
                  }
                };
                return <button key={idx} onClick={handleView} className={className}>{btn.label}</button>;
              }
              return (
                <Link
                  key={idx}
                  href={btn.target || '#'}
                  target={btn.link_type === 'external' ? '_blank' : '_self'}
                  className={className}
                >
                  {btn.label}
                </Link>
              );
            })}
          </div>

          {/* Social Links */}
          {heroData.show_social_links && heroData.social_links?.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-text-light/10 animate-fade-in-up delay-500">
              {heroData.social_links.filter((s: any) => s.is_favorite).map((social: any) => {
                const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
                return (
                  <Link 
                    key={social.id} 
                    href={href} 
                    target="_blank" 
                    className="w-10 h-10 rounded-full bg-text-light/5 border border-text-light/10 flex items-center justify-center text-text-light hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                    title={social.platform_name}
                  >
                    {getSocialIcon(social.platform_name)}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Visual Element (Split Screen) */}
      <div className="w-full md:w-1/2 relative min-h-[40vh] md:min-h-full bg-text-light/5 flex items-center justify-center p-12">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative w-full max-w-lg aspect-square animate-fade-in-up delay-500">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute inset-10 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply translate-x-10 translate-y-10"></div>
          
          <div className="relative w-full h-full border border-text-light/20 rounded-[2rem] overflow-hidden bg-bg-dark/50 backdrop-blur-sm flex flex-col items-center justify-center">
            {heroData.image_url ? (
              <img
                src={getOptimizedImageUrl(heroData.image_url, { width: 1200 })}
                alt={heroData.photo_alt_text || heroData.headline}
                className="w-full h-full object-cover transition-all duration-1000"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-8">
                <div className="flex justify-between items-start mb-auto w-full">
                  <div className="text-4xl font-heading text-heading-light font-black tracking-tighter">
                    {heroData.professional_title?.split(' ')[0] || 'DESIGN'}
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                </div>
                <div className="mt-auto w-full text-left">
                  <div className="text-sm font-mono text-muted-light mb-2 uppercase tracking-widest border-b border-text-light/10 pb-2">Status</div>
                  <div className="text-lg text-text-light font-medium">Available for work</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative floating dots */}
          <div className="absolute -right-4 top-1/4 w-2 h-2 rounded-full bg-text-light/50"></div>
          <div className="absolute -left-8 bottom-1/3 w-3 h-3 rounded-full bg-primary/80"></div>
          <div className="absolute top-0 right-1/4 w-1.5 h-1.5 rounded-full bg-secondary/80"></div>
        </div>
      </div>
      
    </section>
  );
}
