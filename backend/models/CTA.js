const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CTA = sequelize.define('CTA', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_external: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  style: {
    type: DataTypes.STRING,
    defaultValue: 'primary', // e.g., primary, secondary, outline
  },
}, {
  tableName: 'ctas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = CTA;
