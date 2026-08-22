'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import PortfolioEvents from '@/modes/portfolio/components/PortfolioEvents';
import CorporateEvents from '@/modes/corporate/components/CorporateEvents';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianEvents(props: TemplateSectionProps) {
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateEvents variant={(props.variant as any) || 'full'} />;
  }

  return <PortfolioEvents variant={(props.variant as any) || 'full'} />;
}
