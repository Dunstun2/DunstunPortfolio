/**
 * CVImport Model
 * 
 * Tracks CV import history and stores parsed data
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const CVImport = sequelize.define('CVImport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name',
    validate: {
      notEmpty: {
        msg: 'File name is required',
      },
    },
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'file_size',
    validate: {
      min: {
        args: [0],
        msg: 'File size must be positive',
      },
    },
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_type',
    validate: {
      notEmpty: {
        msg: 'File type is required',
      },
      isIn: {
        args: [[
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ]],
        msg: 'Invalid file type. Must be PDF, DOCX, or TXT',
      },
    },
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_path',
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'extracted_text',
  },
  parsedData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'parsed_data',
    get() {
      const value = this.getDataValue('parsedData');
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    },
  },
  mappedData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'mapped_data',
    get() {
      const value = this.getDataValue('mappedData');
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    },
  },
  enhancedData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'enhanced_data',
    get() {
      const value = this.getDataValue('enhancedData');
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    },
  },
  status: {
    type: DataTypes.ENUM('uploaded', 'parsing', 'parsed', 'importing', 'imported', 'failed'),
    allowNull: false,
    defaultValue: 'uploaded',
    validate: {
      isIn: {
        args: [['uploaded', 'parsing', 'parsed', 'importing', 'imported', 'failed']],
        msg: 'Invalid status',
      },
    },
  },
  importedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'imported_by',
  },
  importedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'imported_at',
  },
  importResults: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'import_results',
    get() {
      const value = this.getDataValue('importResults');
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    },
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const value = this.getDataValue('metadata');
      return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
    },
  },
}, {
  tableName: 'CVImports',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status'],
      name: 'cv_imports_status_idx',
    },
    {
      fields: ['imported_by'],
      name: 'cv_imports_imported_by_idx',
    },
    {
      fields: ['created_at'],
      name: 'cv_imports_created_at_idx',
    },
  ],
});

// Associations
CVImport.associate = (models) => {
  // CV import belongs to a user
  CVImport.belongsTo(models.User, {
    foreignKey: 'imported_by',
    as: 'importer',
  });
};

// Instance methods

/**
 * Check if CV has been imported
 */
CVImport.prototype.isImported = function () {
  return this.status === 'imported';
};

/**
 * Check if CV import failed
 */
CVImport.prototype.hasFailed = function () {
  return this.status === 'failed';
};

/**
 * Check if CV is ready for import
 */
CVImport.prototype.isReadyForImport = function () {
  return this.status === 'parsed' && this.mappedData !== null;
};

/**
 * Get file size in human-readable format
 */
CVImport.prototype.getFileSizeFormatted = function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get summary of parsed sections
 */
CVImport.prototype.getParsedSummary = function () {
  if (!this.parsedData || !this.parsedData.parsed) {
    return null;
  }

  const parsed = this.parsedData.parsed;

  return {
    hasPersonalInfo: !!parsed.personalInfo?.email,
    hasSummary: !!parsed.summary,
    skillsCount: parsed.skills?.length || 0,
    experienceCount: parsed.experience?.length || 0,
    educationCount: parsed.education?.length || 0,
    certificationsCount: parsed.certifications?.length || 0,
    achievementsCount: parsed.achievements?.length || 0,
    projectsCount: parsed.projects?.length || 0,
  };
};

/**
 * Get import summary
 */
CVImport.prototype.getImportSummary = function () {
  if (!this.importResults) {
    return null;
  }

  const results = this.importResults;

  return {
    hero: results.hero ? 1 : 0,
    about: results.about ? 1 : 0,
    skills: results.skills?.length || 0,
    experience: results.experience?.length || 0,
    education: results.education?.length || 0,
    certifications: results.certifications?.length || 0,
    achievements: results.achievements?.length || 0,
    projects: results.projects?.length || 0,
    social: results.social?.length || 0,
    settings: results.settings?.length || 0,
    total: (results.hero ? 1 : 0) +
      (results.about ? 1 : 0) +
      (results.skills?.length || 0) +
      (results.experience?.length || 0) +
      (results.education?.length || 0) +
      (results.certifications?.length || 0) +
      (results.achievements?.length || 0) +
      (results.projects?.length || 0) +
      (results.social?.length || 0) +
      (results.settings?.length || 0),
  };
};

// Class methods

/**
 * Get recent imports
 */
CVImport.getRecent = async function (limit = 10) {
  return await this.findAll({
    order: [['created_at', 'DESC']],
    limit,
    attributes: ['id', 'file_name', 'file_size', 'status', 'created_at', 'imported_at'],
  });
};

/**
 * Get imports by status
 */
CVImport.getByStatus = async function (status) {
  return await this.findAll({
    where: { status },
    order: [['created_at', 'DESC']],
  });
};

/**
 * Get successful imports
 */
CVImport.getSuccessful = async function () {
  return await this.getByStatus('imported');
};

/**
 * Get failed imports
 */
CVImport.getFailed = async function () {
  return await this.getByStatus('failed');
};

/**
 * Get imports pending review
 */
CVImport.getPendingReview = async function () {
  return await this.getByStatus('parsed');
};

/**
 * Clean up old imports
 */
CVImport.cleanupOld = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const oldImports = await this.findAll({
    where: {
      created_at: {
        [sequelize.Sequelize.Op.lt]: cutoffDate,
      },
      status: {
        [sequelize.Sequelize.Op.in]: ['uploaded', 'parsing', 'failed'],
      },
    },
  });

  // Delete files and records
  const fs = require('fs').promises;
  for (const importRecord of oldImports) {
    if (importRecord.filePath) {
      await fs.unlink(importRecord.filePath).catch(() => { });
    }
    await importRecord.destroy();
  }

  return oldImports.length;
};

module.exports = CVImport;
