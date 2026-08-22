'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';
import { usePathname } from 'next/navigation';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import { useSiteMode } from '@/utils/useSiteMode';
import InlineText from '@/templateEngine/components/InlineText';

export default function ObsidianFooter({ config }: TemplateSectionProps) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const [socials, setSocials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('social');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const { isCorporate } = useSiteMode();

  useEffect(() => {
    Promise.all([
      fetchApi('/social')
        .then(res => {
          if (res.success) setSocials(res.data || []);
        })
        .catch(() => {}),
      fetchApi('/settings')
        .then(res => setSettings(res.data || {}))
        .catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings]);

  return (
    <footer className="w-full glass py-6 mt-4 md:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {socials.length > 0 && (
          <div className="flex gap-4 mb-6">
            {socials.map((social: any) => {
              const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
              return (
                <Link
                  key={social.id}
                  href={href}
                  target="_blank"
                  className="w-11 h-11 rounded-full bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 shadow-md"
                  title={social.platform_name}
                >
                  {getSocialIcon(social.platform_name)}
                </Link>
              );
            })}
          </div>
        )}
        <p className="text-muted-light text-sm">
          &copy; {new Date().getFullYear()}{' '}
          <InlineText settingKey="footer_brand_name" defaultValue={isCorporate ? 'Business Co.' : 'My Portfolio'}>
            {settings?.footer_brand_name || (isCorporate ? 'Business Co.' : 'My Portfolio')}
          </InlineText>

          . Powered by{' '}
          <Link
            href="#"
            target="_blank"
            className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
            rel="noopener noreferrer"
          >
            <InlineText settingKey="footer_powered_by" defaultValue="Comrades360">
              {settings?.footer_powered_by || 'Comrades360'}
            </InlineText>
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
