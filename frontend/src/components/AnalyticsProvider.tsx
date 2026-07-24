'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/utils/api';

function AnalyticsProviderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run in browser, and ignore admin routes
    if (typeof window === 'undefined' || pathname?.startsWith('/admin')) {
      return;
    }

    const trackPageView = async () => {
      try {
        // Detect device type roughly
        const ua = navigator.userAgent.toLowerCase();
        let device_type = 'desktop';
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
          device_type = 'tablet';
        } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
          device_type = 'mobile';
        }

        const referrer = document.referrer || '';
        const urlPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        await fetchApi('/analytics/track', {
          method: 'POST',
          body: JSON.stringify({
            event_type: 'page_view',
            path: urlPath,
            referrer,
            device_type
          })
        });
      } catch (error) {
        // Fail silently for analytics
        console.error('Analytics error:', error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

export default function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsProviderInner />
    </Suspense>
  );
}

// Helper to track specific custom actions anywhere in the app
export const trackAction = async (action_name: string) => {
  try {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;

    const ua = navigator.userAgent.toLowerCase();
    let device_type = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      device_type = 'tablet';
    } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      device_type = 'mobile';
    }

    await fetchApi('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event_type: 'action',
        action_name,
        path: pathname,
        device_type
      })
    });
  } catch (error) {
    console.error('Action tracking error:', error);
  }
};
