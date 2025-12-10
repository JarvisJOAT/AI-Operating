/**
 * Posts Routes
 * 
 * API endpoints for managing Instagram posts.
 * 
 * @module routes/posts
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { runPoster } from '../services/poster';
import { generateCaption } from '../services/caption-generator';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/posts
 * List all Instagram posts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    let query = supabase
      .from('instagram_posts')
      .select(`
        *,
        scraped_deals (
          title,
          location,
          price,
          arv,
          image_urls
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
    });
  }
});

/**
 * GET /api/posts/:id
 * Get a specific post
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('instagram_posts')
      .select(`
        *,
        scraped_deals (*),
        post_analytics (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
    });
  }
});

/**
 * POST /api/posts
 * Create and schedule a new Instagram post
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { dealId, organizationId, caption, postNow = false } = req.body;

    if (!dealId || !organizationId) {
      return res.status(400).json({
        success: false,
        error: 'dealId and organizationId are required',
      });
    }

    // Get the deal
    const { data: deal, error: dealError } = await supabase
      .from('scraped_deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found',
      });
    }

    // Generate caption if not provided
    const postCaption = caption || await generateCaption({
      title: deal.title,
      location: deal.location,
      price: deal.price,
      arv: deal.arv,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft,
      description: deal.description || '',
    });

    // Create post record
    const { data: post, error: createError } = await supabase
      .from('instagram_posts')
      .insert({
        organization_id: organizationId,
        deal_id: dealId,
        caption: postCaption,
        image_urls: deal.image_urls,
        status: postNow ? 'posted' : 'scheduled',
      })
      .select()
      .single();

    if (createError) throw createError;

    // If postNow, trigger the poster
    if (postNow) {
      // TODO: Implement immediate posting
      logger.info(`Scheduled immediate post for deal ${dealId}`);
    }

    res.status(201).json({
      success: true,
      data: post,
      message: postNow ? 'Post created and publishing' : 'Post scheduled',
    });
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
    });
  }
});

/**
 * PATCH /api/posts/:id
 * Update a post (e.g., edit caption)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const { data, error } = await supabase
      .from('instagram_posts')
      .update({ caption })
      .eq('id', id)
      .eq('status', 'scheduled') // Only allow editing scheduled posts
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post',
    });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a scheduled post
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('instagram_posts')
      .delete()
      .eq('id', id)
      .eq('status', 'scheduled'); // Only allow deleting scheduled posts

    if (error) throw error;

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post',
    });
  }
});

/**
 * POST /api/posts/run
 * Manually run the posting job
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { maxPosts = 5, useAiCaptions = true } = req.body;

    // Run in background
    (async () => {
      try {
        await runPoster({ maxPosts, useAiCaptions });
      } catch (error) {
        logger.error('Posting job failed:', error);
      }
    })();

    res.json({
      success: true,
      message: 'Posting job started',
    });
  } catch (error) {
    logger.error('Error starting posting job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start posting job',
    });
  }
});

/**
 * POST /api/posts/:id/preview-caption
 * Generate a preview caption for a deal
 */
router.post('/:id/preview-caption', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the deal
    const { data: deal, error: dealError } = await supabase
      .from('scraped_deals')
      .select('*')
      .eq('id', id)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found',
      });
    }

    const caption = await generateCaption({
      title: deal.title,
      location: deal.location,
      price: deal.price,
      arv: deal.arv,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft,
      description: deal.description || '',
    });

    res.json({
      success: true,
      data: { caption },
    });
  } catch (error) {
    logger.error('Error generating caption preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate caption preview',
    });
  }
});

export default router;

