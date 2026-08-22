'use client';
import { useTemplate } from '../TemplateProvider';

export function TemplateFooter() {
  const { components, config, isLoading } = useTemplate();
  
  if (isLoading || !components?.Footer || !config) return null;
  
  const Footer = components.Footer;
  return <Footer config={config} />;
}
