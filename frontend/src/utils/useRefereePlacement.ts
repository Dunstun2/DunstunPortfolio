'use client';

import { useTemplate } from '@/templateEngine/TemplateProvider';

/**
 * Returns true if the 'referees' section should be shown on the given page
 * based on the active template's pageSections / homepageSections config.
 *
 * @param page - 'home' | 'about' | 'contact' | 'experience' (or any pageSections key)
 */
export function useRefereePlacement(page: string): boolean {
  const { config, isLoading } = useTemplate();

  if (isLoading || !config) return false;

  if (page === 'home') {
    return (config.homepageSections || []).includes('referees');
  }

  const pageSections = config.pageSections || {};
  return (pageSections[page] || []).includes('referees');
}
