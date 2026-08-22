'use client';
import { useState, useEffect } from 'react';
import { useTemplate } from '../TemplateProvider';
import { DraggableLayout } from './DraggableLayout';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

interface TemplatePageProps {
  pageName: string;
  defaultSection: string;
}

export function TemplatePage({ pageName, defaultSection }: TemplatePageProps) {
  const { config, isLoading } = useTemplate();
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchApi('/sections/available')
      .then(res => setAvailableSections(res.data))
      .catch(() => setAvailableSections(null))
      .finally(() => setChecking(false));
  }, []);

  if (isLoading || !config || checking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if section is disabled for this site mode
  if (availableSections && availableSections[defaultSection] === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-extrabold text-heading-light mb-3">Page Not Available</h1>
        <p className="text-text-light/70 max-w-md mb-6">
          This section is disabled for the current website configuration.
        </p>
        <Link href="/" className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  // Try to get custom page sections from config, fallback to default section
  const sections = (config.pageSections && config.pageSections[pageName]) 
    ? config.pageSections[pageName] 
    : [defaultSection];
  
  return (
    <DraggableLayout 
      initialSections={sections} 
      pageName={pageName} 
      variant="full" 
    />
  );
}
