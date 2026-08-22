'use client';
import { useState, useEffect } from 'react';
import Link from '@/components/PreviewLink';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineText from '@/templateEngine/components/InlineText';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

export default function IvoryNavbar({ config }: TemplateSectionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get('preview_template');
  const isPreview = !!previewSlug;
  const [isOpen, setIsOpen] = useState(false);
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);

  const [settings, setSettings] = useState<any>(null);

  const [businessType, setBusinessType] = useState<string>('both');

  useEffect(() => {
    Promise.all([
      fetchApi('/sections/available').then(res => setAvailableSections(res.data)).catch(() => setAvailableSections({})),
      fetchApi('/settings').then(res => setSettings(res.data || {})).catch(() => {}),
      fetchApi('/corporate/about/published')
        .catch(() => fetchApi('/about'))
        .then(res => {
          const aboutData = res?.data;
          let corpData = (Array.isArray(aboutData) ? aboutData[0]?.corporate_data : aboutData?.corporate_data) || {};
          while (typeof corpData === 'string') {
            try { corpData = JSON.parse(corpData); } catch { break; }
          }
          if (corpData.business_type) {
            setBusinessType(corpData.business_type);
          }
        })
        .catch(() => {})
    ]);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const isCorporate = availableSections?.site_mode === 'corporate' || settings?.site_mode === 'corporate';

  const rawNavLinks = config?.navigationItems || [];
  let navLinks = availableSections
    ? rawNavLinks.filter((link: any) => availableSections[link.key] !== false)
    : rawNavLinks;

  if (isCorporate) {
    if (businessType === 'services') {
      navLinks = navLinks.filter((link: any) => link.key !== 'projects');
    } else if (businessType === 'products') {
      navLinks = navLinks.filter((link: any) => link.key !== 'services');
    }
  }


  const visibleLinks = navLinks;

  const defaultLogo = availableSections?.site_mode === 'corporate' ? 'BUSINESS CO.' : 'PORTFOLIO.';

  return (
    <nav className={`fixed ${isPreview ? 'top-[5rem]' : 'top-6'} left-0 right-0 z-50 px-4 flex justify-center w-full pointer-events-none transition-all duration-300`}>
      <div className="bg-bg-dark/90 backdrop-blur-md border border-text-light/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2rem] px-6 sm:px-8 py-3 flex items-center justify-between w-full max-w-5xl pointer-events-auto transition-all duration-300">
        <div className="flex-shrink-0">
          <InlineButtonLink href="/" onClick={() => setIsOpen(false)} className="text-xl font-heading font-extrabold text-heading-light tracking-tight">
            <InlineText settingKey="site_name" defaultValue={defaultLogo}>
              {settings?.site_name || defaultLogo}
            </InlineText>
          </InlineButtonLink>
        </div>
        <div className="hidden md:block">
          <div className="ml-8 flex items-center space-x-2">
            {visibleLinks.map((link: any) => (
              <Link 
                key={link.key} 
                href={link.href} 
                className="text-text-light/80 hover:text-primary px-3 py-1.5 text-sm font-medium hover:bg-text-light/5 rounded-full transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center ml-auto md:ml-4 gap-4">
          <ThemeToggle />
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-light hover:text-primary p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-20 left-4 right-4 md:hidden bg-bg-dark border border-text-light/10 shadow-2xl rounded-2xl p-4 pointer-events-auto">
          <div className="flex flex-col space-y-1">
            {visibleLinks.map((link: any) => (
              <Link 
                key={link.key} 
                href={link.href} 
                onClick={() => setIsOpen(false)} 
                className="text-text-light/90 hover:text-primary hover:bg-text-light/5 block px-4 py-3 rounded-xl text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
