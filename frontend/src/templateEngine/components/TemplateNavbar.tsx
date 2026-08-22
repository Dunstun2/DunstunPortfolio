'use client';
import { useTemplate } from '../TemplateProvider';

export function TemplateNavbar() {
  const { components, config, isLoading } = useTemplate();
  
  if (isLoading || !components?.Navbar || !config) return null;
  
  const Navbar = components.Navbar;
  return <Navbar config={config} />;
}
