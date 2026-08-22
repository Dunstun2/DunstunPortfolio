'use client';
import PortfolioContact from '@/modes/portfolio/components/PortfolioContact';
import CorporateContact from '@/modes/corporate/components/CorporateContact';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useSiteMode } from '@/utils/useSiteMode';

export default function ObsidianContact(_props: TemplateSectionProps) {
  const { isCorporate } = useSiteMode();

  if (isCorporate) {
    return <CorporateContact />;
  }

  return <PortfolioContact />;
}

