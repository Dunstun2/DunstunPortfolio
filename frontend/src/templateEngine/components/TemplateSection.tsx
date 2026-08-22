'use client';
import { useTemplate } from '../TemplateProvider';
import SectionErrorBoundary from '@/components/SectionErrorBoundary';

interface TemplateSectionProps {
  name: string; // The CMS section name (e.g. 'Hero', 'Projects', 'Skills')
  variant?: string; // Optional variant (e.g. 'full', 'highlights')
}

export function TemplateSection({ name, variant }: TemplateSectionProps) {
  const { components, config, isLoading } = useTemplate();
  
  if (isLoading || !components || !config) {
    return <div className="min-h-[200px] flex items-center justify-center animate-pulse bg-text-light/5" />;
  }
  
  // Find the matching component in the active template's component set
  // We expect the template to export components matching the section names exactly (e.g. 'Hero', 'Projects')
  // We capitalize the first letter to match React component naming conventions
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  const Component = components[componentName] as any;
  
  if (!Component) {
    console.warn(`Template component missing for section: ${name}`);
    return null;
  }
  
  return (
    <SectionErrorBoundary sectionName={name}>
      <Component config={config} variant={variant} />
    </SectionErrorBoundary>
  );
}
