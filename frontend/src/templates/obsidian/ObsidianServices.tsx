'use client';
import PortfolioServices from '@/modes/portfolio/components/PortfolioServices';
import CorporateServices from '@/modes/corporate/components/CorporateServices';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { useSiteMode } from '@/utils/useSiteMode';

export default function ObsidianServices(props: TemplateSectionProps) {
  const { isCorporate } = useSiteMode();

  if (isCorporate) {
    return <CorporateServices variant={(props.variant as any) || 'full'} />;
  }

  return <PortfolioServices variant={(props.variant as any) || 'full'} />;
}

