const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Basic Info
  company: { type: DataTypes.STRING, allowNull: false },
  company_logo: { type: DataTypes.STRING, allowNull: true },
  position: { type: DataTypes.STRING, allowNull: false },
  employment_type: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  work_mode: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  industry: { type: DataTypes.STRING, allowNull: true },

  // Duration
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_current: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Role Description
  short_summary: { type: DataTypes.TEXT, allowNull: true },
  full_description: { type: DataTypes.TEXT, allowNull: true },
  responsibilities: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  achievements: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  key_contributions: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

  // Relational (JSON arrays of names or IDs)
  associated_skills: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  related_projects: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

  // Media & Links
  media: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  company_website: { type: DataTypes.STRING, allowNull: true },
  external_links: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

  // Publishing
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft', allowNull: false },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'experiences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Experience;
