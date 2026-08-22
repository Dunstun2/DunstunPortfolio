'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import PortfolioTestimonials from '@/modes/portfolio/components/PortfolioTestimonials';
import CorporateTestimonials from '@/modes/corporate/components/CorporateTestimonials';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianTestimonials(props: TemplateSectionProps) {
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateTestimonials variant={(props.variant as any) || 'full'} />;
  }

  return <PortfolioTestimonials variant={(props.variant as any) || 'full'} />;
}
