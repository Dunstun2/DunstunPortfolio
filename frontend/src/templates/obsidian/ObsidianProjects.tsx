'use client';
import PortfolioProjects from '@/modes/portfolio/components/PortfolioProjects';
import CorporateProjects from '@/modes/corporate/components/CorporateProjects';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useSiteMode } from '@/utils/useSiteMode';

export default function ObsidianProjects(props: TemplateSectionProps) {
  const { isCorporate } = useSiteMode();

  if (isCorporate) {
    return <CorporateProjects variant={(props.variant as any) || 'full'} />;
  }

  return <PortfolioProjects variant={(props.variant as any) || 'full'} />;
}

