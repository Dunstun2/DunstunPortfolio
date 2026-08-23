#!/usr/bin/env node

/**
 * Run Seed from Railway
 * ====================
 * This wrapper script ensures the seed runs correctly in Railway environment.
 * 
 * Usage:
 *   railway run node backend/scripts/run-seed-production.js
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Starting seed script in Railway environment...\n');

// Verify export file exists
const exportPath = path.join(__dirname, 'corporate-dev-export.json');
if (!fs.existsSync(exportPath)) {
  console.error('\n❌ FATAL: corporate-dev-export.json not found!');
  console.error('   This script requires the exported development data.\n');
  console.error('   To generate it, run in development:');
  console.error('   node backend/scripts/export-corporate-dev.js\n');
  console.error('   Then commit and push to your repository.\n');
  process.exit(1);
}

console.log('✅ Found corporate-dev-export.json');
console.log(`✅ DATABASE_URL available: ${process.env.DATABASE_URL ? 'Yes' : 'No'}\n`);

// Import and run the seed script
require('./seed-corporate-production.js');
