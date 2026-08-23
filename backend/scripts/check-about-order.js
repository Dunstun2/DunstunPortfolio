#!/usr/bin/env node

const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

async function check() {
  try {
    await sequelize.authenticate();

    // Query what the API actually returns for /corporate/about/published
    const [result] = await sequelize.query(
      'SELECT id, title, status, published_at, corporate_data FROM Abouts WHERE status = ? ORDER BY published_at DESC LIMIT 1',
      { replacements: ['published'] }
    );

    if (result.length > 0) {
      const about = result[0];
      console.log('\n📡 WHAT /corporate/about/published RETURNS:\n');
      console.log(`Title: ${about.title}`);
      console.log(`Status: ${about.status}`);
      console.log(`Published: ${about.published_at}`);
      
      try {
        let corpData = about.corporate_data;
        if (typeof corpData === 'string') {
          corpData = JSON.parse(corpData);
        }
        console.log(`Business Type: ${corpData?.business_type || 'NOT SET'}`);
        
        if (corpData?.business_type === 'products') {
          console.log(`\n❌ ISSUE: Services will be HIDDEN because business_type='products'`);
        } else {
          console.log(`\n✅ OK: Services will SHOW because business_type='${corpData?.business_type}'`);
        }
      } catch (e) {
        console.log(`\nError parsing corporate_data`);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

check();
