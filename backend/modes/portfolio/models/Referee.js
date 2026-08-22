const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Referee = sequelize.define('Referee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  years_known: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  display_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  display_phone: {
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
}, {
  tableName: 'referees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Referee;
