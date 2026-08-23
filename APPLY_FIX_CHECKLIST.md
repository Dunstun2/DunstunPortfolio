# Applying the Seeding Fixes - Step-by-Step

## What Was Fixed
✅ Hero banner rendering issue (missing `is_active`)  
✅ Services hidden issue (wrong About record published)  
✅ Seed script data validation  

## Your Next Steps

### Step 1: Update Local Repository
```bash
# The fixes are already in these files:
# - backend/scripts/seed-corporate-production.js (updated)
# - backend/scripts/fix-corporate-rendering.js (new)
# - backend/scripts/check-hero-status.js (new)
# - backend/scripts/quick-hero-check.js (new)
# - backend/scripts/check-about-order.js (new)

git status  # You should see these files as modified/untracked
```

### Step 2: Test the Fix Locally
```bash
# Verify the fix works in your local dev environment
node backend/scripts/fix-corporate-rendering.js

# Output should show:
# ✅ Hero: READY
# ✅ Services: X published READY
# ✅ About: business_type="both" READY (services will show)
```

### Step 3: Commit & Push to Main
```bash
git add backend/scripts/
git commit -m "Fix corporate data seeding: ensure hero is_active, correct about record published"
git push origin main
```

### Step 4: Apply Fix to Production

**Choose ONE of these options:**

#### Option A: GitHub Actions Auto-Seed (Recommended)
```
1. Go to GitHub → Actions tab
2. Find "Seed Production Corporate Data" workflow
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"
→ Wait for completion (2-3 minutes)
→ Check production website
```

#### Option B: Manual Production Fix
```bash
# If you have SSH access to production server:
ssh your-production-server
cd /path/to/portfolio

# Run the fix script
NODE_ENV=production node backend/scripts/fix-corporate-rendering.js

# Output should confirm all fixes applied
```

#### Option C: Manual Reseed (Safest)
```bash
# On your local machine:
rm backend/scripts/.seed-complete

# Commit the removal
git add backend/scripts/
git commit -m "Reset production seed flag for fresh seeding"
git push origin main

# GitHub Actions will auto-trigger and reseed with fixes
```

---

## Verification Checklist

After applying the fix:

- [ ] Hero banner displays on production homepage
- [ ] Hero headline shows correctly (not broken/empty)
- [ ] Services section appears below hero
- [ ] All 4 services display (Web Dev, UI/UX, Consulting, E-commerce)
- [ ] Services are clickable/interactive
- [ ] Admin dashboard still works normally
- [ ] CMS can still create/edit hero and services

---

## What Each Script Does

| Script | Purpose | When to Use |
|--------|---------|------------|
| `quick-hero-check.js` | View raw DB data | Quick verification that data exists |
| `check-hero-status.js` | Detailed status check | Understand what's wrong |
| `check-about-order.js` | Verify About record order | Confirm API returns correct About |
| `fix-corporate-rendering.js` | Auto-fix all issues | One-command fix for all problems |

---

## If Issues Persist

### Hero Still Not Showing
```bash
# Check why
node backend/scripts/quick-hero-check.js

# Look for:
# - Status should be "published" ✓
# - Active should be "1" (true) ✓
# - Headline should exist ✓
```

### Services Still Not Showing
```bash
# Check About record
node backend/scripts/check-about-order.js

# If it says business_type="products":
# → Run fix again: node backend/scripts/fix-corporate-rendering.js
# → Or manually update the About record in dashboard
```

### API Returns Empty
```bash
# Test API directly:
curl https://your-prod-url/api/corporate/hero/published
curl https://your-prod-url/api/corporate/services/published
curl https://your-prod-url/api/corporate/about/published

# Each should return data (not empty)
```

---

## Timeline

- **NOW**: Commit fixes locally and push
- **5 min**: GitHub Actions runs seed (if using Option A)
- **2 min**: Seed completes
- **Refresh**: Check production website
- **Done**: Hero and services should render

---

## Success Indicators

✅ Production website shows:
- Hero banner with headline visible
- Subheadline and CTA buttons visible
- Services section with 3-4 cards visible
- CMS admin panel still works

❌ If you see:
- Blank hero section → Hero `is_active` issue
- No services section → About `business_type` issue
- Services but no hero → Check hero query conditions

---

## Questions?

If the fix doesn't work:

1. Check the browser console for errors
2. Run `node backend/scripts/quick-hero-check.js` to see DB status
3. Verify GitHub Actions workflow succeeded (check Actions tab)
4. Clear browser cache (sometimes CSS/JS caching issues)

---

## Rollback (if needed)

If something goes wrong:

```bash
# Revert the last commit
git revert HEAD
git push origin main

# GitHub Actions will try seeding again
# Or manually restore from a backup
```
