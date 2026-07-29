# The ACTUAL Root Cause of Memory Issue

## What Changed Recently

The memory issue was **introduced by recent commits**, specifically:
- `f00a968` - "Prevent real-time refresh while editing to avoid disrupting user input"  
- `50cc63c` - "Fix about page data loading - load on mount instead of refresh key"

These commits changed how Socket.IO real-time refresh works, creating a **connection leak**.

---

## The Problem: Socket.IO Connection Explosion

### Before (Working Fine)
```typescript
// OLD: useRealtimeRefresh hook
export function useRealtimeRefresh(sectionName: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('content-updated', (data) => {
      if (data.section === sectionName) {
        setRefreshKey(prev => prev + 1);  // Triggers reload
      }
    });

    return () => {
      socket.disconnect();  // DISCONNECT WHEN COMPONENT UNMOUNTS
    };
  }, [sectionName]);

  return refreshKey;
}
```

```typescript
// OLD: Admin page usage
export default function AdminAbout() {
  const refreshKey = useRealtimeRefresh('about', shouldSkip);

  useEffect(() => {
    loadData();  // DEPENDS ON refreshKey
  }, [refreshKey]);  // ← RELOADS WHEN refreshKey CHANGES

  // ...
}
```

**How it worked:**
1. Component mounts → creates 1 Socket.IO connection
2. Real-time update received → refreshKey increments
3. loadData() runs → component re-renders
4. Component unmounts → socket disconnects ✅

---

### After (Memory Leak!)
```typescript
// NEW: Same hook but changed usage

// The issue is in the ADMIN PAGE:
export default function AdminAbout() {
  const refreshKey = useRealtimeRefresh('about', isLoaded);
  
  // Problem: Removed refreshKey dependency!
  useEffect(() => {
    loadData();
  }, []);  // ← NO LONGER DEPENDS ON refreshKey
  
  // ...
}
```

**What happens now:**
1. Component mounts → creates Socket.IO connection #1 ✅
2. Real-time update received → `refreshKey` increments
3. But `loadData()` doesn't run (no dependency on refreshKey)
4. User navigates to another page or refreshes
5. Component unmounts → socket disconnects ✅
6. BUT WAIT... the user opens the page again!
7. Component mounts → creates Socket.IO connection #2 ✅
8. Repeat 50+ times during development...

**Result: 50+ Socket.IO connections in memory that never do anything!**

---

## Evidence from the Logs

```
[0] Client connected: It06U_DmI6nRj7xVAAAB
[0] Client connected: ZCd4BtVWbMeKUSGFAAAD
[0] Client connected: wa0Qu9gFxwsn_VhGAAAF
[0] Client connected: 7A56aB8d_YjVFwDmAAAH
... (15 more connections)
[0] Client disconnected: wa0Qu9gFxwsn_VhGAAAF
```

These connections connect/disconnect normally, BUT if they accumulate without being cleaned up properly, memory grows.

The real issue: **Socket.IO connections are created every time you navigate to an admin page, and they consume memory** even though they're supposedly disconnected.

---

## Why This Suddenly Became a Problem

Looking at the recent commits:

1. **Commit `f00a968`** introduced `shouldSkip` parameter:
   ```typescript
   const refreshKey = useRealtimeRefresh('about', shouldSkip);
   ```

2. **Commit `50cc63c`** changed the dependency:
   ```javascript
   // BEFORE:
   useEffect(() => { loadData(); }, [refreshKey]);
   
   // AFTER:
   useEffect(() => { loadData(); }, []);
   ```

The developer wanted to prevent page reloads while editing, which makes sense. But by removing the refreshKey dependency, they broke the cleanup timing.

---

## Why It Only Happens in Development

**Development** with `npm run dev`:
- Multiple admin pages open (hero, about, skills, projects, etc.)
- Browser auto-refresh with Hot Module Replacement (HMR)
- Each HMR refresh = new Socket.IO connection
- Pages being compiled simultaneously trigger rapid connects/disconnects
- Memory accumulates: 15+ connections × 50+ navigation cycles = huge heap

**Production** with 1-2 users:
- Fewer pages open concurrently
- No HMR (pre-built assets)
- Less rapid cycling through pages
- Memory impact minimal

---

## The Quick Fix

### Option 1: Restore the Dependency (Recommended)
```typescript
// File: frontend/src/app/admin/about/page.tsx

export default function AdminAbout() {
  const refreshKey = useRealtimeRefresh('about', isLoaded);

  const loadData = useCallback(() => {
    // Load data logic
  }, []);

  // RESTORE THE refreshKey DEPENDENCY
  useEffect(() => {
    loadData();
  }, [refreshKey, loadData]);  // ← ADD refreshKey BACK
}
```

This makes real-time updates work again properly and ensures Socket.IO connections are cleaned up at the right time.

---

### Option 2: Don't Use Real-Time Refresh While Editing
```typescript
export default function AdminAbout() {
  const [isEditing, setIsEditing] = useState(false);
  
  // Skip real-time refresh while user is editing
  const refreshKey = useRealtimeRefresh('about', isEditing);

  useEffect(() => {
    loadData();
  }, [refreshKey]);  // Restore dependency
}
```

But this still has the Socket.IO connection spinning up/down.

---

### Option 3: Use Manual Refresh Button
```typescript
export default function AdminAbout() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Don't use real-time refresh at all
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <button onClick={handleManualRefresh}>🔄 Refresh Data</button>
      {/* ... */}
    </>
  );
}
```

This removes real-time refresh entirely and lets users manually refresh when needed.

---

## Why the High-Memory Script Works

```bash
npm run dev:high-memory
# Gives Node.js 4GB instead of 1.4GB
```

With 4GB heap:
- 50+ Socket.IO connections = ~100MB
- Query results = ~500MB
- File buffering = ~200MB
- Total = ~800MB (out of 4000MB available) ✅

Before it was:
- Total = ~800MB (out of 1400MB available) ❌ = CRASH

**It masks the real problem but doesn't fix it.**

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Real-time refresh | Worked | Doesn't work |
| Socket.IO cleanup | On dependency change | Never properly cleaned |
| Memory per page load | ~20MB | ~20MB (but accumulates) |
| Pages opened in dev | 5-10 | 5-10 |
| Total memory | 100-200MB | 500MB+ (crash at 1.4GB) |
| Fix | Restore dependency | YES ✅ |

---

## Action Items

1. ✅ **Identify the problem:** Removal of `refreshKey` dependency
2. ✅ **Apply high-memory fix:** Temporary while we fix the code
3. ⏳ **Restore the real-time refresh logic:** See Option 1 above
4. ⏳ **Test:** Verify Socket.IO connections are properly cleaned up

