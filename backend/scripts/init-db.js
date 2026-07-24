/**
 * Database Initialization Script
 * Run this to ensure all tables are created in production
 */

const sequelize = require('../config/database');
const models = require('../models');

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized successfully');

    console.log('\n📊 Database tables:');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    results.forEach(row => console.log(`  - ${row.table_name}`));

    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initDatabase();
