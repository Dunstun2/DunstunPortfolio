# Production vs Development: Hero Banner & Services Section Issues

## Summary
You have two separate issues:
1. **Hero banner shows different content** in production vs development
2. **Services section not showing** on the homepage in production

---

## Issue #1: Hero Banner Content Difference

### Root Cause
The hero banner content comes from **different data sources** depending on environment:

- **Development**: Directly from your development database (manual entries)
- **Production**: From `corporate-dev-export.json` via GitHub Actions seed script

Your first image shows "Cloud Infrastructure & Multi-Region DevOps" but your export file shows "Making Quality Products and Services Accessible" - meaning they're different data.

### Why This Happens
1. Each environment has a **separate database**
2. Production uses a one-time seed via GitHub Actions (`seed-production.yml`)
3. The seed reads from `backend/scripts/corporate-dev-export.json`
4. Development is manually managed via the admin dashboard

### Solution
To sync hero content to production, you have 3 options:

**Option A: Export Current Dev Hero to Seed File (Recommended)**
```bash
# In development, get the current hero data and update corporate-dev-export.json
# Then commit and push - it will auto-seed to production via GitHub Actions
```

**Option B: Manually Reseed Production**
```bash
NODE_ENV=production node backend/scripts/seed-one-time.js
```
⚠️ Note: The seed only runs once (unless you delete `.seed-complete` flag)

**Option C: Update Seed File Directly**
Edit `backend/scripts/corporate-dev-export.json` and update the hero section:
```json
{
  "hero_headline": "Cloud Infrastructure & Multi-Region DevOps",
  "hero_intro": "Your hero description here...",
  ...
}
```

---

## Issue #2: Services Section Not Showing in Production

### Root Cause
Services section visibility depends on the `businessType` setting. Looking at your code:

**CorporateServices.tsx (Frontend):**
```typescript
if (businessType === 'products') return null;  // ← Services are hidden if this is true
```

### Current Setting
Your export file has:
```json
"business_type": "both"  // ✅ This SHOULD show services
```

### Why Services Still Don't Show
Services require **all three** of these conditions:

1. ✅ **businessType ≠ 'products'** (yours is 'both')
2. ❓ **Corporate services data exists in production database**
3. ❓ **API endpoint `/corporate/services/published` returns data**

### The Real Problem
The issue is likely:

**A. Services not seeded to production**
```json
// Check: Do your 4 services exist in the export file?
"services": [
  { "name": "Web Development", "featured": 1, ... },
  { "name": "UI/UX Design", "featured": 1, ... },
  { "name": "Technical Consulting", "featured": 1, ... },
  { "name": "E-commerce Solutions", "featured": 0, ... }
]
```

**B. Data not inserted in production database**
- Seed script reads the export file but must INSERT into DB
- Check: Do services appear in production admin panel?

**C. API endpoint issue**
- Frontend tries: `/corporate/services/published` → Falls back to `/services/published`
- The endpoint exists ✅ but data might not be in DB

### Debugging Steps

**Step 1: Check if services exist in production database**
```bash
# In production, check the database directly
SELECT COUNT(*) FROM services WHERE status = 'published';
```

**Step 2: Test API directly**
```bash
curl "https://your-production-url.com/api/corporate/services/published"
```
Should return your 4 services.

**Step 3: Check About section businessType**
```bash
curl "https://your-production-url.com/api/corporate/about/published"
```
Should include: `"business_type": "both"`

### Solutions

**Solution 1: Reseed Production Data**
```bash
# Remove the seed-complete flag to allow reseeding
rm backend/scripts/.seed-complete

# Push to main - GitHub Actions will reseed
git add backend/scripts/corporate-dev-export.json
git commit -m "Update corporate data"
git push origin main
```

**Solution 2: Force Seed via GitHub Actions**
1. Go to GitHub Actions
2. Find "Seed Production Corporate Data" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

**Solution 3: Manual Production Seed (if you have access)**
```bash
# On production server:
NODE_ENV=production node backend/scripts/seed-one-time.js
```
Then restart the app.

---

## How the System Works

### Frontend (Corporate Mode Detection)
```typescript
// IvoryHero.tsx & IvoryServices.tsx
if (settings?.site_mode === 'corporate') {
  return <CorporateHero />;  // Uses corporate-specific component
}
```

### Backend API Routes
```
/api/corporate/hero/published      → Hero banner data
/api/corporate/services/published  → Services list
/api/corporate/about/published     → About section (includes businessType)
```

### Data Flow
```
Development:
  Admin Dashboard → MySQL Database ← Browser API calls

Production:
  corporate-dev-export.json 
    ↓ (One-time seed via GitHub Actions)
  Production Database ← Browser API calls
```

---

## Checklist to Fix Both Issues

### For Hero Banner:
- [ ] Edit `backend/scripts/corporate-dev-export.json` with correct hero data
- [ ] Commit and push to `main` branch
- [ ] Verify GitHub Actions workflow ran successfully
- [ ] Check production URL to see updated hero content

### For Services Section:
- [ ] Verify `business_type: "both"` in corporate_data
- [ ] Verify 4 services exist in export file with `featured: 1` flags
- [ ] Test production API: `/api/corporate/services/published`
- [ ] If empty, trigger reseed via GitHub Actions or manual command
- [ ] Verify services appear in production admin panel
- [ ] Refresh production website to see services on homepage

---

## Files Involved

| File | Purpose |
|------|---------|
| `backend/scripts/corporate-dev-export.json` | Source data for production seed |
| `backend/scripts/seed-one-time.js` | Seed entry point |
| `backend/scripts/seed-corporate-production.js` | Actual seeding logic |
| `.github/workflows/seed-production.yml` | GitHub Actions trigger |
| `frontend/src/modes/corporate/components/CorporateHero.tsx` | Hero display |
| `frontend/src/modes/corporate/components/CorporateServices.tsx` | Services display |

---

## Next Steps

1. **Identify which issue is primary** - Hero content mismatch or services not showing?
2. **Update corporate-dev-export.json** with the correct data
3. **Push to GitHub** to trigger automatic seed
4. **Monitor** GitHub Actions workflow in the Actions tab
5. **Verify** on production website

Would you like me to help you update the seed file with your current development data?
