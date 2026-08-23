/**
 * Export all corporate data from dev SQLite to JSON
 * Run: node backend/scripts/export-corporate-dev.js
 */
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

async function exportData() {
  await sequelize.authenticate();
  
  const data = {};

  const corporateTables = [
    'abouts',
    'services',
    'testimonials',
    'projects',
    'events',
    'referees',
    'social_accounts',
    'corporate_show_videos',
    'blog_posts',
    'settings',
    'heroes',
  ];

  for (const tbl of corporateTables) {
    const rows = await sequelize.query(`SELECT * FROM "${tbl}"`, { type: sequelize.QueryTypes.SELECT });
    data[tbl] = rows;
    console.log(`Exported ${rows.length} rows from ${tbl}`);
  }

  const outPath = path.join(__dirname, 'corporate-dev-export.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Exported to ${outPath}`);
  await sequelize.close();
}

exportData().catch(e => { console.error(e); process.exit(1); });
