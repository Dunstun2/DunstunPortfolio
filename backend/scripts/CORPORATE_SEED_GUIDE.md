# Corporate Website Data Seeding Guide

This guide explains how to export corporate website data from development and seed it to production.

## Overview

The seeding workflow has two scripts:
1. **`export-corporate-dev.js`** — Exports all corporate data from development SQLite database to JSON
2. **`seed-corporate-production.js`** — Seeds corporate data from the JSON export into production database

## Step 1: Export Development Data

Run this command in your development environment to dump all corporate data to a JSON file:

```bash
cd backend
node scripts/export-corporate-dev.js
```

**Output:**
- Creates `backend/scripts/corporate-dev-export.json`
- Contains all: Heroes, Abouts, Services, Testimonials, Projects, Events, Social Accounts, Videos, Blog Posts, Settings

**What's exported:**
```json
{
  "heroes": [...],
  "abouts": [...],
  "services": [...],
  "testimonials": [...],
  "projects": [...],
  "events": [...],
  "social_accounts": [...],
  "corporate_show_videos": [...],
  "blog_posts": [...],
  "settings": [...]
}
```

## Step 2: Deploy to Production

Move the `corporate-dev-export.json` file to your production server:

```bash
# From development to production server (using SCP/FTP/Git)
scp backend/scripts/corporate-dev-export.json user@prod-server:/path/to/portfolio/backend/scripts/
```

Or commit to version control and pull in production.

## Step 3: Seed to Production

On your production server, run:

```bash
cd backend
NODE_ENV=production DATABASE_URL=<your_production_db_url> node scripts/seed-corporate-production.js
```

**Example with Railway environment:**
```bash
NODE_ENV=production DATABASE_URL=postgresql://user:pass@host:port/dbname node scripts/seed-corporate-production.js
```

**Output:**
```
🌱 Corporate Production Seed Script
=====================================
Database: PostgreSQL (from DATABASE_URL)
Data Source: corporate-dev-export.json

✅ Production database connected.

🔄 Syncing tables...

📦 Seeding Corporate Hero...
  ✅ Created: Transforming Modern Business...
  → Created: 1 | Skipped (already exists): 0

📦 Seeding Services...
  ✅ Created: Web Development
  ✅ Created: UI/UX Design
  ✅ Created: Technical Consulting
  → Created: 3 | Skipped: 0

... (more seeding output)

🎉 ========================
🎉  All seeding complete!
🎉 ========================
```

## Features

### Safe Seeding
- ✅ **Idempotent**: Safe to run multiple times — skips records that already exist
- ✅ **No Data Loss**: Uses `findOrCreate` — existing records are never overwritten
- ✅ **Unique Keys**: Each model type has its own unique identifier (id, slug, etc.)

### Strict Data Requirement
- ✅ **Real Data Only**: Requires `corporate-dev-export.json` — no fallback to hardcoded defaults
- ✅ **Fails Fast**: Aborts if export file not found or is invalid
- ✅ **Validates Export**: Checks that export contains actual data before seeding
- ✅ **Error Messages**: Clear instructions if export is missing or empty

## Troubleshooting

### "FATAL: corporate-dev-export.json not found!"
**This is required.** You MUST export development data first.

**Solution:**
1. In DEVELOPMENT, run:
   ```bash
   node backend/scripts/export-corporate-dev.js
   ```
2. Deploy `corporate-dev-export.json` to production
3. Then run the seed script

### "DATABASE_URL environment variable is required"
**Solution:** Set your production database URL
```bash
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

### "Failed to parse corporate-dev-export.json"
**Causes:**
- File is corrupted or has invalid JSON syntax
- File was edited manually and broken

**Solution:** Re-export from development:
```bash
node backend/scripts/export-corporate-dev.js
```

### "No corporate data found in export"
**Cause:** The export file is empty (no data in development database)

**Solution:** 
1. Verify you have data in development database
2. Run export again:
   ```bash
   node backend/scripts/export-corporate-dev.js
   ```
3. Check file size: `ls -lh backend/scripts/corporate-dev-export.json`

### Some records say "Skipped (already exists)"
**This is normal.** The seed script uses unique keys to avoid duplicates:
- Heroes: matched by `id`
- Services: matched by `slug`
- Projects: matched by `slug`
- Testimonials: matched by `id`
- Etc.

If you want to force update existing records, you need to delete them first or modify the script.

## Workflow Checklist

- [ ] Test in development: `node backend/scripts/export-corporate-dev.js`
- [ ] Verify JSON file: `cat backend/scripts/corporate-dev-export.json`
- [ ] Push to production environment (Git or SCP)
- [ ] Set DATABASE_URL environment variable
- [ ] Run seed script: `NODE_ENV=production DATABASE_URL=... node backend/scripts/seed-corporate-production.js`
- [ ] Verify production data in admin dashboard or API
- [ ] Test corporate website in production

## Data Structure Reference

### Heroes
Contains main hero banner content (headline, CTA buttons, slides, etc.)

### Abouts
Company mission, vision, values, team info

### Services
Service offerings with descriptions, pricing, features

### Testimonials
Client feedback and reviews

### Projects
Case studies and portfolio projects

### Events
Speaking engagements, conferences, networking events

### Social Accounts
Social media links and profiles

### Corporate Show Videos
Hero videos and promotional content

### Blog Posts
Corporate blog articles and news

### Settings
Configuration: site name, colors, titles, CTAs, etc.

## Notes

- Each export captures the **current state** of development
- Export frequently when you make content changes
- Keep old exports for version control/rollback
- Test seed script in staging before production
- Always backup production database before seeding

## Related Commands

```bash
# Export development data
node backend/scripts/export-corporate-dev.js

# Seed production
NODE_ENV=production DATABASE_URL=<url> node backend/scripts/seed-corporate-production.js

# List all settings
psql <DATABASE_URL> -c "SELECT key, value FROM Settings WHERE key LIKE 'corporate_%';"

# Clear corporate data (use cautiously!)
# psql <DATABASE_URL> -c "DELETE FROM Settings WHERE key LIKE 'corporate_%';"
```

## Questions?

- Check corporate-dev-export.json structure
- Review model definitions in `backend/modes/corporate/models/`
- Inspect seeding logs for detailed error messages
