#!/usr/bin/env node

/**
 * Cleanup Script: Remove Bad About Record
 * ========================================
 * Removes the "Comrades360 Software Developers Limited" About record
 * that has business_type: 'products' and blocks services from displaying.
 * 
 * This record was created during testing and should not be in production.
 * Safe to run multiple times (idempotent).
 * 
 * Usage:
 *   NODE_ENV=production node backend/scripts/cleanup-bad-about.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'production';

const sequelize = require('../config/database');
const { About } = require('../modes/corporate/models');

async function cleanup() {
  try {
    console.log('🧹 Cleanup: Removing bad About record...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is required.');
      console.error('   Usage: DATABASE_URL=<url> node backend/scripts/cleanup-bad-about.js');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('✅ Connected to production database.\n');

    // Find and delete the "Comrades360" About record
    const badAbout = await About.findOne({
      where: { title: 'Comrades360 Software Developers Limitted' }
    });

    if (!badAbout) {
      console.log('ℹ️  No bad About record found. Already cleaned up or never existed.');
      console.log('   The services should now display correctly on the homepage.\n');
      process.exit(0);
    }

    console.log(`Found bad record: "${badAbout.title}"`);
    console.log(`ID: ${badAbout.id}`);
    
    // Check business_type to confirm it's the right record
    let corpData = {};
    try {
      corpData = typeof badAbout.corporate_data === 'string' 
        ? JSON.parse(badAbout.corporate_data) 
        : badAbout.corporate_data;
    } catch (e) {
      // If can't parse, still delete it (it's corrupted)
    }

    if (corpData.business_type === 'products') {
      console.log(`Business Type: ${corpData.business_type} (BLOCKING SERVICES)\n`);
      
      await badAbout.destroy();
      console.log('✅ Bad About record deleted successfully!\n');
      console.log('🎉 Services will now display on the corporate homepage.\n');
    } else {
      console.warn('⚠️  Found record but business_type is not "products".');
      console.warn(`   Current: ${corpData.business_type}`);
      console.warn('   Aborting deletion to be safe.\n');
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Cleanup failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

cleanup();
