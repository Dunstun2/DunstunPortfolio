# Seeding Corporate Data to Production

## Overview

Your corporate website data has been exported from development and is ready to seed production. The seeding process is **automated and one-time only** to prevent accidental data duplication.

## What Was Pushed to GitHub

✅ **Export Script**: `backend/scripts/export-corporate-dev.js`
- Exports all corporate data from development to JSON

✅ **Seed Script**: `backend/scripts/seed-corporate-production.js`
- Seeds JSON data to production database

✅ **One-Time Wrapper**: `backend/scripts/seed-one-time.js`
- Runs seed once, then prevents re-running with `.seed-complete` flag

✅ **GitHub Actions Workflow**: `.github/workflows/seed-production.yml`
- Automatically triggers when you push corporate data changes
- Can also be manually triggered

✅ **Export Data**: `backend/scripts/corporate-dev-export.json`
- Real data from your development database (2 heroes, 4 services, 8 testimonials, 7 projects, 4 events, etc.)

✅ **Documentation**: Full guides in `backend/scripts/`

## How to Trigger the Seed

### Option 1: Manual GitHub Actions Trigger (Recommended)

1. Go to GitHub → Your Repository
2. Click **Actions** tab
3. Select **"Seed Production Corporate Data"** workflow
4. Click **Run workflow** button
5. Leave branch as `main`
6. Click **Run workflow**

**Status**: Check the workflow run in real-time. It will:
- ✅ Checkout code
- ✅ Install dependencies
- ✅ Verify export data
- ✅ Run seed script
- ✅ Complete or show errors

### Option 2: Push Trigger

The workflow automatically runs when you:
1. Push changes to `backend/scripts/corporate-dev-export.json`
2. Push changes to `backend/scripts/seed-one-time.js`

```bash
# Example: Update export and auto-trigger seed
node backend/scripts/export-corporate-dev.js
git add backend/scripts/corporate-dev-export.json
git commit -m "update: Export latest corporate data"
git push origin main
# ➜ GitHub Actions automatically triggers seed workflow
```

### Option 3: Railway CLI (Alternative)

If you have Railway CLI installed:

```bash
railway run NODE_ENV=production node backend/scripts/seed-one-time.js
```

## What Gets Seeded

| Item | Count | Notes |
|------|-------|-------|
| Heroes | 2 | Homepage + Corporate hero |
| About | 2 | Company info |
| Services | 4 | Web Dev, UI/UX, Consulting, E-commerce |
| Testimonials | 8 | Client feedback |
| Projects | 7 | Case studies |
| Events | 4 | Speaking engagements |
| Social Accounts | 3 | TikTok, Facebook, WhatsApp |
| Show Videos | 3 | Showcase videos |
| Blog Posts | 5 | Articles |
| Settings | 113 | Configuration (colors, titles, CTAs, etc.) |

**Total Records**: 150+

## One-Time Safety

The seed is **one-time only**:

1. First run: ✅ Seeds all data
2. Creates `.seed-complete` flag file
3. Future runs: ⏭️ Skip (flag exists)

**Why?** Prevents accidental data duplication on redeploys.

### If You Need to Re-seed

Delete the flag file:

```bash
# From Railway CLI
railway run rm backend/scripts/.seed-complete
```

Or use Railway Dashboard → Shell → run the command.

Then re-run the seed script.

## Verification

After seeding completes, verify in production:

1. **Admin Dashboard**: http://your-domain.com/admin
2. **Corporate Pages**: Check `/about`, `/services`, `/projects`
3. **API**: `GET http://your-api.com/api/settings` (check corporate settings)

## Current Data

Your development export includes:
- ✅ Corporate logo URL: `https://res.cloudinary.com/...`
- ✅ Logo width setting: `1000px`
- ✅ Responsive navbar implementation
- ✅ Site mode: `corporate`
- ✅ All services, testimonials, projects, blog posts

## Troubleshooting

### GitHub Actions Shows Red (Failed)

1. **Check DATABASE_URL secret**: GitHub Settings → Secrets → `DATABASE_URL` exists?
2. **Check export data**: Is `corporate-dev-export.json` valid JSON?
3. **Check logs**: Click workflow run → expand failed step → see error message

### Seed Completed but No Data in Production

1. Check database connection: Run `SELECT COUNT(*) FROM Services;`
2. Check if seed actually ran: Look for `.seed-complete` file
3. Verify settings: `SELECT * FROM Settings WHERE key LIKE 'corporate%';`

### "Already seeded" on Manual Trigger

This is correct — the seed already ran. If you need to re-seed:
1. Run: `railway run rm backend/scripts/.seed-complete`
2. Re-trigger the GitHub Actions workflow

## Next Steps

1. ✅ Verify corporate data appears in production
2. ✅ Test corporate website features
3. ✅ Check responsive navbar with logo
4. ✅ Confirm all settings applied

## File Locations

```
backend/scripts/
├── export-corporate-dev.js          # Export dev data to JSON
├── seed-corporate-production.js     # Main seed logic
├── seed-one-time.js                 # One-time wrapper
├── run-seed-production.js           # Railway wrapper
├── seed-production.sh               # Bash alternative
├── corporate-dev-export.json        # Exported data
├── .seed-complete                   # Flag file (created after first run)
├── CORPORATE_SEED_GUIDE.md          # Full guide
└── PRODUCTION_SEED_SETUP.md         # Railway setup guide

.github/workflows/
└── seed-production.yml              # GitHub Actions workflow
```

## Security Notes

- ✅ Export only runs in development (local machine)
- ✅ Seed only runs in production (GitHub Actions or Railway)
- ✅ Database credentials never exposed in code
- ✅ One-time flag prevents accidental re-seeding
- ✅ All data validated before seeding

## Documentation

For detailed information, see:
- `backend/scripts/CORPORATE_SEED_GUIDE.md` — Complete seeding guide
- `backend/scripts/PRODUCTION_SEED_SETUP.md` — Railway setup
- `.github/workflows/seed-production.yml` — Workflow definition

## Questions?

Refer to the guides above or check the workflow logs in GitHub Actions for detailed error messages.
