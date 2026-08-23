#!/usr/bin/env node

/**
 * Diagnostic Script: Why Seeded Corporate Data Isn't Rendering
 * =============================================================
 * This script checks:
 * 1. Hero records exist and have correct status/is_active flags
 * 2. Services records exist and have correct status/featured flags  
 * 3. About data has correct businessType in corporate_data
 * 4. What the frontend API would actually return
 *
 * Usage:
 *   Development: node backend/scripts/diagnose-corporate-rendering.js
 *   Production:  NODE_ENV=production node backend/scripts/diagnose-corporate-rendering.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const sequelize = require('../config/database');
const { Hero, About, Service } = require('../modes/corporate/models');

async function diagnose() {
  try {
    await sequelize.authenticate();
    console.log(`\n🔍 Diagnosing Corporate Data Rendering\n`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // ─── CHECK 1: HERO RECORDS ─────────────────────────────────────────────
    console.log('📋 HERO RECORDS IN DATABASE:');
    const allHeroes = await Hero.findAll();
    console.log(`   Total heroes: ${allHeroes.length}`);

    if (allHeroes.length > 0) {
      allHeroes.forEach((h, i) => {
        console.log(`\n   Hero #${i + 1}:`);
        console.log(`   • ID: ${h.id}`);
        console.log(`   • Name: ${h.internal_name}`);
        console.log(`   • Status: ${h.status} (required: 'published')`);
        console.log(`   • is_active: ${h.is_active} (required: true) ${h.is_active ? '✅' : '❌ BLOCKING'}`);
        console.log(`   • Has headline: ${!!h.headline}`);
        console.log(`   • Published at: ${h.published_at}`);
      });
    }

    // ─── CHECK 1B: WHAT FRONTEND WOULD GET ────────────────────────────────
    console.log(`\n📡 WHAT FRONTEND API /corporate/hero/published RETURNS:`);
    try {
      const heroResult = await Hero.findOne({
        where: { status: 'published', is_active: true, internal_name: 'Corporate Hero' },
        order: [['published_at', 'DESC']]
      });
      
      if (heroResult) {
        console.log(`   ✅ FOUND! Hero will render:`);
        console.log(`   • Headline: ${heroResult.headline?.substring(0, 60)}...`);
        console.log(`   • Subheadline: ${heroResult.subheadline?.substring(0, 60)}...`);
      } else {
        // Try without the specific filter
        const anyHero = await Hero.findOne({
          where: { status: 'published', is_active: true },
          order: [['published_at', 'DESC']]
        });
        
        if (anyHero) {
          console.log(`   ✅ FOUND (generic)! Hero will render:`);
          console.log(`   • Headline: ${anyHero.headline?.substring(0, 60)}...`);
        } else {
          console.log(`   ❌ NO HERO FOUND! Checking why:`);
          
          const publishedHeroes = await Hero.findAll({ where: { status: 'published' } });
          console.log(`      - Published heroes: ${publishedHeroes.length}`);
          publishedHeroes.forEach(h => {
            console.log(`        • ${h.internal_name}: is_active=${h.is_active} (need true)`);
          });
          
          const activeHeroes = await Hero.findAll({ where: { is_active: true } });
          console.log(`      - Active heroes: ${activeHeroes.length}`);
          activeHeroes.forEach(h => {
            console.log(`        • ${h.internal_name}: status=${h.status} (need 'published')`);
          });
        }
      }
    } catch (err) {
      console.log(`   ❌ Error querying: ${err.message}`);
    }

    // ─── CHECK 2: SERVICES RECORDS ────────────────────────────────────────
    console.log(`\n\n📋 SERVICES RECORDS IN DATABASE:`);
    const allServices = await Service.findAll();
    console.log(`   Total services: ${allServices.length}`);

    if (allServices.length > 0) {
      allServices.forEach((s, i) => {
        console.log(`\n   Service #${i + 1}:`);
        console.log(`   • Name: ${s.name}`);
        console.log(`   • Status: ${s.status} (required: 'published') ${s.status === 'published' ? '✅' : '❌'}`);
        console.log(`   • Featured: ${s.featured} ${s.featured ? '⭐' : ''}`);
        console.log(`   • Display order: ${s.display_order}`);
      });
    }

    // ─── CHECK 2B: WHAT FRONTEND WOULD GET ────────────────────────────────
    console.log(`\n📡 WHAT FRONTEND API /corporate/services/published RETURNS:`);
    const services = await Service.findAll({
      where: { status: 'published' },
      order: [['display_order', 'ASC'], ['published_at', 'DESC']]
    });

    console.log(`   Found: ${services.length} published services`);
    if (services.length > 0) {
      console.log(`   ✅ Services will render!`);
      services.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.name} (featured: ${s.featured})`);
      });
    } else {
      console.log(`   ❌ NO PUBLISHED SERVICES!`);
      const statusCheck = await Service.findAll();
      if (statusCheck.length === 0) {
        console.log(`      No services in DB at all`);
      } else {
        statusCheck.forEach(s => {
          console.log(`      • ${s.name}: status=${s.status} (need 'published')`);
        });
      }
    }

    // ─── CHECK 3: ABOUT DATA ──────────────────────────────────────────────
    console.log(`\n\n📋 ABOUT RECORDS IN DATABASE:`);
    const abouts = await About.findAll();
    console.log(`   Total about records: ${abouts.length}`);

    if (abouts.length > 0) {
      abouts.forEach((a, i) => {
        let corpData = {};
        
        // Try parsing corporate_data if it's a string
        if (typeof a.corporate_data === 'string') {
          try {
            corpData = JSON.parse(a.corporate_data);
          } catch (e) {
            corpData = { error: 'Failed to parse' };
          }
        } else {
          corpData = a.corporate_data || {};
        }

        console.log(`\n   About #${i + 1}:`);
        console.log(`   • Title: ${a.title}`);
        console.log(`   • Status: ${a.status}`);
        console.log(`   • Business Type: ${corpData.business_type || 'NOT SET'}`);

        if (corpData.business_type === 'products') {
          console.log(`      ❌ BLOCKING: business_type='products' hides services!`);
        } else if (corpData.business_type === 'services' || corpData.business_type === 'both') {
          console.log(`      ✅ Services will render`);
        }
      });
    }

    // ─── SUMMARY ──────────────────────────────────────────────────────────
    console.log(`\n\n📊 RENDERING SUMMARY:`);
    console.log(`   ─────────────────────────`);

    const hasActiveHero = await Hero.count({ 
      where: { status: 'published', is_active: true }
    });
    console.log(`   Hero will render: ${hasActiveHero > 0 ? '✅ YES' : '❌ NO'}`);

    const hasPublishedServices = await Service.count({ 
      where: { status: 'published' }
    });
    console.log(`   Services will render: ${hasPublishedServices > 0 ? '✅ YES' : '❌ NO'}`);

    const about = await About.findOne();
    let businessType = 'unknown';
    if (about && typeof about.corporate_data === 'string') {
      try {
        const corpData = JSON.parse(about.corporate_data);
        businessType = corpData.business_type || 'unknown';
      } catch (e) {
        businessType = 'error';
      }
    }
    console.log(`   Business Type: ${businessType}`);
    console.log(`   ─────────────────────────\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

diagnose();
