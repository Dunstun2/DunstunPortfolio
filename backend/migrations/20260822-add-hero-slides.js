'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('heroes');

    if (!tableInfo.slides) {
      await queryInterface.addColumn('heroes', 'slides', {
        type: Sequelize.TEXT, // stored as JSON string
        allowNull: true,
      });
    }

    if (!tableInfo.rotation_settings) {
      await queryInterface.addColumn('heroes', 'rotation_settings', {
        type: Sequelize.TEXT, // stored as JSON string
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable('heroes');
    if (tableInfo.slides) await queryInterface.removeColumn('heroes', 'slides');
    if (tableInfo.rotation_settings) await queryInterface.removeColumn('heroes', 'rotation_settings');
  },
};
