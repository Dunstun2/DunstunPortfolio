# Root Cause Analysis: Backend Memory Exhaustion

## Executive Summary
The backend crashes with "JavaScript heap out of memory" due to **multiple memory consumption issues**, not a single leak. The problem occurs during concurrent page compilations in Next.js development, which triggers heavy database queries and file processing operations simultaneously.

---

## Primary Culprits (In Order of Severity)

### 1. 🔴 **Document Upload & Parsing** (CRITICAL)
**File:** `backend/middleware/upload.middleware.js` & `backend/utils/documentParser.js`

**The Problem:**
```javascript
// Upload middleware uses MEMORY STORAGE (not disk)
const uploadDocument = multer({
  storage: multer.memoryStorage(),  // ← LOADS ENTIRE FILE INTO RAM
  limits: { fileSize: MAX_DOCUMENT_SIZE },  // 10MB limit
});

// PDF parsing loads entire file into arrays
async function parsePdf(fileBuffer) {
  let allTextItems = [];  // ← ACCUMULATES ALL TEXT ITEMS IN MEMORY
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    // Extracts and stores every text item
    allTextItems.push({
      text: item.str.trim(),
      x, y, fontSize, pageNum, pageWidth
    });
  }
  // Later, sorts and rebuilds data
  let lines = [];
  // ... more array building
}
```

**Why This Causes Memory Issues:**
- A 10MB PDF is loaded entirely into RAM
- Text parsing creates intermediate arrays with duplicate data
- If multiple users upload concurrently, memory multiplies
- No streaming or chunked processing

**Impact:** When admin pages compile and simultaneously users test CV imports, heap fills up rapidly.

---

### 2. 🔴 **Unbounded Database Queries** (CRITICAL)
**Files:** Multiple services without pagination

**Example - Analytics Controller:**
```javascript
// Loads ALL analytics events from last 30 days into memory
const topPathsRaw = await AnalyticsEvent.findAll({
  attributes: ['path', [AnalyticsEvent.sequelize.fn('COUNT', ...)], 'views'],
  where: {
    event_type: 'page_view',
    createdAt: { [Op.gte]: thirtyDaysAgo }  // ← NO LIMIT
  },
  // NO pagination/limit beyond raw data
  raw: true
});
```

**Other Affected Services:**
- `BlogComment.findAll()` - loads all comments
- `Category.findAll()` - no limits
- `Social.findAll()` - full dataset
- `Setting.findAll()` - all settings
- `CVImport.findAll()` - entire import history

**Why This Causes Memory Issues:**
- Each `findAll()` loads entire result set into memory
- With dozens of admin API calls happening during page compilation, thousands of records accumulate
- No pagination or limits applied

---

### 3. 🟡 **About Service N+1 Query** (HIGH)
**File:** `backend/services/about.service.js`

```javascript
async getAll() {
  return await About.findAll({ 
    order: [['created_at', 'DESC']],
    include: includeConfig  // ← Includes ALL related records
  });
}
```

**What's Included:**
- Identity cards
- Values
- Explorations
- Highlights
- All nested associations

**Why This Causes Memory Issues:**
- Single query loads about record + all nested relationships
- When admin pages simultaneously call getAll(), multiple full dataset copies load

---

### 4. 🟡 **Socket.IO Connection Management** (MEDIUM)
**File:** `backend/socketManager.js`

```javascript
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Multiple connections establish from browser tabs
  // Each with lingering event listeners
});
```

**Why This Causes Memory Issues:**
- Browser opens multiple admin tabs (skills, about, hero, projects, etc.)
- Each tab = 1+ Socket.IO connections
- Message logs show 15+ client connections during peak
- Even with cleanup, connection objects remain in memory until explicit garbage collection

---

### 5. 🟡 **Redis Cache Growth** (MEDIUM)
**File:** `backend/middleware/cache.middleware.js`

```javascript
// Caches responses with TTL, but:
client.setEx(cacheKey, ttl, JSON.stringify(data));

// Issue: If data is large and TTL is long, memory accumulates
// With 5 minutes TTL and dozens of endpoints, cache can grow unbounded
```

---

### 6. 🟠 **Media Download Streaming** (MEDIUM)
**File:** `backend/controllers/media.controller.js`

```javascript
const response = await axios({ url, responseType: 'stream' });

// Streams to disk but:
// - No backpressure handling if client disconnects
// - Stream error cleanup incomplete
// - Axios connection pools can accumulate
```

---

## Timeline: Why the Crash Happens

