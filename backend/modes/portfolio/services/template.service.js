const { Template } = require('../models');

// ============================================================
// DEFAULT TEMPLATE CONFIGURATIONS
// ============================================================

const OBSIDIAN_CONFIG = {
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
  },
  colors: {
    dark: {
      primary: '59 130 246',
      secondary: '249 115 22',
      bg: '15 23 42',
      heading: '255 255 255',
      text: '241 245 249',
      muted: '148 163 184',
      navText: '255 255 255',
      subheading: '148 163 184',
      buttonText: '255 255 255',
    },
    light: {
      primary: '29 78 216',
      secondary: '194 65 12',
      bg: '241 245 249',
      heading: '15 23 42',
      text: '15 23 42',
      muted: '51 65 85',
      navText: '15 23 42',
      subheading: '51 65 85',
      buttonText: '255 255 255',
    },
  },
  borders: {
    radius: '1rem',
    cardRadius: '1rem',
    buttonRadius: '9999px',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    hover: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 30px rgba(var(--color-primary-rgb), 0.5)',
  },
  animations: {
    type: 'slide-up',
    speed: 'normal',
    hoverEffect: 'lift',
  },
  navigation: {
    style: 'horizontal',
    position: 'top',
    glass: true,
  },
  hero: {
    layout: 'split',
  },
  footer: {
    style: 'centered',
  },
  cards: {
    style: 'glass',
    hoverEffect: 'lift',
  },
  sections: {
    projects: { layout: 'grid', columns: 3 },
    experience: { layout: 'timeline' },
    education: { layout: 'timeline' },
    skills: { layout: 'bars' },
    testimonials: { layout: 'carousel' },
    blog: { layout: 'grid' },
    contact: { layout: 'split' },
    services: { layout: 'grid' },
    events: { layout: 'cards' },
    about: { layout: 'editorial' },
    achievements: { layout: 'cards' },
    referees: { layout: 'grid' },
  },
  supportedSections: [
    'hero', 'about', 'projects', 'skills', 'experience', 'education',
    'services', 'blog', 'contact', 'testimonials', 'events', 'achievements',
    'certifications', 'referees',
  ],
  homepageSections: [
    'hero', 'about', 'services', 'education', 'experience',
    'skills', 'projects', 'events', 'testimonials',
  ],
  navigationItems: [
    { key: 'about', label: 'About', href: '/about' },
    { key: 'services', label: 'Services', href: '/services' },
    { key: 'projects', label: 'Projects', href: '/projects' },
    { key: 'achievements', label: 'Achievements', href: '/achievements' },
    { key: 'education', label: 'Education', href: '/education' },
    { key: 'experience', label: 'Experience', href: '/experience' },
    { key: 'skills', label: 'Skills', href: '/skills' },
    { key: 'events', label: 'Events', href: '/events' },
    { key: 'blog', label: 'Blog', href: '/blog' },
    { key: 'testimonials', label: 'Testimonials', href: '/testimonials' },
    { key: 'contact', label: 'Contact', href: '/contact' },
  ],
};

