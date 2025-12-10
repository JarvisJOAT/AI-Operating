/**
 * Configuration Routes
 * 
 * API endpoints for managing app configuration.
 * 
 * @module routes/config
 */

import { Router, Request, Response } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/config
 * Get current configuration (sanitized)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Return sanitized config (no secrets)
    const sanitizedConfig = {
      server: {
        port: config.server.port,
        nodeEnv: config.server.nodeEnv,
        timezone: config.server.timezone,
      },
      instagram: {
        method: config.instagram.method,
        useAiCaptions: config.instagram.useAiCaptions,
        maxPostsPerRun: config.instagram.maxPostsPerRun,
        delayBetweenPosts: config.instagram.delayBetweenPosts,
        filterFaces: config.instagram.filterFaces,
        hasAccessToken: !!config.instagram.accessToken,
        hasPageId: !!config.instagram.pageId,
      },
      scraper: {
        headless: config.scraper.headless,
        maxDeals: config.scraper.maxDeals,
        rateLimit: config.scraper.rateLimit,
      },
      filters: config.filters,
      openai: {
        model: config.openai.model,
        hasApiKey: !!config.openai.apiKey,
      },
      supabase: {
        hasUrl: !!config.supabase.url,
        hasAnonKey: !!config.supabase.anonKey,
        hasServiceKey: !!config.supabase.serviceRoleKey,
      },
    };

    res.json({
      success: true,
      data: sanitizedConfig,
    });
  } catch (error) {
    logger.error('Error fetching config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration',
    });
  }
});

/**
 * GET /api/config/status
 * Get service status and health checks
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      server: 'healthy',
      database: 'unknown',
      instagram: 'unknown',
      openai: 'unknown',
      scraper: 'ready',
    };

    // Check database connectivity
    try {
      const { supabase } = await import('../utils/supabase');
      const { error } = await supabase.from('scraped_deals').select('id').limit(1);
      status.database = error ? 'error' : 'connected';
    } catch {
      status.database = 'error';
    }

    // Check Instagram API (if configured)
    if (config.instagram.accessToken) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${config.instagram.pageId}?access_token=${config.instagram.accessToken}`
        );
        status.instagram = response.ok ? 'connected' : 'error';
      } catch {
        status.instagram = 'error';
      }
    } else {
      status.instagram = 'not_configured';
    }

    // Check OpenAI (if configured)
    if (config.openai.apiKey) {
      status.openai = 'configured';
    } else {
      status.openai = 'not_configured';
    }

    const isHealthy = status.database === 'connected' && status.server === 'healthy';

    res.json({
      success: true,
      healthy: isHealthy,
      data: status,
    });
  } catch (error) {
    logger.error('Error checking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check status',
    });
  }
});

/**
 * GET /api/config/filters
 * Get location filter options
 */
router.get('/filters', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        states: config.filters.states,
        cities: config.filters.cities,
        excludeStates: config.filters.excludeStates,
        priceRange: {
          min: config.filters.minPrice,
          max: config.filters.maxPrice,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter configuration',
    });
  }
});

/**
 * GET /api/config/supported-states
 * Get list of all US states for filtering
 */
router.get('/supported-states', (req: Request, res: Response) => {
  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];

  res.json({
    success: true,
    data: states,
  });
});

export default router;

