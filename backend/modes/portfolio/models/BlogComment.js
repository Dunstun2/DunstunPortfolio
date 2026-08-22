const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const BlogComment = sequelize.define('BlogComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'blog_posts',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'blog_comments',
      key: 'id'
    }
  },
  author_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author_website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_author_reply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'spam', 'archived'),
    defaultValue: 'pending',
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'blog_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BlogComment;