const IVORY_CONFIG = {
  typography: {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
  },
  colors: {
    dark: {
      primary: '99 102 241',
      secondary: '139 92 246',
      bg: '17 24 39',
      heading: '243 244 246',
      text: '229 231 235',
      muted: '156 163 175',
      navText: '243 244 246',
      subheading: '156 163 175',
      buttonText: '255 255 255',
    },
    light: {
      primary: '79 70 229',
      secondary: '109 40 217',
      bg: '255 255 255',
      heading: '17 24 39',
      text: '31 41 55',
      muted: '107 114 128',
      navText: '17 24 39',
      subheading: '107 114 128',
      buttonText: '255 255 255',
    },
  },
  borders: {
    radius: '0.75rem',
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
  },
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.08)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    glow: 'none',
  },
  animations: {
    type: 'fade',
    speed: 'slow',
    hoverEffect: 'subtle',
  },
  navigation: {
    style: 'horizontal',
    position: 'top',
    glass: false,
  },
  hero: {
    layout: 'centered',
  },
  footer: {
    style: 'minimal',
  },
  cards: {
    style: 'flat',
    hoverEffect: 'border',
  },
  sections: {
    projects: { layout: 'cards', columns: 2 },
    experience: { layout: 'cards' },
    education: { layout: 'cards' },
    skills: { layout: 'tags' },
    testimonials: { layout: 'grid' },
    blog: { layout: 'magazine' },
    contact: { layout: 'centered' },
    services: { layout: 'list' },
    events: { layout: 'list' },
    about: { layout: 'two-column' },
    achievements: { layout: 'list' },
    referees: { layout: 'grid' },
  },
  supportedSections: [
    'hero', 'about', 'projects', 'skills', 'experience', 'education',
    'services', 'blog', 'contact', 'testimonials', 'events', 'achievements',
    'certifications', 'referees',
  ],
  homepageSections: [
    'hero', 'about', 'services', 'education', 'experience',
    'skills', 'projects', 'events', 'testimonials',
  ],
  navigationItems: [
    { key: 'about', label: 'About', href: '/about' },
    { key: 'projects', label: 'Work', href: '/projects' },
    { key: 'services', label: 'Services', href: '/services' },
    { key: 'achievements', label: 'Achievements', href: '/achievements' },
    { key: 'experience', label: 'Experience', href: '/experience' },
    { key: 'education', label: 'Education', href: '/education' },
    { key: 'skills', label: 'Skills', href: '/skills' },
    { key: 'events', label: 'Events', href: '/events' },
    { key: 'blog', label: 'Insights', href: '/blog' },
    { key: 'testimonials', label: 'Testimonials', href: '/testimonials' },
    { key: 'contact', label: 'Contact', href: '/contact' },
  ],
};

// ============================================================
// SERVICE
// ============================================================

class TemplateService {
  async getAllTemplates() {
    const templates = await Template.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });
    return templates;
  }

  async getTemplateBySlug(slug) {
    const template = await Template.findOne({ where: { slug } });
    if (!template) throw new Error(`Template "${slug}" not found`);
    return template;
  }

  async getActiveTemplate(settings) {
    const activeSlug = settings?.active_template || 'obsidian';
    try {
      return await this.getTemplateBySlug(activeSlug);
    } catch {
      // Fallback to default
      const defaultTemplate = await Template.findOne({ where: { is_default: true } });
      if (defaultTemplate) return defaultTemplate;
      // Last resort: return first available
      return await Template.findOne({ where: { is_active: true }, order: [['sort_order', 'ASC']] });
    }
  }

  async createTemplate(data) {
    return await Template.create(data);
  }

  async updateTemplate(id, data) {
    const template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');
    await template.update(data);
    return template;
  }

  async deleteTemplate(id) {
    const template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');
    if (template.is_default) throw new Error('Cannot delete the default template');
    await template.destroy();
    return { message: 'Template deleted' };
  }

  /**
   * Seed default templates if they don't exist yet.
   */
  async seedDefaults() {
    const count = await Template.count();
    if (count > 0) return;

    await Template.bulkCreate([
      {
        slug: 'obsidian',
        name: 'Obsidian',
        description: 'Bold, dark, and glassmorphic. Features deep backgrounds, luminous accents, glass-effect cards, and smooth lift animations. Makes a strong, modern impression.',
        category: 'bold',
        config: JSON.stringify(OBSIDIAN_CONFIG),
        is_default: true,
        is_active: true,
        sort_order: 1,
      },
      {
        slug: 'ivory',
        name: 'Ivory',
        description: 'Clean, light, and editorial. Features generous whitespace, refined typography, flat cards with subtle borders, and restrained fade animations. Elegant and sophisticated.',
        category: 'minimal',
        config: JSON.stringify(IVORY_CONFIG),
        is_default: false,
        is_active: true,
        sort_order: 2,
      },
    ]);
  }
}

module.exports = new TemplateService();
