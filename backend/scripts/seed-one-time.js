#!/usr/bin/env node

/**
 * One-Time Seed Script for Production
 * ===================================
 * This script seeds corporate data ONCE and then removes itself.
 * Designed to run automatically in Railway on first deployment.
 * 
 * After running:
 * - Seeds all corporate data from corporate-dev-export.json
 * - Writes a flag file (.seed-complete) to prevent re-running
 * - Logs completion status
 * 
 * Manual trigger:
 *   NODE_ENV=production node backend/scripts/seed-one-time.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'production';

const path = require('path');
const fs = require('fs');

// Check if seed already ran
const seedCompleteFlag = path.join(__dirname, '.seed-complete');
if (fs.existsSync(seedCompleteFlag)) {
  console.log('ℹ️  Seed already completed. Skipping.\n');
  process.exit(0);
}

console.log('🌱 Running one-time corporate data seed...\n');

// Import and run the main seed script
require('./seed-corporate-production.js');

// After seed completes successfully, write flag file
setTimeout(() => {
  if (!fs.existsSync(seedCompleteFlag)) {
    fs.writeFileSync(seedCompleteFlag, `Seeded at: ${new Date().toISOString()}\n`, 'utf8');
    console.log('\n✅ Seed completed! Flag written to .seed-complete');
    console.log('   Future deployments will skip this seed automatically.\n');
  }
}, 1000);
