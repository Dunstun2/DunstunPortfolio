const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: true, unique: true },
  category: { type: DataTypes.STRING, allowNull: true },
  short_description: { type: DataTypes.TEXT, allowNull: true },
  full_description: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.STRING, allowNull: true },
  organization: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.STRING, allowNull: true },
  impact: { type: DataTypes.TEXT, allowNull: true },
  why_it_matters: { type: DataTypes.TEXT, allowNull: true },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order for display (lower numbers first)',
  },
  published_at: { type: DataTypes.DATE, allowNull: true },

  featured_image: { type: DataTypes.STRING, allowNull: true },
  media: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  certificate_file: { type: DataTypes.STRING, allowNull: true },
  video_url: { type: DataTypes.STRING, allowNull: true },

  verification_url: { type: DataTypes.STRING, allowNull: true },
  external_url: { type: DataTypes.STRING, allowNull: true },

  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'achievements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Achievement;
