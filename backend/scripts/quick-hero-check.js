#!/usr/bin/env node

/**
 * Super simple check to see Hero records  
 */

const path = require('path');
const { Sequelize } = require('sequelize');

// Use SQLite directly
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Query Heroes table directly
    const [heroes] = await sequelize.query('SELECT id, internal_name, status, is_active, headline FROM Heroes');
    
    console.log('HERO RECORDS:');
    if (heroes.length === 0) {
      console.log('  No heroes\n');
    } else {
      heroes.forEach((h, i) => {
        console.log(`\n  ${i+1}. ${h.internal_name || 'N/A'}`);
        console.log(`     Status: ${h.status}`);
        console.log(`     Active: ${h.is_active}`);
        if (h.headline) console.log(`     Headline: ${h.headline.substring(0, 50)}...`);
      });
    }

    // Query Services table
    const [services] = await sequelize.query('SELECT id, name, status, featured FROM Services');
    
    console.log(`\n\nSERVICES RECORDS:`);
    if (services.length === 0) {
      console.log('  No services\n');
    } else {
      console.log(`  Total: ${services.length}`);
      services.forEach((s, i) => {
        console.log(`\n  ${i+1}. ${s.name}`);
        console.log(`     Status: ${s.status}`);
        console.log(`     Featured: ${s.featured}`);
      });
    }

    // Query About table
    const [abouts] = await sequelize.query('SELECT id, title, corporate_data FROM Abouts');
    
    console.log(`\n\nABOUT RECORDS:`);
    if (abouts.length === 0) {
      console.log('  No about records\n');
    } else {
      abouts.forEach((a, i) => {
        console.log(`\n  ${i+1}. ${a.title}`);
        try {
          const corpData = typeof a.corporate_data === 'string' ? JSON.parse(a.corporate_data) : a.corporate_data;
          console.log(`     Business Type: ${corpData?.business_type || 'NOT SET'}`);
          if (corpData?.hero_headline) {
            console.log(`     Hero Headline: ${corpData.hero_headline.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`     (corporate_data parse error)`);
        }
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

check();
