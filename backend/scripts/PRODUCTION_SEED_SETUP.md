# Running Seed in Production (Railway)

The seed script cannot be run from your local machine due to network restrictions on the Railway database proxy. **It must be run FROM Railway** where it has direct access to the internal database.

## Workflow

### Step 1: Export Development Data (Local)

```bash
node backend/scripts/export-corporate-dev.js
```

This creates `backend/scripts/corporate-dev-export.json` with your live corporate data.

### Step 2: Commit & Push to Repository

```bash
git add backend/scripts/corporate-dev-export.json
git commit -m "feat: Export corporate website data for production seeding"
git push origin main
```

### Step 3: Run Seed in Railway Environment

**Option A: Using Railway CLI (Recommended)**

```bash
railway run node backend/scripts/run-seed-production.js
```

**Option B: Using Node command**

```bash
railway run NODE_ENV=production node backend/scripts/seed-corporate-production.js
```

**Option C: As a one-time Railway deployment job**

If you prefer, you can create a Railway job that runs the seed script, but the CLI command is simpler.

## Expected Output

When successful, you'll see:

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
  ✅ Created: E-commerce Solutions
  → Created: 4 | Skipped: 0

[... more seeding output ...]

🎉 ========================
🎉  All seeding complete!
🎉 ========================
```

## Why Local Execution Fails

Your Railway PostgreSQL uses:
- **Internal DNS**: `postgres.railway.internal` (only accessible from Railway containers)
- **Public Proxy**: `sakura.proxy.rlwy.net:53419` (accessible from outside but subject to connection pooling/restrictions)

When you run locally, the connection times out because:
1. The proxy enforces strict connection limits
2. Network routing may block the connection
3. SSL/certificate validation may fail

**The solution**: Run from Railway where the internal database is directly accessible.

## Troubleshooting

### "railway command not found"

Install Railway CLI:
```bash
npm install -g railway
```

Then authenticate:
```bash
railway login
```

### "corporate-dev-export.json not found"

Make sure you:
1. Exported from development: `node backend/scripts/export-corporate-dev.js`
2. Committed the file: `git add backend/scripts/corporate-dev-export.json`
3. Pushed to repository: `git push`
4. Pulled in Railway (it should auto-deploy when you push)

### "Database connection failed"

If the Railway execution still fails:
- Check Railway dashboard for database status
- Verify DATABASE_URL is set in Railway Variables
- Try restarting the database from Railway dashboard
- Check Railway service logs for details

## One-Time vs. Repeated Seeding

The seed script is **idempotent** — you can run it multiple times safely:
- ✅ Existing records are skipped (not overwritten)
- ✅ New records from export are created
- ✅ No data loss

So if you export new data and run the seed again, only the new data is added.

## Notes

- Always export development data BEFORE running seed
- Keep `corporate-dev-export.json` in version control
- Never manually edit the JSON file
- If you need to update production data, export → push → seed again

## Related Files

- `backend/scripts/export-corporate-dev.js` — Exports dev data to JSON
- `backend/scripts/seed-corporate-production.js` — Seeds JSON to production (main script)
- `backend/scripts/run-seed-production.js` — Railway wrapper
- `backend/scripts/seed-production.sh` — Bash wrapper (alternative)
- `CORPORATE_SEED_GUIDE.md` — Full seeding guide
