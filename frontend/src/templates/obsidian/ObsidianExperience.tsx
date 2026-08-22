'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import PortfolioExperience from '@/modes/portfolio/components/PortfolioExperience';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianExperience(_props: TemplateSectionProps) {
  const [isCorporate, setIsCorporate] = useState(false);

  useEffect(() => {
    fetchApi('/settings')
      .then(res => {
        if (res.data?.site_mode === 'corporate') setIsCorporate(true);
      })
      .catch(() => {});
  }, []);

  if (isCorporate) return null;
  return <PortfolioExperience />;
}
