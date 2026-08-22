'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('heroes');

    if (!tableInfo.promo_badge) {
      await queryInterface.addColumn('heroes', 'promo_badge', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.stats) {
      await queryInterface.addColumn('heroes', 'stats', {
        type: Sequelize.TEXT, // stored as JSON string
        allowNull: true,
      });
    }

    if (!tableInfo.trust_indicators) {
      await queryInterface.addColumn('heroes', 'trust_indicators', {
        type: Sequelize.TEXT, // stored as JSON string
        allowNull: true,
      });
    }

    if (!tableInfo.client_logos) {
      await queryInterface.addColumn('heroes', 'client_logos', {
        type: Sequelize.TEXT, // stored as JSON string
        allowNull: true,
      });
    }

    if (!tableInfo.mobile_image_url) {
      await queryInterface.addColumn('heroes', 'mobile_image_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.section_height) {
      await queryInterface.addColumn('heroes', 'section_height', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '90vh',
      });
    }

    if (!tableInfo.company_tagline) {
      await queryInterface.addColumn('heroes', 'company_tagline', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable('heroes');
    const fields = ['promo_badge', 'stats', 'trust_indicators', 'client_logos', 'mobile_image_url', 'section_height', 'company_tagline'];
    for (const field of fields) {
      if (tableInfo[field]) await queryInterface.removeColumn('heroes', field);
    }
  },
};
