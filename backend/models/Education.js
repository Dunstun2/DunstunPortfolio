const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Education = sequelize.define('Education', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // 1. Basic Info
  degree: { type: DataTypes.STRING, allowNull: false }, // Qualification / Degree Name
  institution: { type: DataTypes.STRING, allowNull: false },
  institution_logo: { type: DataTypes.STRING, allowNull: true },
  institution_type: { type: DataTypes.STRING, allowNull: true }, // e.g., University, College
  field_of_study: { type: DataTypes.STRING, allowNull: false },
  specialization: { type: DataTypes.STRING, allowNull: true },
  faculty: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },

  // 2. Duration
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_current: { type: DataTypes.BOOLEAN, defaultValue: false },
  expected_graduation: { type: DataTypes.DATEONLY, allowNull: true },

  // 3. Performance
  grade: { type: DataTypes.STRING, allowNull: true },
  gpa: { type: DataTypes.STRING, allowNull: true },
  honors: { type: DataTypes.STRING, allowNull: true },

  // 4. Description
  short_summary: { type: DataTypes.TEXT, allowNull: true },
  full_description: { type: DataTypes.TEXT, allowNull: true },

  // 5-9 & 11. Relations & Lists (stored as JSON arrays of strings)
  coursework: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  related_projects: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  achievements: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  activities: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  certifications: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  external_links: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  media: { type: DataTypes.JSON, allowNull: true, defaultValue: [] }, // Evidence & Documents

  // 10. Research
  research_title: { type: DataTypes.STRING, allowNull: true },
  research_description: { type: DataTypes.TEXT, allowNull: true },
  research_supervisor: { type: DataTypes.STRING, allowNull: true },
  research_link: { type: DataTypes.STRING, allowNull: true },

  // 12. Publishing
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft', allowNull: false },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },

  // 13. SEO
  seo_title: { type: DataTypes.STRING, allowNull: true },
  seo_description: { type: DataTypes.TEXT, allowNull: true },
  seo_image: { type: DataTypes.STRING, allowNull: true },

}, {
  tableName: 'educations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Education;
