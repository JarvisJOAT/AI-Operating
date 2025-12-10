/**
 * Logger Utility
 * 
 * Configures Winston logger for application-wide logging.
 * 
 * @module utils/logger
 */

import winston from 'winston';

/**
 * Custom log format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * JSON format for file output
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Winston logger instance
 * 
 * @example
 * import { logger } from './utils/logger';
 * 
 * logger.info('Processing started', { jobId: '123' });
 * logger.error('Failed to scrape', { error: error.message });
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File output for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    // File output for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

export default logger;

