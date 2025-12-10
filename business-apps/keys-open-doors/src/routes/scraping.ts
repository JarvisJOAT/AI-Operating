/**
 * Scraping Routes
 * 
 * API endpoints for managing scraping jobs.
 * 
 * @module routes/scraping
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { runScraper } from '../services/scraper';
import { triggerJob, getJobStatuses } from '../services/scheduler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/scraping/jobs
 * List all scraping jobs
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    let query = supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching scraping jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scraping jobs',
    });
  }
});

/**
 * GET /api/scraping/jobs/:id
 * Get a specific scraping job
 */
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching scraping job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scraping job',
    });
  }
});

/**
 * POST /api/scraping/jobs
 * Create a new scraping job (run scraper manually)
 */
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const { organizationId, config: jobConfig = {} } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'organizationId is required',
      });
    }

    // Create job record
    const { data: job, error: createError } = await supabase
      .from('scraping_jobs')
      .insert({
        organization_id: organizationId,
        status: 'pending',
        config: jobConfig,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Run scraper in background
    (async () => {
      try {
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'running',
            started_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        const deals = await runScraper(jobConfig);

        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            deals_found: deals.length,
            deals_new: deals.length, // TODO: Calculate actual new deals
          })
          .eq('id', job.id);
      } catch (error) {
        logger.error('Scraping job failed:', error);
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', job.id);
      }
    })();

    res.status(201).json({
      success: true,
      data: job,
      message: 'Scraping job started',
    });
  } catch (error) {
    logger.error('Error creating scraping job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scraping job',
    });
  }
});

/**
 * POST /api/scraping/trigger/:jobName
 * Manually trigger a scheduled job
 */
router.post('/trigger/:jobName', async (req: Request, res: Response) => {
  try {
    const { jobName } = req.params;

    await triggerJob(jobName);

    res.json({
      success: true,
      message: `Job "${jobName}" triggered successfully`,
    });
  } catch (error) {
    logger.error('Error triggering job:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger job',
    });
  }
});

/**
 * GET /api/scraping/schedule
 * Get scheduled job statuses
 */
router.get('/schedule', (req: Request, res: Response) => {
  try {
    const statuses = getJobStatuses();

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    logger.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule',
    });
  }
});

export default router;

