/**
 * Keys Open Doors - Main Application Entry Point
 * 
 * Real estate scraping and Instagram automation service.
 * Scrapes wholesale housing deals from InvestorLift and automatically
 * posts to Instagram with AI-generated captions.
 * 
 * @module index
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { scheduleJobs } from './services/scheduler';
import { logger } from './utils/logger';

// API Routes
import scrapingRoutes from './routes/scraping';
import dealsRoutes from './routes/deals';
import postsRoutes from './routes/posts';
import analyticsRoutes from './routes/analytics';
import configRoutes from './routes/config';

// Load environment variables
config();

/**
 * Express application instance
 */
const app = express();

/**
 * Server port from environment or default
 */
const PORT = process.env.PORT || 3001;

// =============================================
// MIDDLEWARE CONFIGURATION
// =============================================

// Enable CORS for cross-origin requests
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// =============================================
// API ROUTES
// =============================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'keys-open-doors',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API version info
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Keys Open Doors API',
    version: '1.0.0',
    description: 'Real estate scraping and Instagram automation',
    endpoints: {
      scraping: '/api/scraping',
      deals: '/api/deals',
      posts: '/api/posts',
      analytics: '/api/analytics',
      config: '/api/config',
    },
  });
});

// Mount route handlers
app.use('/api/scraping', scrapingRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/config', configRoutes);

// =============================================
// ERROR HANDLING
// =============================================

/**
 * 404 handler for unknown routes
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Global error handler
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// =============================================
// SERVER STARTUP
// =============================================

/**
 * Start the Express server and initialize scheduled jobs
 */
async function startServer() {
  try {
    // Initialize scheduled jobs (twice-weekly scraping)
    await scheduleJobs();
    logger.info('Scheduled jobs initialized');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 Keys Open Doors server running on port ${PORT}`);
      logger.info(`📊 API documentation: http://localhost:${PORT}/api`);
      logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

