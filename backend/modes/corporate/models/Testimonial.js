const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  author_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo_consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  display_photo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  display_name: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  display_title: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  display_company: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'testimonials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Testimonial;
