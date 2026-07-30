/**
 * Migration script for About page revamp (SQLite-safe)
 * 
 * SQLite doesn't support DROP COLUMN, so we:
 * 1. Disable foreign keys
 * 2. Create a new table with the correct schema
 * 3. Copy over the data from the old table (only shared columns)
 * 4. Drop child tables, drop old table, rename new table
 * 5. Recreate child tables with foreign keys to the new table
 * 6. Re-enable foreign keys
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = require('../config/database');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected.\n');

    // Disable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = OFF');
    console.log('Foreign keys disabled.');

    // Step 1: Get existing columns
    const [existingCols] = await sequelize.query("PRAGMA table_info('abouts')");
    const colNames = existingCols.map(c => c.name);
    console.log('Existing columns:', colNames.join(', '));

    // Step 2: Drop abouts_new if it exists from a previous failed run
    await sequelize.query('DROP TABLE IF EXISTS abouts_new');

    // Step 3: Create new table with the correct schema
    console.log('\nCreating abouts_new with updated schema...');
    await sequelize.query(`
      CREATE TABLE abouts_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        resume_url TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        professional_title TEXT,
        personal_introduction TEXT,
        professional_summary TEXT,
        mission_statement TEXT,
        vision_statement TEXT,
        interests TEXT DEFAULT '[]',
        statistics TEXT DEFAULT '[]',
        published_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✓ abouts_new created.');

    // Step 4: Copy data from old table to new (only columns that exist in both)
    const newCols = [
      'id', 'title', 'content', 'resume_url', 'image_url', 'status',
      'vision_statement', 'published_at', 'created_at', 'updated_at'
    ];
    const sharedCols = newCols.filter(c => colNames.includes(c));
    const colList = sharedCols.join(', ');

    console.log(`\nCopying data (columns: ${colList})...`);
    await sequelize.query(`INSERT INTO abouts_new (${colList}) SELECT ${colList} FROM abouts`);
    console.log('✓ Data copied.');

    // Step 5: Drop old table and rename
    console.log('\nSwapping tables...');
    await sequelize.query('DROP TABLE abouts');
    await sequelize.query('ALTER TABLE abouts_new RENAME TO abouts');
    console.log('✓ Table swapped.');

    // Step 6: Drop about_identity_cards
    console.log('\nDropping about_identity_cards...');
    await sequelize.query('DROP TABLE IF EXISTS about_identity_cards');
    console.log('✓ about_identity_cards dropped.');

    // Step 7: Clean up failed sequelize-cli migration state
    await sequelize.query(`DELETE FROM "SequelizeMeta" WHERE name = '20260730-update-about-fields.js'`).catch(() => {});

    // Re-enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('Foreign keys re-enabled.');

    // Verify
    const [results] = await sequelize.query("PRAGMA table_info('abouts')");
    console.log('\n--- Final abouts schema ---');
    results.forEach(col => console.log(`  ${col.name} (${col.type})`));

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    // Re-enable FK even on failure
    await sequelize.query('PRAGMA foreign_keys = ON').catch(() => {});
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

migrate();
