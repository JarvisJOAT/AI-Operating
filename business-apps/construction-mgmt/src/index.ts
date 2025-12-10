/**
 * Construction Management - Main Application Entry Point
 * 
 * Project management with OCR receipt processing and real-time translation.
 * 
 * @module index
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { logger } from './utils/logger';

// API Routes
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import receiptRoutes from './routes/receipts';
import expenseRoutes from './routes/expenses';
import messageRoutes from './routes/messages';
import translationRoutes from './routes/translation';
import documentRoutes from './routes/documents';
import memberRoutes from './routes/members';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { query: req.query, ip: req.ip });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'construction-mgmt',
    timestamp: new Date().toISOString(),
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Construction Management API',
    version: '1.0.0',
    description: 'Project management with OCR receipts and real-time translation',
    endpoints: {
      projects: '/api/projects',
      tasks: '/api/tasks',
      receipts: '/api/receipts',
      expenses: '/api/expenses',
      messages: '/api/messages',
      translation: '/api/translation',
      documents: '/api/documents',
      members: '/api/members',
    },
  });
});

// Mount routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/members', memberRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🏗️ Construction Management server running on port ${PORT}`);
  logger.info(`📊 API documentation: http://localhost:${PORT}/api`);
});

export default app;

