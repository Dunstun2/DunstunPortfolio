'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CVImports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'file_name'
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'file_size',
        comment: 'File size in bytes'
      },
      fileType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'file_type',
        comment: 'MIME type of uploaded file'
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'file_path',
        comment: 'Temporary storage path'
      },
      extractedText: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        field: 'extracted_text',
        comment: 'Raw text extracted from CV'
      },
      parsedData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'parsed_data',
        comment: 'Structured CV data after parsing'
      },
      mappedData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'mapped_data',
        comment: 'CV data mapped to portfolio modules'
      },
      enhancedData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'enhanced_data',
        comment: 'AI-enhanced CV data with improvements'
      },
      status: {
        type: Sequelize.ENUM('uploaded', 'parsing', 'parsed', 'importing', 'imported', 'failed'),
        allowNull: false,
        defaultValue: 'uploaded',
        comment: 'Import status'
      },
      importedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'imported_by',
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who imported the CV'
      },
      importedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'imported_at',
        comment: 'Timestamp when CV was imported to portfolio'
      },
      importResults: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'import_results',
        comment: 'Results of import operation'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'error_message',
        comment: 'Error message if parsing/import failed'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional metadata (word count, sections found, etc.)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('CVImports', ['status'], {
      name: 'cv_imports_status_idx'
    });

    await queryInterface.addIndex('CVImports', ['imported_by'], {
      name: 'cv_imports_imported_by_idx'
    });

    await queryInterface.addIndex('CVImports', ['created_at'], {
      name: 'cv_imports_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CVImports');
  }
};
