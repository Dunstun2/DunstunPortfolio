const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  certification_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  issuing_organization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  issue_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiration_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  does_not_expire: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  credential_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  credential_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verification_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  skills_covered: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certificate_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certificate_document: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'certifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Certification;
