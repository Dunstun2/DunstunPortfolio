'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      'projects',
      'experiences',
      'educations',
      'testimonials',
      'achievements',
      'events',
      'skills',
      'blog_posts'
    ];

    for (const table of tables) {
      // Check if column already exists just in case
      try {
        const tableInfo = await queryInterface.describeTable(table);
        if (!tableInfo.display_order) {
          await queryInterface.addColumn(table, 'display_order', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Order for display (lower numbers first)'
          });
        }
      } catch (err) {
        console.warn(`Could not add display_order to ${table}:`, err.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      'projects',
      'experiences',
      'educations',
      'testimonials',
      'achievements',
      'events',
      'skills',
      'blog_posts'
    ];

    for (const table of tables) {
      try {
        const tableInfo = await queryInterface.describeTable(table);
        if (tableInfo.display_order) {
          await queryInterface.removeColumn(table, 'display_order');
        }
      } catch (err) {
        // ignore
      }
    }
  }
};
