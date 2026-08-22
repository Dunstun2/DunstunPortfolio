const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

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
  external_link: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External URL for more info or CTA',
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Video URL (e.g. Cloudinary, YouTube, etc.)',
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
