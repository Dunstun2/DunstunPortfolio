'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import PortfolioReferees from '@/modes/portfolio/components/PortfolioReferees';
import CorporateReferences from '@/modes/corporate/components/CorporateReferences';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianReferees(_props: TemplateSectionProps) {
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey]);

  if (settings?.site_mode === 'corporate') {
    return null;
  }

  return <PortfolioReferees />;

}
