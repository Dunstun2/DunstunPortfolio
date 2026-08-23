#!/usr/bin/env node

/**
 * Railway Wrapper for Cleanup Script
 * ==================================
 * Runs cleanup-bad-about.js in the Railway environment
 * 
 * Usage (from Railway CLI):
 *   railway run NODE_ENV=production node backend/scripts/run-cleanup-production.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
process.env.NODE_ENV = 'production';

// If DATABASE_URL not set, try to get from environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set.');
  console.error('   Make sure you run this with Railway CLI:');
  console.error('   railway run NODE_ENV=production node backend/scripts/run-cleanup-production.js');
  process.exit(1);
}

require('./cleanup-bad-about.js');
