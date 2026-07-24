/**
 * Sequelize CLI Configuration for Migrations
 * 
 * This is used by sequelize-cli commands:
 * - npx sequelize-cli db:migrate
 * - npx sequelize-cli db:seed:all
 * 
 * It automatically selects the correct database based on NODE_ENV
 */

require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  },
  
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  
  production: {
    // Option 1: Use DATABASE_URL (Railway, Render, Heroku)
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    
    // Option 2: Fallback to individual variables if DATABASE_URL not set
    ...(process.env.DATABASE_URL ? {} : {
      use_env_variable: undefined,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
    }),
    
    // Connection pool
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
};
