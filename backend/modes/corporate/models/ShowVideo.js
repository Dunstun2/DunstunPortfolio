const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const ShowVideo = sequelize.define('ShowVideo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Content
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
    defaultValue: 'Untitled Video',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poster_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Publishing / Scheduling
  status: {
    type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'If set and status=scheduled, goes live at this datetime',
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Display order on banner
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'corporate_show_videos',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ShowVideo;
