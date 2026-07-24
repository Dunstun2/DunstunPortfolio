const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  short_description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Brief description for cards/listings',
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon name or class (e.g., lucide icon name)',
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Service image/illustration URL',
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Price display text (e.g., "$50/hour", "Starting at $500", "Custom")',
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of features/what\'s included',
  },
  cta_text: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Get Started',
    comment: 'Call-to-action button text',
  },
  cta_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'CTA button link (e.g., /contact, external URL)',
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Display in featured services section (max 3)',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order for display (lower numbers first)',
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Service;
