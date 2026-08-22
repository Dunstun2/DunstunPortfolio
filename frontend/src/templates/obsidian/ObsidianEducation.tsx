'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import PortfolioEducation from '@/modes/portfolio/components/PortfolioEducation';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ObsidianEducation(_props: TemplateSectionProps) {
  const [isCorporate, setIsCorporate] = useState(false);

  useEffect(() => {
    fetchApi('/settings')
      .then(res => {
        if (res.data?.site_mode === 'corporate') setIsCorporate(true);
      })
      .catch(() => {});
  }, []);

  if (isCorporate) return null;
  return <PortfolioEducation />;
}
