const redis = require('redis');
const logger = require('./logger');

let client = null;
let isConnected = false;

/**
 * Initialize Redis client
 */
async function initRedis() {
  // Only connect to Redis if configured
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    logger.info('Redis not configured - caching disabled');
    return null;
  }

  try {
    const redisConfig = process.env.REDIS_URL 
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          password: process.env.REDIS_PASSWORD || undefined,
        };

    client = redis.createClient(redisConfig);

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      isConnected = false;
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
      isConnected = true;
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
      isConnected = true;
    });

    client.on('end', () => {
      logger.warn('Redis client disconnected');
      isConnected = false;
    });

    await client.connect();
    return client;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error.message);
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getClient() {
  return client;
}

/**
 * Check if Redis is connected
 */
function isRedisConnected() {
  return isConnected && client && client.isOpen;
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (client && client.isOpen) {
    await client.quit();
    logger.info('Redis connection closed');
  }
}

module.exports = {
  initRedis,
  getClient,
  isRedisConnected,
  closeRedis,
};
