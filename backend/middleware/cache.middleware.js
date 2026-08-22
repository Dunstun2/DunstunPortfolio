const { getClient, isRedisConnected } = require('../config/redis');
const logger = require('../config/logger');

// Simple in-memory fallback cache to prevent SQLite N-API memory leak on Windows Node 22
const fallbackCache = new Map();

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @param {string} options.prefix - Cache key prefix (default: 'cache:')
 * @param {function} options.keyGenerator - Custom key generator function
 * @returns {Function} Express middleware
 */
function cache(options = {}) {
  const {
    ttl = 300, // 5 minutes default
    prefix = 'cache:',
    keyGenerator = (req) => `${prefix}${req.originalUrl || req.url}`,
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);

    // If Redis is not connected, use the in-memory fallback cache
    if (!isRedisConnected()) {
      const cachedEntry = fallbackCache.get(cacheKey);
      if (cachedEntry && cachedEntry.expires > Date.now()) {
        logger.debug(`[Memory] Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cachedEntry.data));
      }

      logger.debug(`[Memory] Cache miss: ${cacheKey}`);
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        fallbackCache.set(cacheKey, {
          data: JSON.stringify(data),
          expires: Date.now() + ttl * 1000
        });
        return originalJson(data);
      };
      return next();
    }

    const client = getClient();
    try {
      // Try to get cached data
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      logger.debug(`Cache miss: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        client
          .setEx(cacheKey, ttl, JSON.stringify(data))
          .then(() => {
            logger.debug(`Cached data: ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch((err) => {
            logger.error(`Failed to cache data: ${err.message}`);
          });

        // Send the response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Clear cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:projects:*')
 */
async function clearCache(pattern) {
  // Clear from in-memory fallback
  const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of fallbackCache.keys()) {
    if (regexPattern.test(key)) {
      fallbackCache.delete(key);
    }
  }

  if (!isRedisConnected()) {
    return;
  }

  const client = getClient();

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.info(`Cleared ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Failed to clear cache: ${error.message}`);
  }
}

/**
 * Clear all cache
 */
async function clearAllCache() {
  fallbackCache.clear();

  if (!isRedisConnected()) {
    return;
  }

  const client = getClient();

  try {
    const keys = await client.keys('cache:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
    const allKeys = await client.keys('*');
    if (allKeys.length > 0) {
      await client.del(allKeys);
    }
    logger.info('Cleared all cache');
  } catch (error) {
    logger.error(`Failed to clear all cache: ${error.message}`);
  }
}

/**
 * Invalidate cache middleware for CUD operations
 * @param {string|string[]} patterns - Cache key patterns to invalidate
 */
function invalidateCache(patterns) {
  return async (req, res, next) => {
    // Store original response functions
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const invalidateCacheKeys = async () => {
      const patternArray = Array.isArray(patterns) ? patterns : [patterns];

      for (const pattern of patternArray) {
        await clearCache(pattern);
      }
    };

    // Override response methods to invalidate cache after successful response
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCacheKeys().catch((err) => {
          logger.error(`Failed to invalidate cache: ${err.message}`);
        });
      }
      return originalJson(data);
    };

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCacheKeys().catch((err) => {
          logger.error(`Failed to invalidate cache: ${err.message}`);
        });
      }
      return originalSend(data);
    };

    next();
  };
}

module.exports = {
  cache,
  clearCache,
  clearAllCache,
  invalidateCache,
};
