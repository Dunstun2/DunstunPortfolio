/**
 * Database Configuration
 * 
 * Automatically selects the appropriate database configuration
 * based on NODE_ENV environment variable:
 * - production: PostgreSQL with SSL support
 * - development/test: SQLite
 */

const path = require('path');

// Determine which configuration to use based on environment
const environment = process.env.NODE_ENV || 'development';

let sequelize;

if (environment === 'production') {
  // Use production PostgreSQL configuration
  sequelize = require('./database.production');
} else {
  // Use SQLite for development and testing
  const { Sequelize } = require('sequelize');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  });
}

module.exports = sequelize;
