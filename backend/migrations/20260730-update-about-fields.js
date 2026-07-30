'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields
    await queryInterface.addColumn('abouts', 'professional_title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('abouts', 'personal_introduction', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('abouts', 'professional_summary', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('abouts', 'mission_statement', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('abouts', 'interests', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]'
    });
    await queryInterface.addColumn('abouts', 'statistics', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '[]'
    });

    // Remove old fields safely
    const tableInfo = await queryInterface.describeTable('abouts');
    
    if (tableInfo.hero_title) await queryInterface.removeColumn('abouts', 'hero_title');
    if (tableInfo.hero_image_url) await queryInterface.removeColumn('abouts', 'hero_image_url');
    if (tableInfo.story_title) await queryInterface.removeColumn('abouts', 'story_title');
    if (tableInfo.story_content) await queryInterface.removeColumn('abouts', 'story_content');
    if (tableInfo.philosophy_title) await queryInterface.removeColumn('abouts', 'philosophy_title');
    if (tableInfo.philosophy_statement) await queryInterface.removeColumn('abouts', 'philosophy_statement');
    if (tableInfo.philosophy_description) await queryInterface.removeColumn('abouts', 'philosophy_description');
    if (tableInfo.vision_title) await queryInterface.removeColumn('abouts', 'vision_title');
    if (tableInfo.vision_description) await queryInterface.removeColumn('abouts', 'vision_description');
    if (tableInfo.drive_title) await queryInterface.removeColumn('abouts', 'drive_title');
    if (tableInfo.drive_statement) await queryInterface.removeColumn('abouts', 'drive_statement');
    if (tableInfo.drive_description) await queryInterface.removeColumn('abouts', 'drive_description');
    if (tableInfo.drive_image_url) await queryInterface.removeColumn('abouts', 'drive_image_url');

    // Drop AboutIdentityCards table
    await queryInterface.dropTable('about_identity_cards');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse changes
    await queryInterface.removeColumn('abouts', 'professional_title');
    await queryInterface.removeColumn('abouts', 'personal_introduction');
    await queryInterface.removeColumn('abouts', 'professional_summary');
    await queryInterface.removeColumn('abouts', 'mission_statement');
    await queryInterface.removeColumn('abouts', 'interests');
    await queryInterface.removeColumn('abouts', 'statistics');

    await queryInterface.addColumn('abouts', 'hero_title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'hero_image_url', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'story_title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'story_content', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'philosophy_title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'philosophy_statement', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'philosophy_description', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'vision_title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'vision_description', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'drive_title', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('abouts', 'drive_statement', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'drive_description', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('abouts', 'drive_image_url', { type: Sequelize.STRING, allowNull: true });

    // Recreate AboutIdentityCards
    await queryInterface.createTable('about_identity_cards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      about_id: {
        type: Sequelize.UUID,
        references: {
          model: 'abouts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      icon_name: { type: Sequelize.STRING, allowNull: true },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  }
};
