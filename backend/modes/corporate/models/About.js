const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

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
  professional_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  personal_introduction: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  professional_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mission_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vision_statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  interests: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  statistics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  corporate_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
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
