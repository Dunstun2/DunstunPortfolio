const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Hero = sequelize.define('Hero', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // 1. General
  internal_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Homepage Hero',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },

  // 2. Content
  greeting: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title_prefix: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  headline: { // name_heading
    type: DataTypes.STRING,
    allowNull: false,
  },
  professional_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subheadline: { // short_introduction
    type: DataTypes.TEXT,
    allowNull: true,
  },
  highlighted_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Corporate identity
  company_tagline: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  promo_badge: {
    type: DataTypes.STRING, // e.g. "🔥 Limited Offer" or "✨ Now Open"
    allowNull: true,
  },

  // Social proof — all stored as JSON arrays
  stats: {
    // [{number: "500", suffix: "+", label: "Happy Clients"}]
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('stats');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('stats', value ? JSON.stringify(value) : null);
    },
  },
  trust_indicators: {
    // [{icon: "⭐", text: "5-Star Rated"}]
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('trust_indicators');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('trust_indicators', value ? JSON.stringify(value) : null);
    },
  },
  client_logos: {
    // [{name: "Acme Corp", logo_url: "..."}]
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('client_logos');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('client_logos', value ? JSON.stringify(value) : null);
    },
  },

  // Multi-Slide Carousel & Rotating Banner
  slides: {
    // Array of slide objects: [{ id, slide_type, badge, headline, highlighted_text, subheadline, cta_buttons, media_url, media_type, is_active }]
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('slides');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('slides', value ? JSON.stringify(value) : null);
    },
  },
  rotation_settings: {
    // { auto_rotate: true, interval_sec: 6, pause_on_hover: true, transition_effect: 'fade' | 'slide' }
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('rotation_settings');
      return raw ? JSON.parse(raw) : { auto_rotate: true, interval_sec: 6, pause_on_hover: true, transition_effect: 'slide' };
    },
    set(value) {
      this.setDataValue('rotation_settings', value ? JSON.stringify(value) : null);
    },
  },

  // 3. Profile Image
  image_url: { // photo_url
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo_alt_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo_position: {
    type: DataTypes.ENUM('left', 'center', 'right'),
    defaultValue: 'right',
  },
  photo_shape: {
    type: DataTypes.ENUM('circle', 'rounded', 'square'),
    defaultValue: 'circle',
  },
  photo_display_style: {
    type: DataTypes.STRING,
    defaultValue: 'normal',
  },

  // 4. CTA Buttons
  cta_buttons: {
    type: DataTypes.TEXT, // Storing as JSON string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('cta_buttons');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('cta_buttons', value ? JSON.stringify(value) : null);
    }
  },

  // 4b. Content Background
  content_bg_type: {
    type: DataTypes.STRING,
    defaultValue: 'none',
    allowNull: true,
  },

  // 5. Social Links
  show_social_links: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // 6. Availability
  show_availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  availability_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  availability_type: {
    type: DataTypes.ENUM('available', 'busy', 'away'),
    defaultValue: 'available',
  },
  availability_link: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // 7. Background
  bg_type: {
    type: DataTypes.ENUM('solid', 'gradient', 'image', 'video', 'animated', 'transparent'),
    defaultValue: 'transparent',
  },
  bg_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bg_gradient: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bg_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bg_video_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bg_overlay_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bg_overlay_opacity: {
    type: DataTypes.FLOAT,
    defaultValue: 0.5,
  },

  // 8. Layout
  layout_template: {
    type: DataTypes.ENUM('split', 'centered', 'photo-background'),
    defaultValue: 'split',
  },

  // 9. Display
  full_height: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  section_height: {
    // Custom height override: '100vh', '90vh', '80vh', '70vh', '600px', 'auto'
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '90vh',
  },
  content_alignment: {
    type: DataTypes.ENUM('start', 'center', 'end'),
    defaultValue: 'start',
  },
  text_alignment: {
    type: DataTypes.ENUM('left', 'center', 'right'),
    defaultValue: 'left',
  },
  animation_type: {
    type: DataTypes.ENUM('none', 'fade', 'slide-up', 'slide-in'),
    defaultValue: 'slide-up',
  },
  animation_speed: {
    type: DataTypes.ENUM('slow', 'normal', 'fast'),
    defaultValue: 'normal',
  },
  show_scroll_indicator: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // 10. Responsive
  mobile_layout: {
    type: DataTypes.TEXT, // Storing as JSON string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('mobile_layout');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('mobile_layout', value ? JSON.stringify(value) : null);
    }
  },

  // 11. SEO
  seo_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  heading_level: {
    type: DataTypes.ENUM('h1', 'h2', 'h3'),
    defaultValue: 'h1',
  },
  accessibility_label: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // 12. Publishing
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduled_publish_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduled_unpublish_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'heroes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Hero;
