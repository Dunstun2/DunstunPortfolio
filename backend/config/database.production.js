/**
 * Production Database Configuration
 * 
 * This configuration is designed for PostgreSQL in production.
 * It includes connection pooling, SSL support, and error handling.
 * 
 * Environment Variables Required:
 * - DATABASE_URL (Railway/Render/Heroku) OR individual DB_ variables
 * - DB_SSL (set to 'true' for hosted databases)
 */

const { Sequelize } = require('sequelize');
const logger = require('./logger');

/**
 * Parse DATABASE_URL if provided (common in Railway, Render, Heroku)
 * Format: postgresql://user:password@host:port/database
 */
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    logger.info('Using DATABASE_URL for database connection');
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for some hosted databases
        },
      },
    };
  }

  // Fallback to individual environment variables
  logger.info('Using individual DB environment variables');
  return {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  };
}

const dbConfig = getDatabaseConfig();

/**
 * Initialize Sequelize with production settings
 */
const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, {
      dialect: 'postgres',
      dialectOptions: dbConfig.dialectOptions,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      
      // Connection pool configuration
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      },
      
      // Retry configuration
      retry: {
        max: 3,
        timeout: 5000,
      },
      
      // Query options
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },
    })
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      dialectOptions: dbConfig.dialectOptions,
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      
      // Connection pool configuration
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      },
      
      // Retry configuration
      retry: {
        max: 3,
        timeout: 5000,
      },
      
      // Query options
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },
    });

/**
 * Test database connection on initialization
 */
sequelize
  .authenticate()
  .then(() => {
    logger.info('✓ Database connection established successfully');
    logger.info(`✓ Connected to: ${dbConfig.host || 'DATABASE_URL'}`);
  })
  .catch((err) => {
    logger.error('✗ Unable to connect to the database:', err.message);
    logger.error('Database configuration:', {
      dialect: dbConfig.dialect,
      host: dbConfig.host || 'URL',
      database: dbConfig.database || 'From URL',
      ssl: dbConfig.dialectOptions?.ssl ? 'enabled' : 'disabled',
    });
  });

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connection...');
  await sequelize.close();
  logger.info('Database connection closed');
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connection...');
  await sequelize.close();
  logger.info('Database connection closed');
});

module.exports = sequelize;
