/**
 * Database Initialization Script
 * Run this to ensure all tables are created in production
 */

const sequelize = require('../config/database');
const portfolioModels = require('../modes/portfolio/models');
const corporateModels = require('../modes/corporate/models');

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database models...');
    await sequelize.sync();
    console.log('✅ All models synchronized successfully');

    const dialect = sequelize.getDialect();
    console.log(`\n📊 Database dialect: ${dialect}`);

    if (dialect === 'postgres') {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      results.forEach(row => console.log(`  - ${row.table_name}`));
    } else if (dialect === 'sqlite') {
      const [results] = await sequelize.query(`
        SELECT name as table_name 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
      `);
      results.forEach(row => console.log(`  - ${row.table_name}`));
    }

    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initDatabase();
