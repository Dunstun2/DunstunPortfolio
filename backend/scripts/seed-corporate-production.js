/**
 * Seed Corporate Website Data to Production
 * ==========================================
 * Seeds all corporate content from development database export (corporate-dev-export.json) to production.
 * Safe to run multiple times — skips records that already exist (by slug or unique identifier).
 *
 * WORKFLOW:
 * 1. Export development data: node backend/scripts/export-corporate-dev.js
 * 2. Deploy corporate-dev-export.json to production server
 * 3. Run seed: NODE_ENV=production DATABASE_URL=<your_url> node backend/scripts/seed-corporate-production.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Force production DB
process.env.NODE_ENV = 'production';

const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

// Import all corporate models
const {
  Hero, About, Service, Testimonial, Project,
  Event, SocialAccount, ShowVideo, BlogPost,
} = require('../modes/corporate/models');
const { Setting } = require('../modes/portfolio/models');

// ─── Load development export data (REQUIRED) ──────────────────────────────────

const exportPath = path.join(__dirname, 'corporate-dev-export.json');

if (!fs.existsSync(exportPath)) {
  console.error('\n❌ FATAL: corporate-dev-export.json not found!');
  console.error('   This script requires the exported development data.\n');
  console.error('   To generate it, run in DEVELOPMENT:');
  console.error('   node backend/scripts/export-corporate-dev.js\n');
  console.error('   Then deploy corporate-dev-export.json to production.\n');
  process.exit(1);
}

let developmentData = {};
try {
  developmentData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  console.log('✅ Loaded corporate-dev-export.json');
} catch (err) {
  console.error('\n❌ FATAL: Failed to parse corporate-dev-export.json');
  console.error(`   Error: ${err.message}\n`);
  process.exit(1);
}

// ─── SEED FUNCTIONS ────────────────────────────────────────────────────────────

async function seedWithCheck(Model, records, uniqueKey, label) {
  console.log(`\n📦 Seeding ${label}...`);
  let created = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      const where = {};
      if (uniqueKey === 'id') {
        where.id = record.id;
      } else if (Array.isArray(uniqueKey)) {
        uniqueKey.forEach(k => { where[k] = record[k]; });
      } else {
        where[uniqueKey] = record[uniqueKey];
      }

      const [, wasCreated] = await Model.findOrCreate({ where, defaults: record });
      if (wasCreated) {
        const name = record.title || record.name || record.full_name || record.author_name || record.platform_name || record.key || record.id;
        console.log(`  ✅ Created: ${name}`);
        created++;
      } else {
        skipped++;
      }
    } catch (err) {
      const name = record.title || record.name || record.full_name || record.slug || record.id;
      console.error(`  ❌ Failed to create "${name}": ${err.message}`);
    }
  }

  console.log(`  → Created: ${created} | Skipped (already exists): ${skipped}`);
}

async function seedSettings(settingsArray) {
  console.log('\n📦 Seeding Settings...');
  let created = 0;
  let skipped = 0;

  for (const s of settingsArray) {
    const [, wasCreated] = await Setting.findOrCreate({ where: { key: s.key }, defaults: { value: s.value } });
    if (wasCreated) {
      console.log(`  ✅ Created setting: ${s.key}`);
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`  → Created: ${created} | Skipped: ${skipped}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('🌱 Corporate Production Seed Script');
    console.log('=====================================');
    console.log(`Database: ${process.env.DATABASE_URL ? 'PostgreSQL (from DATABASE_URL)' : 'Not set!'}`);
    console.log(`Data Source: corporate-dev-export.json\n`);

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is required for production seeding.');
      console.error('   Usage: DATABASE_URL=<url> node backend/scripts/seed-corporate-production.js');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('✅ Production database connected.\n');

    // Sync all tables (safe, no force)
    console.log('🔄 Syncing tables...');
    await sequelize.sync({ alter: false, force: false });

    // Extract data from export (no fallbacks - real data only)
    const heroData = developmentData.heroes?.[0];
    const aboutsData = developmentData.abouts || [];
    const servicesData = developmentData.services || [];
    const testimonialsData = developmentData.testimonials || [];
    const projectsData = developmentData.projects || [];
    const eventsData = developmentData.events || [];
    const socialAccountsData = developmentData.social_accounts || [];
    const showVideosData = developmentData.corporate_show_videos || [];
    const blogPostsData = developmentData.blog_posts || [];
    const settingsArray = developmentData.settings || [];

    // Verify we have data to seed
    if (!heroData && !aboutsData.length && !servicesData.length) {
      console.warn('⚠️  No corporate data found in export. Aborting seed.');
      console.error('   corporate-dev-export.json appears to be empty.');
      process.exit(1);
    }

    // Seed in order
    if (heroData) {
      await seedWithCheck(Hero, [heroData], 'id', 'Corporate Hero');
    } else {
      console.log('\n⚠️  No hero data in export');
    }

    if (aboutsData.length > 0) {
      await seedWithCheck(About, aboutsData, 'id', 'Abouts');
    }

    if (servicesData.length > 0) {
      await seedWithCheck(Service, servicesData, 'slug', 'Services');
    }

    if (testimonialsData.length > 0) {
      await seedWithCheck(Testimonial, testimonialsData, 'id', 'Testimonials');
    }

    if (projectsData.length > 0) {
      await seedWithCheck(Project, projectsData, 'slug', 'Projects');
    }

    if (eventsData.length > 0) {
      await seedWithCheck(Event, eventsData, 'slug', 'Events');
    }

    if (socialAccountsData.length > 0) {
      await seedWithCheck(SocialAccount, socialAccountsData, 'id', 'Social Accounts');
    }

    if (showVideosData.length > 0) {
      await seedWithCheck(ShowVideo, showVideosData, 'id', 'Show Videos');
    }

    if (blogPostsData.length > 0) {
      await seedWithCheck(BlogPost, blogPostsData, 'slug', 'Blog Posts');
    }

    // Seed settings from export
    if (settingsArray.length > 0) {
      await seedSettings(settingsArray);
    }

    console.log('\n🎉 ========================');
    console.log('🎉  All seeding complete!');
    console.log('🎉 ========================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
