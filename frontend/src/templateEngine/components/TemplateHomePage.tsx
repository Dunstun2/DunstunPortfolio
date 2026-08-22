'use client';
import { useState, useEffect } from 'react';
import { useTemplate } from '../TemplateProvider';
import { TemplateSection } from './TemplateSection';
import { DraggableLayout } from './DraggableLayout';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export function TemplateHomePage() {
  const { config, isLoading } = useTemplate();
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetchApi('/sections/available')
      .then(res => setAvailableSections(res.data))
      .catch(() => setAvailableSections(null));
  }, []);

  if (isLoading || !config || availableSections === null) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render sections in the order defined by the template config
  let sections = config.homepageSections || ['hero', 'about', 'projects'];

  // Filter sections by availableSections (hides education, experience, skills, events etc. in corporate mode)
  if (availableSections) {
    sections = sections.filter(s => availableSections[s] !== false);
  }

  const hasHero = sections.includes('hero');
  if (hasHero) {
    sections = sections.filter(s => s !== 'hero');
  }

  return (
    <div className="w-full">
      {hasHero && (
        isPreview ? (
          <div className="relative group mb-4">
            {/* Always-visible dotted border for hero in preview */}
            <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-primary/40 group-hover:border-primary/80 rounded-xl transition-colors"></div>
            {/* Section name label */}
            <div className="absolute top-0 left-4 z-[60] -translate-y-1/2 bg-primary text-bg-dark text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full pointer-events-none shadow-md">
              hero (pinned)
            </div>
            <TemplateSection name="hero" variant="highlights" />
          </div>
        ) : (
          <TemplateSection name="hero" variant="highlights" />
        )
      )}
      <DraggableLayout 
        initialSections={sections} 
        pageName="home" 
        variant="highlights" 
      />
    </div>
  );
}
