const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const About = sequelize.define('About', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resume_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },
  // Narrative fields
  hero_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hero_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  story_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  story_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  philosophy_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  philosophy_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  philosophy_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vision_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vision_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vision_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  drive_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  drive_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  drive_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  drive_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'abouts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = About;
