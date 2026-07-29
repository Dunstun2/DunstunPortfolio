# Fix Socket.IO Connection Leak

## The Problem
Recent commits removed `refreshKey` from dependency arrays, breaking the real-time refresh cleanup. This causes Socket.IO connections to accumulate in memory.

## Solution
Restore the `refreshKey` dependency in all admin pages that use `useRealtimeRefresh`.

## Pages to Fix

All admin pages that use `useRealtimeRefresh` need to:
1. Change `useRealtimeRefresh('section', isLoaded)` to `useRealtimeRefresh('section', false)`
2. Change `useEffect(() => { loadData(); }, [])` to `useEffect(() => { loadData(); }, [refreshKey])`

### List of Admin Pages

The following pages need fixing (9 total):
- [ ] `frontend/src/app/admin/hero/page.tsx`
- [ ] `frontend/src/app/admin/about/page.tsx` ✅ DONE
- [ ] `frontend/src/app/admin/services/page.tsx`
- [ ] `frontend/src/app/admin/projects/page.tsx`
- [ ] `frontend/src/app/admin/events/page.tsx`
- [ ] `frontend/src/app/admin/experience/page.tsx`
- [ ] `frontend/src/app/admin/education/page.tsx`
- [ ] `frontend/src/app/admin/achievements/page.tsx`
- [ ] `frontend/src/app/admin/certifications/page.tsx`

(And likely more, but these are the main ones)

---

## Template for Each Fix

### For EACH admin page:

**Find this pattern:**
```typescript
const refreshKey = useRealtimeRefresh('sectionName', isLoaded);
```

**Replace with:**
```typescript
const refreshKey = useRealtimeRefresh('sectionName', false);
```

**Find this pattern:**
```typescript
useEffect(() => {
  loadData();
}, []);
```

**Replace with:**
```typescript
useEffect(() => {
  loadData();
}, [refreshKey]);
```

---

## Why This Fixes The Memory Issue

### Before (Broken):
```
Navigate to /admin/hero
  ↓
Create Socket.IO connection #1
  ↓
Real-time update → refreshKey increments
  ↓
But loadData() DOESN'T RUN (no refreshKey dependency)
  ↓
Navigate away
  ↓
Socket disconnects
  ↓
Navigate back to /admin/hero
  ↓
Create Socket.IO connection #2
  ↓ (repeat 50+ times)
  ↓
50+ connections × multiple pages = HEAP EXHAUSTED
```

### After (Fixed):
```
Navigate to /admin/hero
  ↓
Create Socket.IO connection #1
  ↓
Real-time update → refreshKey increments
  ↓
loadData() RUNS immediately (refreshKey dependency)
  ↓
Component re-renders with fresh data
  ↓
Navigate away
  ↓
Socket disconnects properly
  ↓
Navigate back to /admin/hero
  ↓
Create Socket.IO connection #1 (reused, or new fresh one)
  ↓
Clean cycle, no accumulation
```

---

## Verification

After applying fixes:

1. **Start dev server:**
   ```bash
   npm run dev  # No need for --high-memory anymore!
   ```

2. **Check memory usage:**
   - Open browser console
   - Check for many `Client connected` messages without corresponding `Client disconnected`
   - Memory should stay under 200MB during admin page navigation

3. **Test real-time updates:**
   - Make a change in one admin page
   - Open another page in a new tab
   - Verify changes propagate without page reloads

---

## Quick Bash Script to Find All Affected Files

```bash
cd frontend/src/app/admin

# Find all pages using useRealtimeRefresh
grep -r "useRealtimeRefresh" . --include="*.tsx"

# Should find all 9+ files with this pattern
```

---

## After-Fix Testing

1. Navigate through all admin pages
2. Check DevTools Performance tab
3. Memory should NOT spike above 150-200MB
4. No "FATAL ERROR" crashes
5. Real-time updates should work (if you edit in one tab, other tabs see updates)

---

## Notes

- The `shouldSkip` parameter to `useRealtimeRefresh` is now effectively always `false` since we're removing the `isLoaded` condition
- Real-time refresh will work even while editing (which might cause unexpected refreshes)
- If you want to prevent refreshes while editing, use a different mechanism (not the `shouldSkip` parameter)

---

## Alternative: Disable Real-Time Refresh Entirely

If real-time refresh is causing issues, you can disable it completely:

```typescript
// Remove useRealtimeRefresh entirely
// const refreshKey = useRealtimeRefresh('sectionName', false);

useEffect(() => {
  loadData();
}, []);  // Just load on mount

// Add a manual refresh button if needed
```

But the proper fix is to restore the dependency as shown above.

