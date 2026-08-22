// ============================================================
// TEMPLATE ENGINE — TypeScript Types
// ============================================================

import { ComponentType } from 'react';

/** Design token colors for a single mode (dark or light) */
export interface TemplateColorTokens {
  primary: string;
  secondary: string;
  bg: string;
  heading: string;
  text: string;
  muted: string;
  navText: string;
  subheading: string;
  buttonText: string;
}

/** Typography configuration */
export interface TemplateTypography {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
}

/** Border configuration */
export interface TemplateBorders {
  radius: string;
  cardRadius: string;
  buttonRadius: string;
}

/** Shadow configuration */
export interface TemplateShadows {
  card: string;
  hover: string;
  glow: string;
}

/** Animation configuration */
export interface TemplateAnimations {
  type: 'none' | 'fade' | 'slide-up' | 'slide-in';
  speed: 'slow' | 'normal' | 'fast';
  hoverEffect: 'lift' | 'subtle' | 'glow' | 'border' | 'none';
}

/** Navigation configuration */
export interface TemplateNavigation {
  style: 'horizontal' | 'sidebar' | 'minimal' | 'overlay';
  position: 'top' | 'left';
  glass: boolean;
}

/** Section layout configuration */
export interface SectionLayoutConfig {
  layout: string;
  columns?: number;
}

/** Navigation item definition */
export interface TemplateNavItem {
  key: string;
  label: string;
  href: string;
}

/** Full template configuration object (stored as JSON in DB) */
export interface TemplateConfig {
  typography: TemplateTypography;
  colors: {
    dark: TemplateColorTokens;
    light: TemplateColorTokens;
  };
  borders: TemplateBorders;
  shadows: TemplateShadows;
  animations: TemplateAnimations;
  navigation: TemplateNavigation;
  hero: { layout: string };
  footer: { style: string };
  cards: { style: string; hoverEffect: string };
  sections: Record<string, SectionLayoutConfig>;
  supportedSections: string[];
  homepageSections: string[];
  pageSections: Record<string, string[]>;
  elementOrder: Record<string, string[]>;
  navigationItems: TemplateNavItem[];
}

/** Template record as returned from the API */
export interface TemplateRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  config: TemplateConfig;
  is_default: boolean;
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
}

// ============================================================
// SECTION COMPONENT PROPS
// ============================================================

/** Common props all template section components receive */
export interface TemplateSectionProps {
  config: TemplateConfig;
  variant?: string;
}

/** The full set of components a template must provide */
export interface TemplateComponentSet {
  slug: string;
  Navbar: ComponentType<TemplateSectionProps>;
  Footer: ComponentType<TemplateSectionProps>;
  Hero: ComponentType<TemplateSectionProps>;
  About: ComponentType<TemplateSectionProps>;
  Projects: ComponentType<TemplateSectionProps>;
  Experience: ComponentType<TemplateSectionProps>;
  Education: ComponentType<TemplateSectionProps>;
  Skills: ComponentType<TemplateSectionProps>;
  Services: ComponentType<TemplateSectionProps>;
  Blog: ComponentType<TemplateSectionProps>;
  Contact: ComponentType<TemplateSectionProps>;
  Testimonials: ComponentType<TemplateSectionProps>;
  Events: ComponentType<TemplateSectionProps>;
  Achievements: ComponentType<TemplateSectionProps>;
  Referees?: ComponentType<TemplateSectionProps>;
  // Index signature allows optional extra sections
  [key: string]: ComponentType<TemplateSectionProps> | string | undefined;
}

/** Context value provided by TemplateProvider */
export interface TemplateContextValue {
  template: TemplateRecord | null;
  config: TemplateConfig | null;
  components: TemplateComponentSet | null;
  isLoading: boolean;
  slug: string;
}
