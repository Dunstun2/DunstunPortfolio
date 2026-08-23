# Production Cleanup Guide

## Issue
Services are not displaying on the corporate website homepage due to a duplicate "About" record with `business_type: 'products'`, which blocks the services section from rendering.

## Solution
Run the cleanup script to remove the bad About record:

### Option 1: Using Railway CLI (Recommended)
```bash
railway run NODE_ENV=production node backend/scripts/run-cleanup-production.js
```

### Option 2: Direct cleanup (if you have prod DB access locally)
```bash
DATABASE_URL="postgresql://user:pass@host:port/db" node backend/scripts/cleanup-bad-about.js
```

## What the cleanup does
1. Connects to the production database
2. Finds the "Comrades360 Software Developers Limitted" About record
3. Confirms it has `business_type: 'products'`
4. Deletes it safely
5. Services will immediately display on the homepage

## Before/After
- **Before**: About record with `business_type: 'products'` → Services hidden
- **After**: Only About record with `business_type: 'both'` → Services display

## Verification
After running cleanup:
1. Visit your corporate homepage
2. Services section should now display with featured services
3. Check admin: Verify only 1 About record exists

## Safety
- ✅ Idempotent (safe to run multiple times)
- ✅ Checks `business_type` before deleting (won't delete correct records)
- ✅ Only deletes the specific bad record
- ✅ Logs all actions for audit trail

## Rollback
If needed, re-seed with the corrected data:
1. Delete `.seed-complete` flag on production
2. Re-deploy (will re-run seed with fixed data)
