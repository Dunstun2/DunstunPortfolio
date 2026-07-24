'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';
import { usePathname } from 'next/navigation';

export default function SocialFloater() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  const [socials, setSocials] = useState<any[]>([]);
  const [showFloater, setShowFloater] = useState(true);
  const refreshKeySocials = useRealtimeRefresh('social');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    // Fetch both settings and socials in parallel
    Promise.all([
      fetchApi('/settings'),
      fetchApi('/social')
    ]).then(([settingsRes, socialRes]) => {
      if (settingsRes.data && settingsRes.data.show_social_floater === 'false') {
        setShowFloater(false);
      }
      if (socialRes.success) {
        setSocials(socialRes.data || []);
      }
    }).catch(console.error);
  }, [refreshKeySocials, refreshKeySettings]);

  if (!showFloater || socials.length === 0) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 glass border-l-0 rounded-r-xl shadow-2xl">
      {socials.map((social: any) => {
        const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
        return (
          <Link 
            key={social.id} 
            href={href} 
            target="_blank" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-text-light hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110"
            title={social.platform_name}
          >
            {getSocialIcon(social.platform_name)}
          </Link>
        );
      })}
    </div>
  );
}