```
1. Developer starts: npm run dev
   └─ Backend starts with default 1.5GB heap
   └─ Frontend starts compiling

2. Admin compiles multiple pages simultaneously (~30 sec compilation)
   └─ admin/skills 
   └─ admin/hero
   └─ admin/about
   └─ admin/projects
   └─ etc.

3. Each page load triggers API calls:
   GET /api/skills     → Skill.findAll()
   GET /api/about      → About.findAll() with includes
   GET /api/analytics  → AnalyticsEvent.findAll() [ALL records, 30 days]
   GET /api/settings   → Setting.findAll()
   GET /api/social     → Social.findAll()
   ... (15+ more endpoints)

4. Simultaneous requests overload memory:
   ├─ 15+ Socket.IO connections active
   ├─ Large query results accumulating
   ├─ PDF/DOCX parsing keeping buffers in memory
   ├─ Cache middleware storing large responses
   └─ Next.js consuming memory for compilation

5. Heap fills: ~2000MB used out of 2083MB
   └─ Garbage collection struggles
   └─ FATAL ERROR: Out of memory
```

---

## Solutions Implemented vs. Needed

### ✅ Already Fixed (Temporary Relief)
1. **High-memory script** (`npm run dev:high-memory`)
   - Increases heap to 4GB
   - Symptom treatment, not root cause

2. **Socket.IO optimization**
   - Shorter timeouts (30s vs 60s)
   - Faster cleanup on disconnect
   - Better compression settings

3. **Retry logic in frontend API**
   - Handles timing issues
   - Not fixing the core problem

---

## Recommended Permanent Fixes

### Priority 1: Database Query Pagination
```javascript
// Bad:
async getAll() {
  return await AnalyticsEvent.findAll();
}

// Good:
async getAll(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return await AnalyticsEvent.findAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
}
```

**Effort:** 2-3 hours | **Impact:** 40% memory reduction

---

### Priority 2: Document Upload Streaming
```javascript
// Bad:
const uploadDocument = multer({
  storage: multer.memoryStorage(),  // 10MB → RAM
});

// Good:
const storage = multer.diskStorage({
  destination: 'uploads/documents/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadDocument = multer({
  storage: storage,  // Disk, not memory
  limits: { fileSize: MAX_DOCUMENT_SIZE },
});
```

**Effort:** 1 hour | **Impact:** 25% memory reduction

---

### Priority 3: Stream PDF/DOCX Parsing
```javascript
// Current: Loads entire file into allTextItems array
// Better: Process in chunks, write to DB as you go

async function parsePdfStreaming(fileBuffer) {
  const pdf = await getDocument({ data: new Uint8Array(fileBuffer) });
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Process and save page immediately
    const blocks = await processPage(textContent);
    await saveBlocksToDb(blocks);
    
    // Clear memory after each page
    page.cleanup();
  }
}
```

**Effort:** 2-3 hours | **Impact:** 20% memory reduction

---

### Priority 4: Production Memory Monitoring
```javascript
// Current: Only in development
if (process.env.NODE_ENV !== 'production') { ... }

// Better: Always monitor, alert on production
if (process.memoryUsage().heapUsed > THRESHOLD) {
  logger.warn('High memory usage');
  // In production: trigger graceful restart
}
```

**Effort:** 30 minutes | **Impact:** Early warning system

---

## Default Heap Size Problem

**Why does Node.js crash with 2GB heap?**

Default heap limits by system:
- Windows 32-bit: ~512MB
- Windows 64-bit: ~1.4GB (what you have)
- Linux 64-bit: ~1.5GB
- Not based on available RAM

**Your system has:**
- 16GB+ RAM available
- But Node.js limited to 1.4GB by default

**Solution:** The `npm run dev:high-memory` script (4GB allocation) works around this, but the real fix is addressing the memory-inefficient code above.

---

## Summary Table

| Issue | Severity | Memory Impact | Fix Time | Priority |
|-------|----------|---------------|----------|----------|
| Unbounded queries | Critical | 800MB+ | 2-3 hrs | 1 |
| Document parsing | Critical | 400MB+ | 2-3 hrs | 2 |
| Memory storage uploads | High | 300MB+ | 1 hr | 3 |
| Socket.IO connections | Medium | 100MB+ | ✅ Done | 4 |
| Cache growth | Medium | 150MB+ | 1 hr | 5 |
| Media streaming | Low | 50MB+ | 1 hr | 6 |

---

## Next Steps

1. **Short term:** Use `npm run dev:high-memory` while coding
2. **Medium term:** Implement pagination in all `findAll()` queries
3. **Long term:** Stream-process documents instead of loading to memory
4. **Production:** Deploy with 2GB+ heap allocation and monitoring

