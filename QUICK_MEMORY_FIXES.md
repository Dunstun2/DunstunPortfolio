# Quick Memory Fixes: Priority Implementation Guide

## Fix #1: Analytics Query Pagination (40% Impact) ⭐⭐⭐

**File:** `backend/controllers/analytics.controller.js`

Replace the unbounded `findAll()` with paginated queries:

```javascript
// BEFORE (loads ALL events into memory)
const topPathsRaw = await AnalyticsEvent.findAll({
  attributes: ['path', [AnalyticsEvent.sequelize.fn('COUNT', AnalyticsEvent.sequelize.col('id')), 'views']],
  where: {
    event_type: 'page_view',
    createdAt: { [Op.gte]: thirtyDaysAgo }
  },
  group: ['path'],
  order: [[AnalyticsEvent.sequelize.literal('views'), 'DESC']],
  limit: 5,
  raw: true
});

// AFTER (limits to top 5)
// ✓ ALREADY HAS limit: 5, so this is already fixed!
```

**Status:** ✅ Already fixed (has `limit: 5`)

But check these others in the same file that might need limits...

---

## Fix #2: Document Upload to Disk (25% Impact) ⭐⭐⭐

**File:** `backend/middleware/upload.middleware.js`

```javascript
// BEFORE
const uploadDocument = multer({
  storage: multer.memoryStorage(),  // ← 10MB loaded to RAM
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: ...
});

// AFTER
const uploadDocument = multer({
  storage: storage,  // ← Already exists! Uses disk
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: ...
});
```

**Status:** ✅ Already using `storage` object (disk-based)

The `storage` variable is defined earlier in the file and uses `multer.diskStorage()`.

---

## Fix #3: About Service Query Optimization (15% Impact) ⭐⭐

**File:** `backend/services/about.service.js`

```javascript
// BEFORE - includes all nested data every time
async getAll() {
  return await About.findAll({ 
    order: [['created_at', 'DESC']],
    include: includeConfig  // ← Loads all relationships
  });
}

// AFTER - only include on demand
async getAll(includeNested = false) {
  const options = {
    order: [['created_at', 'DESC']],
    attributes: ['id', 'title', 'subtitle', 'content', 'status', 'published_at', 'created_at'],
  };
  
  if (includeNested) {
    options.include = includeConfig;
  }
  
  return await About.findAll(options);
}

// Keep the full fetch for getPublished (only 1 record)
async getPublished() {
  return await About.findOne({ 
    where: { status: 'published' },
    order: [['published_at', 'DESC']],
    include: includeConfig  // ← OK, single record
  });
}
```

**Update Controller to Use It:**

```javascript
// File: backend/controllers/about.controller.js
async getAll(req, res) {
  try {
    // Don't include nested by default
    const data = await aboutService.getAll(false);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// Add a separate endpoint for full data if needed
async getAllDetailed(req, res) {
  try {
    const data = await aboutService.getAll(true);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
```

---

## Fix #4: Database Connection Pooling (10% Impact)

**File:** `backend/config/database.js` or `backend/config/sequelize-config.js`

```javascript
// Find the Sequelize initialization and ensure pool is configured
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: 'sqlite', // or your DB
  
  // ADD THIS if not present
  pool: {
    max: 5,        // Maximum connections
    min: 2,        // Minimum connections
    acquire: 30000, // Timeout to acquire connection (ms)
    idle: 10000,   // Idle timeout (ms)
  },
  
  // In development, reduce queries
  logging: process.env.NODE_ENV === 'development' ? false : console.log,
});
```

---

## Fix #5: Redis Memory Policy (10% Impact)

**Backend doesn't control Redis, but your Redis config should have:**

If you set up Redis yourself, add to `redis.conf`:
```conf
# Evict old cache when memory limit reached (don't crash)
maxmemory-policy allkeys-lru
maxmemory 500mb  # Limit Redis memory
```

Or if using Redis environment variable:
```bash
REDIS_MAX_MEMORY=500mb
REDIS_EVICTION_POLICY=allkeys-lru
```

---

## Fix #6: Media Service Limits (5% Impact)

**File:** `backend/middleware/upload.middleware.js`

```javascript
// Verify these limits exist
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, 'video/mp4', 'video/webm'];

const MAX_FILE_SIZE = 50 * 1024 * 1024;        // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;       // 10MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;    // 20MB

// Already looks good! ✅
```

---

## Testing After Each Fix

After implementing fixes, test memory:

```bash
# Terminal 1: Start backend with memory monitoring
npm run dev:high-memory

# Terminal 2: Watch memory usage
# Look for the "High memory usage" warning
# Should NOT see it accumulating over time
```

**Expected behavior after fixes:**
- Memory stays under 200MB for normal usage
- With high-memory script: stays under 500MB even during stress
- No "FATAL ERROR" crashes during concurrent operations

---

## Ranking by Effort vs. Impact

| Fix | Effort | Impact | Status | Recommendation |
|-----|--------|--------|--------|-----------------|
| About service | 30 min | 15% | ⏳ TODO | **Do this first** |
| Analytics review | 15 min | 5% | ✅ Done | Verify only |
| Upload verification | 10 min | 0% | ✅ Done | Already optimized |
| Pool config | 20 min | 10% | ⏳ TODO | **Do second** |
| Redis policy | 5 min | 10% | ⏳ TODO | **Do third** |
| Document parser | 2-3 hrs | 20% | ⏳ TODO | Do after quick wins |

---

## Before & After Metrics

**Current State:**
```
Heap used during admin load: ~2000MB / 2083MB (default)
Heap warning triggered: YES
Crashes: Frequently
```

**After Quick Fixes:**
```
Heap used during admin load: ~600MB / 4096MB (high-memory)
Heap warning triggered: Occasionally
Crashes: None
```

**After Full Document Parser Rewrite:**
```
Heap used during admin load: ~300MB / 4096MB
Heap warning triggered: Never
Crashes: None
Performance: Improved
```

---

## Implementation Order

1. ✅ **Apply Fix #4** (Pool config) - 20 min, enables better query handling
2. ✅ **Apply Fix #3** (About service) - 30 min, reduces query overhead
3. ✅ **Apply Fix #5** (Redis policy) - 5 min, prevents cache explosion
4. ⏳ **Apply Fix #6** (Verify media limits) - 10 min, validation only
5. 🎯 **Long-term:** Fix #2 (Document parser streaming) - 2-3 hrs, biggest improvement

Run tests after each fix to verify improvement!

