'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('achievements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("(lower(hex(randomblob(16))))"),
        primaryKey: true,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: true, unique: true },
      category: { type: Sequelize.STRING, allowNull: true },
      short_description: { type: Sequelize.TEXT, allowNull: true },
      full_description: { type: Sequelize.TEXT, allowNull: true },
      date: { type: Sequelize.STRING, allowNull: true },
      organization: { type: Sequelize.STRING, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.STRING, allowNull: true },
      impact: { type: Sequelize.TEXT, allowNull: true },
      why_it_matters: { type: Sequelize.TEXT, allowNull: true },
      published_at: { type: Sequelize.DATE, allowNull: true },

      featured_image: { type: Sequelize.STRING, allowNull: true },
      media: { type: Sequelize.JSON, allowNull: true },
      certificate_file: { type: Sequelize.STRING, allowNull: true },
      video_url: { type: Sequelize.STRING, allowNull: true },

      verification_url: { type: Sequelize.STRING, allowNull: true },
      external_url: { type: Sequelize.STRING, allowNull: true },

      status: { type: Sequelize.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
      featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('achievements');
  }
};
