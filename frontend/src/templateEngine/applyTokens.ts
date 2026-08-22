import type { TemplateConfig, TemplateColorTokens } from './types';

/**
 * Applies template design tokens as CSS custom properties on the document root.
 * Called whenever the template or theme (dark/light) changes.
 */
export function applyDesignTokens(config: TemplateConfig, theme: 'dark' | 'light') {
  const root = document.documentElement;
  const colors: TemplateColorTokens = config.colors[theme];

  // Colors
  if (colors.primary) root.style.setProperty('--color-primary-rgb', colors.primary);
  if (colors.secondary) root.style.setProperty('--color-secondary-rgb', colors.secondary);
  if (colors.bg) root.style.setProperty('--color-bg-dark-rgb', colors.bg);
  if (colors.heading) root.style.setProperty('--color-heading-light-rgb', colors.heading);
  if (colors.text) root.style.setProperty('--color-text-light-rgb', colors.text);
  if (colors.muted) root.style.setProperty('--color-muted-light-rgb', colors.muted);
  if (colors.navText) root.style.setProperty('--color-nav-text-rgb', colors.navText);
  if (colors.subheading) root.style.setProperty('--color-subheading-rgb', colors.subheading);
  if (colors.buttonText) root.style.setProperty('--color-button-text-rgb', colors.buttonText);

  // Glass effect based on background
  const bgParts = colors.bg.split(' ').map(Number);
  const [r, g, b] = bgParts.map(v => (isNaN(v) ? 15 : v));
  if (theme === 'light') {
    root.style.setProperty('--glass-bg', `rgba(${r}, ${g}, ${b}, 0.7)`);
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
  } else {
    root.style.setProperty('--glass-bg', `rgba(${r}, ${g}, ${b}, 0.7)`);
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
  }

  // Borders
  if (config.borders) {
    root.style.setProperty('--template-radius', config.borders.radius);
    root.style.setProperty('--template-card-radius', config.borders.cardRadius);
    root.style.setProperty('--template-button-radius', config.borders.buttonRadius);
  }

  // Shadows
  if (config.shadows) {
    root.style.setProperty('--template-shadow-card', config.shadows.card);
    root.style.setProperty('--template-shadow-hover', config.shadows.hover);
    root.style.setProperty('--template-shadow-glow', config.shadows.glow);
  }

  // Typography — set CSS variable for template font
  if (config.typography) {
    root.style.setProperty('--template-heading-font', `"${config.typography.headingFont}", ui-sans-serif, system-ui, sans-serif`);
    root.style.setProperty('--template-body-font', `"${config.typography.bodyFont}", ui-sans-serif, system-ui, sans-serif`);
    root.style.setProperty('--template-mono-font', `"${config.typography.monoFont}", ui-monospace, monospace`);
  }

  // Cards style class on body
  root.setAttribute('data-template-cards', config.cards?.style || 'glass');
  root.setAttribute('data-template-animations', config.animations?.type || 'slide-up');
}

/**
 * Dynamically loads Google Fonts for the template's typography.
 */
export function loadTemplateFonts(config: TemplateConfig) {
  if (!config.typography) return;

  const fonts = new Set<string>();
  if (config.typography.headingFont) fonts.add(config.typography.headingFont);
  if (config.typography.bodyFont) fonts.add(config.typography.bodyFont);
  if (config.typography.monoFont) fonts.add(config.typography.monoFont);

  // Remove any previously loaded template font links
  document.querySelectorAll('link[data-template-font]').forEach(el => el.remove());

  if (fonts.size === 0) return;

  const families = Array.from(fonts)
    .map(f => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  link.setAttribute('data-template-font', 'true');
  document.head.appendChild(link);
}
