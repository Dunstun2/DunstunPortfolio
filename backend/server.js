// Server initialization with dynamic mode delegation - corporate routes mounted (v6) - show-videos added
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./modes/portfolio/routes');
const corporateRoutes = require('./modes/corporate/routes');
const path = require('path');
const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');

const app = express();
const PORT = process.env.PORT || 5000;
// Trigger restart to reload routes: portfolio & corporate namespaces mounted (v4)

// Monitor memory usage (RSS-based, less noisy)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    // Only warn if RSS exceeds 512MB (sqlite3 on Node 22 uses significant memory)
    if (rssMB > 512) {
      logger.warn(`High memory usage: RSS ${rssMB}MB, Heap ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      if (global.gc) global.gc(); // Hint GC if --expose-gc is enabled
    }
  }, 60000); // Check every 60s instead of 30s
}

// Trust Railway/Vercel proxy headers (required for rate limiting and IP detection)
// Only enable in production — in dev, 'true' causes express-rate-limit to reject all requests
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000']; // Default for development

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// API Documentation — lazy-loaded to save ~11MB of memory at startup
let swaggerMiddleware = null;
app.use('/api-docs', (req, res, next) => {
  if (!swaggerMiddleware) {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger');
    swaggerMiddleware = [
      ...swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Portfolio CMS API Documentation',
      }),
    ];
  }
  // Run the swagger middleware chain
  const run = (i) => {
    if (i >= swaggerMiddleware.length) return;
    swaggerMiddleware[i](req, res, (err) => {
      if (err) return next(err);
      run(i + 1);
    });
  };
  run(0);
});

// Serve static files from the uploads directory with correct Content-Type from DB
const { Media } = require('./modes/portfolio/models');
app.use('/uploads', async (req, res, next) => {
  try {
    const filePath = '/uploads' + req.path;
    const media = await Media.findOne({ where: { file_path: filePath } });
    if (media && media.mime_type) {
      res.setHeader('Content-Type', media.mime_type);
      // For viewable files like PDFs and images, ensure inline disposition
      if (media.mime_type.startsWith('image/') || media.mime_type === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline');
      }
    }
  } catch (err) {
    console.error('Error fetching media mime type:', err.message);
  }
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Mount mode API routes
app.use('/api/corporate', corporateRoutes);
app.use('/api', routes);

// 404 handler - must come after all other routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

const http = require('http');
const socketManager = require('./socketManager');
const { initRedis, closeRedis } = require('./config/redis');

const server = http.createServer(app);
socketManager.init(server);

// Initialize Redis
initRedis().catch((err) => {
  logger.error('Failed to initialize Redis:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await closeRedis();
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await closeRedis();
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

// Seed default templates
const templateService = require('./modes/portfolio/services/template.service');
const { sequelize } = require('./modes/portfolio/models');

sequelize.sync().then(async () => {
  try {
    await templateService.seedDefaults();
    logger.info('Default templates seeded (if needed)');
  } catch (err) {
    logger.error('Error seeding templates:', err.message);
  }
});

server.listen(PORT, () => {
  logger.info(`Backend server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});
 