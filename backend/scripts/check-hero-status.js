#!/usr/bin/env node

/**
 * Quick check: What hero records exist and their status
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// For development, ensure we're using SQLite
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite:./database.sqlite';
}

const sequelize = require('../config/database');
const { Hero } = require('../modes/corporate/models');

async function check() {
  try {
    await sequelize.authenticate();

    console.log('\n📋 HERO RECORDS:\n');

    const heroes = await Hero.findAll({ raw: true });

    if (heroes.length === 0) {
      console.log('No hero records found\n');
    } else {
      heroes.forEach((h, i) => {
        console.log(`${i + 1}. ${h.internal_name || h.id}`);
        console.log(`   Status: ${h.status} ${h.status === 'published' ? '✓' : '✗'}`);
        console.log(`   Active: ${h.is_active} ${h.is_active ? '✓' : '✗ ISSUE!'}`);
        console.log(`   Headline: ${h.headline?.substring(0, 50)}...\n`);
      });
    }

    console.log('\n📋 SERVICES RECORDS:\n');
    const { Service } = require('../modes/corporate/models');
    const services = await Service.findAll({ raw: true });

    if (services.length === 0) {
      console.log('No service records found\n');
    } else {
      console.log(`Total: ${services.length}\n`);
      services.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name}`);
        console.log(`   Status: ${s.status} ${s.status === 'published' ? '✓' : '✗'}`);
        console.log(`   Featured: ${s.featured}\n`);
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

check();
