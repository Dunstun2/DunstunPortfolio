'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import PortfolioSkills from '@/modes/portfolio/components/PortfolioSkills';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianSkills(_props: TemplateSectionProps) {
  const [isCorporate, setIsCorporate] = useState(false);

  useEffect(() => {
    fetchApi('/settings')
      .then(res => {
        if (res.data?.site_mode === 'corporate') setIsCorporate(true);
      })
      .catch(() => {});
  }, []);

  if (isCorporate) return null;
  return <PortfolioSkills />;
}
