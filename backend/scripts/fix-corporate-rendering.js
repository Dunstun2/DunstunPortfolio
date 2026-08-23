#!/usr/bin/env node

/**
 * FIX: Ensure Corporate Data Renders Correctly
 * ===============================================
 * 
 * This script fixes the seeding issues:
 * 1. Hero: Ensures is_active=true (required for rendering)
 * 2. Services: Verifies status=published (required for rendering)
 * 3. About: Makes sure the CORRECT about record is published
 *    (The one with business_type !== 'products' so services show)
 * 
 * Usage:
 *   Development: node backend/scripts/fix-corporate-rendering.js
 *   Production:  NODE_ENV=production node backend/scripts/fix-corporate-rendering.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const path = require('path');
const { Sequelize } = require('sequelize');

// Use SQLite for development, or DATABASE_URL if production
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: { ssl: false }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
  });
}

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('\n🔧 Fixing Corporate Data Rendering\n');

    // ─── FIX 1: HERO ───────────────────────────────────────────────────
    console.log('1️⃣  Fixing Hero records...');
    const heroUpdate = await sequelize.query(
      'UPDATE Heroes SET is_active = true, status = ? WHERE internal_name = ?',
      { replacements: ['published', 'Corporate Hero'] }
    );
    console.log('   ✓ Corporate Hero: Ensured is_active=true, status=published\n');

    // ─── FIX 2: SERVICES ──────────────────────────────────────────────
    console.log('2️⃣  Fixing Services records...');
    const servicesUpdate = await sequelize.query(
      'UPDATE Services SET status = ? WHERE status != ?',
      { replacements: ['published', 'published'] }
    );
    console.log('   ✓ Services: Ensured status=published\n');

    // ─── FIX 3: ABOUT (Critical for services visibility) ────────────
    console.log('3️⃣  Fixing About records...');

    // Find all about records and their business_type
    const [aboutRecords] = await sequelize.query(
      'SELECT id, title, corporate_data FROM Abouts ORDER BY published_at DESC'
    );

    console.log(`   Found ${aboutRecords.length} About records\n`);

    let primaryAbout = null;
    for (const record of aboutRecords) {
      try {
        let corpData = record.corporate_data;
        if (typeof corpData === 'string') {
          corpData = JSON.parse(corpData);
        }

        console.log(`   • ${record.title}`);
        console.log(`     Business Type: ${corpData?.business_type || 'NOT SET'}`);

        // Prefer the one with business_type !== 'products' and has hero data
        if (!primaryAbout && corpData?.business_type !== 'products' && corpData?.hero_headline) {
          primaryAbout = record;
          console.log(`     ✓ SELECTED as primary (business_type allows services)\n`);
        } else {
          console.log(`\n`);
        }
      } catch (e) {
        console.log(`     Error parsing corporate_data\n`);
      }
    }

    if (primaryAbout) {
      // Archive all other abouts
      await sequelize.query(
        'UPDATE Abouts SET status = ? WHERE id != ?',
        { replacements: ['archived', primaryAbout.id] }
      );

      // Publish the correct one
      await sequelize.query(
        'UPDATE Abouts SET status = ?, published_at = ? WHERE id = ?',
        { replacements: ['published', new Date(), primaryAbout.id] }
      );

      console.log(`   ✓ Published: ${primaryAbout.title}`);
      console.log(`   ✓ Archived: Other About records\n`);
    } else {
      console.log(`   ⚠️  No suitable About record found\n`);
    }

    // ─── VERIFY ────────────────────────────────────────────────────────
    console.log('\n✅ VERIFICATION:\n');

    // Check hero
    const [heroCheck] = await sequelize.query(
      'SELECT internal_name, status, is_active FROM Heroes WHERE internal_name = ? LIMIT 1',
      { replacements: ['Corporate Hero'] }
    );
    if (heroCheck.length > 0) {
      const h = heroCheck[0];
      console.log(`Hero: ${h.status === 'published' && h.is_active ? '✅ READY' : '❌ ISSUE'}`);
    }

    // Check services
    const [serviceCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM Services WHERE status = ?',
      { replacements: ['published'] }
    );
    console.log(`Services: ${serviceCount[0].count} published ${serviceCount[0].count > 0 ? '✅ READY' : '❌ NONE'}`);

    // Check about
    const [aboutCheck] = await sequelize.query(
      `SELECT corporate_data FROM Abouts WHERE status = ? ORDER BY published_at DESC LIMIT 1`,
      { replacements: ['published'] }
    );
    if (aboutCheck.length > 0) {
      try {
        let corpData = aboutCheck[0].corporate_data;
        if (typeof corpData === 'string') {
          corpData = JSON.parse(corpData);
        }
        const businessType = corpData?.business_type || 'unknown';
        const willShowServices = businessType !== 'products';
        console.log(`About: business_type="${businessType}" ${willShowServices ? '✅ READY (services will show)' : '❌ ISSUE (services hidden)'}`);
      } catch (e) {
        console.log(`About: ❌ Error parsing corporate_data`);
      }
    }

    console.log('\n✨ Fix complete!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

fix();
