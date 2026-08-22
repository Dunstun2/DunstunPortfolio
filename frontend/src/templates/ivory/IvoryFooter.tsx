'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';
import { usePathname } from 'next/navigation';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function IvoryFooter({ config }: TemplateSectionProps) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const [socials, setSocials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('social');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/social').then(res => { if (res.success) setSocials(res.data || []); }).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data || {})).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings]);

  const defaultLogo = settings?.site_mode === 'corporate' ? 'BUSINESS CO.' : 'PORTFOLIO.';

  return (
    <footer className="w-full bg-bg-dark border-t border-text-light/10 py-12 overflow-hidden relative">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <Link href="/" className="text-2xl font-heading font-black text-heading-light tracking-tighter">
              {settings?.site_name || defaultLogo}
            </Link>
            <p className="text-muted-light font-mono text-xs uppercase tracking-widest mt-3">
              &copy; {new Date().getFullYear()} — {settings?.site_mode === 'corporate' ? 'Corporate Excellence' : 'Designed with Intent'}
            </p>
          </div>

          {socials.length > 0 && (
            <div className="flex gap-6 items-center">
              {socials.map((social: any) => {
                const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
                return (
                  <Link
                    key={social.id}
                    href={href}
                    target="_blank"
                    className="group flex items-center justify-center w-12 h-12 rounded-full border border-text-light/10 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    title={social.platform_name}
                  >
                    <div className="w-5 h-5 text-text-light/60 group-hover:text-primary transition-colors duration-300">
                      {getSocialIcon(social.platform_name)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          
        </div>
      </div>
    </footer>
  );
}
