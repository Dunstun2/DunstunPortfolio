const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  organizer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  format: {
    type: DataTypes.ENUM('Physical', 'Virtual', 'Hybrid'),
    defaultValue: 'Physical',
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  website_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  participation_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  my_experience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lessons: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  takeaways: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  people_met: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  videos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  reflection: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  related_projects: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  related_skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
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
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Event;
