'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      certification_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
      },
      issuing_organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      issue_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expiration_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      does_not_expire: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      credential_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      credential_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verification_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      short_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      skills_covered: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      certificate_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      certificate_document: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('certifications', ['status']);
    await queryInterface.addIndex('certifications', ['slug']);
    await queryInterface.addIndex('certifications', ['featured']);
    await queryInterface.addIndex('certifications', ['category']);
    await queryInterface.addIndex('certifications', ['order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certifications');
  }
};
