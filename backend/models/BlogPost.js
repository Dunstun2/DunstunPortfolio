const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
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
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  featured_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING, // Can store slug or ID, simple string for now like Projects
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  author_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author_avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'scheduled', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reading_time: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  seo_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  seo_keywords: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduled_for: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'blog_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BlogPost;
