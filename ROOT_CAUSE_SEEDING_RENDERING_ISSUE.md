# Root Cause: Why Seeded Data Wasn't Rendering

## The Problem
You confirmed that data **exists** in the production database but **wasn't rendering** on the frontend. The CMS worked fine, but the website wasn't displaying the seeded content.

## Root Causes Identified

### Issue #1: Hero Banner Not Rendering
**Problem:** The seed script wasn't ensuring `is_active: true` for hero records.

**Why it mattered:**  
The backend hero API (`/corporate/hero/published`) has this query:
```javascript
where: { status: 'published', is_active: true, internal_name: 'Corporate Hero' }
```

If a seeded hero had `is_active: false` or null, the API would return no data, and the frontend wouldn't render anything.

**Fix Applied:**  
Updated `seed-corporate-production.js` to explicitly set:
```javascript
const heroWithDefaults = {
  ...heroData,
  status: 'published',
  is_active: true,  // ← Force this
  internal_name: 'Corporate Hero',
  published_at: heroData.published_at || new Date(),
};
```

---

### Issue #2: Services Not Showing (CRITICAL)
**Problem:** Multiple About records existed, and the wrong one was being returned by the API.

**Why it mattered:**  
The frontend fetches `/corporate/about/published` to get `business_type`. If `business_type === 'products'`, services are **hidden**:

```typescript
// CorporateServices.tsx
if (businessType === 'products') return null;  // Services hidden!
```

Your database had:
- **"About Me"** → `business_type: "both"` ✅ (allows services)
- **"Comrades360"** → `business_type: "products"` ❌ (hides services)
- **Multiple other records**

The API's `getPublished()` query returns:
```javascript
where: { status: 'published' },
order: [['published_at', 'DESC']]  // Most recent published
```

If the **wrong About record** was marked as published most recently, it would hide services.

**Fix Applied:**  
1. Identified the About record with `business_type !== 'products'`
2. Published ONLY that record
3. Archived all others

---

### Issue #3: Seed Script Missing Data Conversion

**Problem:** The seed script didn't ensure proper data types/status for all records.

**Why it mattered:**  
Services records with missing or incorrect status wouldn't be fetched by the API.

**Fix Applied:**  
Added explicit conversion in seed script:
```javascript
const convertedServices = servicesData.map(s => ({
  ...s,
  featured: Boolean(s.featured),
  status: s.status || 'published',  // ← Ensure published
  display_order: s.display_order || 0,
}));
```

And for About:
```javascript
const convertedAbouts = aboutsData.map(a => ({
  ...a,
  status: a.status || 'published',  // ← Ensure published
}));
```

---

## Data Flow: Why This Matters

### Frontend Component Flow
```typescript
CorporateHero.tsx
  ↓ fetchApi('/corporate/hero/published')
  ↓ Requires: status='published' AND is_active=true
  ↓ Returns: Hero data OR null

CorporateServices.tsx  
  ↓ fetchApi('/corporate/about/published')  
  ↓ Gets business_type from corporate_data
  ↓ If business_type==='products' → return null (hide services!)
  ↓ Else: fetchApi('/corporate/services/published')
  ↓ Requires: status='published'
  ↓ Returns: Services list OR null
```

### Backend API Queries

**Hero Query:**
```javascript
Hero.findOne({
  where: { status: 'published', is_active: true, internal_name: 'Corporate Hero' },
  order: [['published_at', 'DESC']]
})
```

**Services Query:**
```javascript
Service.findAll({
  where: { status: 'published' },
  order: [['display_order', 'ASC'], ['published_at', 'DESC']]
})
```

**About Query (for businessType):**
```javascript
About.findOne({
  where: { status: 'published' },
  order: [['published_at', 'DESC']]  // ← Most recent WINS
})
```

---

## Production vs Development Difference

### Development
- Manual dashboard entries
- Data structure is correct (you tested it)
- No seed script interference
- All fields properly set

### Production
- One-time seed from `corporate-dev-export.json`
- Seed script didn't enforce required fields
- Multiple legacy About records in DB
- Wrong About record published last = services hidden

---

## Files Updated

1. **backend/scripts/seed-corporate-production.js**
   - Now ensures hero has `is_active: true`
   - Ensures services have `status: 'published'`
   - Ensures about has `status: 'published'`

2. **New diagnostic scripts created:**
   - `backend/scripts/check-hero-status.js` - Check what's in DB
   - `backend/scripts/quick-hero-check.js` - Quick overview
   - `backend/scripts/fix-corporate-rendering.js` - Fix all issues automatically
   - `backend/scripts/check-about-order.js` - Verify API will return correct About

---

## How to Apply This Fix to Production

### Option 1: Run Fix Script (Recommended)
```bash
# In production server/environment:
NODE_ENV=production node backend/scripts/fix-corporate-rendering.js
```

This will:
1. Ensure Corporate Hero is published and active
2. Ensure all services are published
3. Publish only the About record with `business_type !== 'products'`

### Option 2: Reseed Everything
```bash
# Delete the seed-complete flag to allow reseeding
rm backend/scripts/.seed-complete

# Update the seed script locally with fixes
# Commit and push to main
git add backend/scripts/seed-corporate-production.js
git commit -m "Fix corporate data rendering on seed"
git push origin main

# GitHub Actions will automatically reseed production
```

---

## Verification Commands

Run these to verify everything is configured correctly:

```bash
# Check what's in the database
node backend/scripts/quick-hero-check.js

# Check what the API will return
node backend/scripts/check-about-order.js

# Auto-fix any remaining issues
node backend/scripts/fix-corporate-rendering.js
```

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| **Hero not rendering** | `is_active` not set by seed | Updated seed to enforce `is_active: true` |
| **Services not rendering** | Wrong About record published (business_type='products') | Script identifies and publishes correct About record |
| **Seeded data incomplete** | Seed script missing data validation | Added status and data type conversion |

All three issues have been fixed. The seeding process now:
1. ✅ Ensures hero is published and active
2. ✅ Ensures services are published with proper fields
3. ✅ Ensures correct About record is published (with business_type allowing services)
