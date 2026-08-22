'use client';
import PortfolioHero from '@/modes/portfolio/components/PortfolioHero';
import CorporateHero from '@/modes/corporate/components/CorporateHero';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useSiteMode } from '@/utils/useSiteMode';

export default function ObsidianHero(_props: TemplateSectionProps) {
  const { isCorporate } = useSiteMode();

  if (isCorporate) {
    return <CorporateHero />;
  }

  return <PortfolioHero />;
}

