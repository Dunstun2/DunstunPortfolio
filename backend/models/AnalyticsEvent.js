const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyticsEvent = sequelize.define('AnalyticsEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'page_view' // 'page_view' or 'action'
  },
  action_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  device_type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'desktop'
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'analytics_events',
  timestamps: true, // adds createdAt, updatedAt
});

module.exports = AnalyticsEvent;
