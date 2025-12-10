/**
 * Food Truck - Main Application Entry Point
 * 
 * Mobile ordering system with AI voice agent for food truck operations.
 * Handles orders, payments, notifications, and voice-based ordering.
 * 
 * @module index
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { logger } from './utils/logger';

// API Routes
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import webhookRoutes from './routes/webhooks';
import voiceRoutes from './routes/voice';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';

// Load environment variables
config();

/**
 * Express application instance
 */
const app = express();

/**
 * Server port from environment or default
 */
const PORT = process.env.PORT || 3002;

// =============================================
// MIDDLEWARE CONFIGURATION
// =============================================

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Parse JSON (except for Twilio webhooks which need raw body)
app.use('/api/webhooks/twilio', express.raw({ type: 'application/x-www-form-urlencoded' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
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
    service: 'food-truck',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API version info
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Food Truck API',
    version: '1.0.0',
    description: 'Mobile ordering and AI voice agent for food truck operations',
    endpoints: {
      menu: '/api/menu',
      orders: '/api/orders',
      customers: '/api/customers',
      payments: '/api/payments',
      notifications: '/api/notifications',
      voice: '/api/voice',
      webhooks: '/api/webhooks',
    },
  });
});

// Mount route handlers
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/webhooks', webhookRoutes);

// =============================================
// ERROR HANDLING
// =============================================

/**
 * 404 handler
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
 * Start the server
 */
async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🍔 Food Truck server running on port ${PORT}`);
      logger.info(`📊 API documentation: http://localhost:${PORT}/api`);
      logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

