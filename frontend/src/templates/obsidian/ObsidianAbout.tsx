'use client';
import PortfolioAbout from '@/modes/portfolio/components/PortfolioAbout';
import CorporateAbout from '@/modes/corporate/components/CorporateAbout';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useSiteMode } from '@/utils/useSiteMode';

export default function ObsidianAbout(props: TemplateSectionProps) {
  const { isCorporate } = useSiteMode();

  if (isCorporate) {
    return <CorporateAbout variant={(props.variant as any) || 'full'} />;
  }

  return <PortfolioAbout variant={props.variant as any} />;
}

