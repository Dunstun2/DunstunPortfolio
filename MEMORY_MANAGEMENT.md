# Memory Management Guide

## Issue
The backend Node.js process was experiencing "JavaScript heap out of memory" errors, particularly when multiple admin pages were being compiled simultaneously by Next.js during development.

## Root Cause
- Multiple Socket.IO client connections with long ping timeouts were being held in memory
- Concurrent Next.js compilations (especially the Skills page) consumed additional heap space
- Default Node.js heap size (≈1.5GB depending on system) was insufficient for development workload

## Solutions Implemented

### 1. Optimized Socket.IO Configuration
- Reduced `pingTimeout` from 60s to 30s (faster cleanup of stale connections)
- Reduced `pingInterval` from 25s to 15s (more frequent heartbeats)
- Limited buffer size to 10KB (`maxHttpBufferSize`)
- Added message compression with `perMessageDeflate`
- Implemented cleanup on disconnect to remove all event listeners
- Added error handler to prevent memory leaks

**File**: `backend/socketManager.js`

### 2. Memory Monitoring in Backend
- Added automatic memory usage logging every 30 seconds during development
- Warns when heap usage exceeds 80% of total heap size
- Helps identify memory spikes during development

**File**: `backend/server.js`

### 3. Increased Heap Memory for Development
You now have two ways to run the development server:

```bash
# Standard development (default Node.js heap)
npm run dev

# High-memory development (4GB heap allocation)
npm run dev:high-memory
```

**Use `npm run dev:high-memory` if you encounter heap memory errors.**

### 4. Environment Configuration
Added `NODE_ENV=development` and `ENABLE_MEMORY_MONITORING=true` to `.env` file for better monitoring.

## Usage

### For Development
```bash
# First attempt (standard)
npm run dev

# If you get "FATAL ERROR: JavaScript heap out of memory"
npm run dev:high-memory
```

### For Production
The backend automatically reduces memory monitoring overhead when `NODE_ENV=production`.

## What Happens When Memory Runs Out

If the backend still runs out of memory with these changes:

1. **Check memory usage**: Look for the memory warning logs
2. **Identify the culprit**: 
   - If it's during Next.js compilation (long rebuilds), the frontend is consuming memory
   - If it's consistent, there may be a memory leak in a backend service
3. **Solutions**:
   - Use `npm run dev:high-memory` (allocates 4GB to Node.js)
   - Restart the development server periodically
   - Check for active Socket.IO connections that aren't properly cleaning up

## Monitoring

During development with memory monitoring enabled, you'll see logs like:
```
⚠ High memory usage: 1200MB / 1400MB
```

This indicates the backend is using 85% of allocated heap space.

## Advanced Configuration

To adjust heap size for different scenarios:

```bash
# 2GB heap (laptop/low-memory systems)
cd backend && node --max-old-space-size=2048 server.js

# 6GB heap (high-end workstations)
cd backend && node --max-old-space-size=6144 server.js

# 8GB heap (high-performance systems)
cd backend && node --max-old-space-size=8192 server.js
```

## Prevention for Production

1. **Deploy with sufficient memory**: Cloud providers (Railway, Vercel, Heroku) should allocate at least 1GB to backend
2. **Monitor production memory**: Enable APM/monitoring tools
3. **Implement connection limits**: Set max concurrent Socket.IO connections
4. **Use clustering**: For high-traffic scenarios, consider Node.js clustering module

## References
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/nodejs-performance/)
- [Socket.IO Performance Tuning](https://socket.io/docs/v4/performance-tuning/)
- [Next.js Memory Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
