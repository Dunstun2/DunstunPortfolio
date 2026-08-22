'use client';
import { useState, useEffect } from 'react';
import Link from '@/components/PreviewLink';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineText from '@/templateEngine/components/InlineText';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

import { useSiteMode } from '@/utils/useSiteMode';

const ALL_NAV_LINKS = [
  { key: 'about', label: 'About', href: '/about' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'projects', label: 'Projects', href: '/projects' },
  { key: 'achievements', label: 'Achievements', href: '/achievements' },
  { key: 'education', label: 'Education', href: '/education' },
  { key: 'experience', label: 'Experience', href: '/experience' },
  { key: 'skills', label: 'Skills', href: '/skills' },
  { key: 'events', label: 'Events', href: '/events' },
  { key: 'blog', label: 'Blog', href: '/blog' },
  { key: 'testimonials', label: 'Testimonials', href: '/testimonials' },
  { key: 'contact', label: 'Contact', href: '/contact' },
];

export default function ObsidianNavbar({ config }: TemplateSectionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get('preview_template');
  const isPreview = !!previewSlug;
  const [isOpen, setIsOpen] = useState(false);
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const refreshKeySettings = useRealtimeRefresh('settings');
  const { isCorporate, siteMode } = useSiteMode();

  const [businessType, setBusinessType] = useState<string>('both');

  useEffect(() => {
    Promise.all([
      fetchApi(`/sections/available?mode=${siteMode}`)
        .then(res => setAvailableSections(res.data))
        .catch(() => {
          const all: Record<string, boolean> = {};
          ALL_NAV_LINKS.forEach(l => { all[l.key] = true; });
          setAvailableSections(all);
        }),
      fetchApi('/settings')
        .then(res => setSettings(res.data || {}))
        .catch(() => { }),
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
        .catch(() => { })
    ]);
  }, [refreshKeySettings, siteMode]);

  const { isInlineEditing } = useInlineEdit();

  if (pathname?.startsWith('/admin')) return null;

  // Use template navigation items if available, otherwise fall back
  const rawNavLinks = config?.navigationItems || ALL_NAV_LINKS;
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

  return (
    <nav className={`fixed ${isPreview ? 'top-[44px]' : 'top-0'} w-full z-50 glass transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {isCorporate && settings?.corporate_logo_url ? (
              // Corporate Logo
              <InlineButtonLink href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img
                  src={settings.corporate_logo_url}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              </InlineButtonLink>
            ) : (
              // Fallback to site name
              <InlineButtonLink href="/" onClick={() => setIsOpen(false)} className="text-xl font-bold text-nav-text tracking-wider">
                <InlineText settingKey="site_name" defaultValue="PORTFOLIO">
                  {settings?.site_name || 'PORTFOLIO'}
                </InlineText>
              </InlineButtonLink>
            )}
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {visibleLinks.map((link: any) => (
                <Link key={link.key} href={link.href} className="text-nav-text hover:text-primary transition-colors duration-300">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center ml-auto md:ml-4 gap-4">
            <ThemeToggle />
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-nav-text hover:text-primary focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-text-light/10">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            {visibleLinks.map((link: any) => (
              <Link key={link.key} href={link.href} onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
