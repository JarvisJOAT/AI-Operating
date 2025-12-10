/**
 * Analytics Routes
 * 
 * API endpoints for post engagement analytics.
 * 
 * @module routes/analytics
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/analytics/overview
 * Get overall analytics summary
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, organizationId } = req.query;

    // Get total posts
    let postsQuery = supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'posted');

    if (organizationId) {
      postsQuery = postsQuery.eq('organization_id', organizationId);
    }

    const { count: totalPosts } = await postsQuery;

    // Get analytics aggregates
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('post_analytics')
      .select(`
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        engagement_rate
      `);

    if (analyticsError) throw analyticsError;

    // Calculate totals and averages
    const totals = {
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
      totalReach: 0,
      totalImpressions: 0,
      avgEngagementRate: 0,
    };

    if (analyticsData && analyticsData.length > 0) {
      for (const record of analyticsData) {
        totals.totalLikes += record.likes || 0;
        totals.totalComments += record.comments || 0;
        totals.totalShares += record.shares || 0;
        totals.totalSaves += record.saves || 0;
        totals.totalReach += record.reach || 0;
        totals.totalImpressions += record.impressions || 0;
        totals.avgEngagementRate += record.engagement_rate || 0;
      }
      totals.avgEngagementRate = totals.avgEngagementRate / analyticsData.length;
    }

    res.json({
      success: true,
      data: {
        totalPosts,
        ...totals,
        recordCount: analyticsData?.length || 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview',
    });
  }
});

/**
 * GET /api/analytics/posts/:postId
 * Get analytics for a specific post
 */
router.get('/posts/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('post_id', postId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching post analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post analytics',
    });
  }
});

/**
 * GET /api/analytics/top-posts
 * Get top performing posts
 */
router.get('/top-posts', async (req: Request, res: Response) => {
  try {
    const { limit = 10, sortBy = 'engagement_rate' } = req.query;

    const validSortFields = ['likes', 'comments', 'shares', 'saves', 'reach', 'engagement_rate'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'engagement_rate';

    const { data, error } = await supabase
      .from('post_analytics')
      .select(`
        *,
        instagram_posts (
          id,
          caption,
          image_urls,
          posted_at,
          scraped_deals (
            title,
            location,
            price
          )
        )
      `)
      .order(sortField, { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching top posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top posts',
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get engagement trends over time
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const { data, error } = await supabase
      .from('post_analytics')
      .select(`
        recorded_at,
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        engagement_rate
      `)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const groupedData: Record<string, {
      date: string;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      reach: number;
      impressions: number;
      count: number;
    }> = {};

    for (const record of data || []) {
      const date = record.recorded_at.split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reach: 0,
          impressions: 0,
          count: 0,
        };
      }
      groupedData[date].likes += record.likes || 0;
      groupedData[date].comments += record.comments || 0;
      groupedData[date].shares += record.shares || 0;
      groupedData[date].saves += record.saves || 0;
      groupedData[date].reach += record.reach || 0;
      groupedData[date].impressions += record.impressions || 0;
      groupedData[date].count += 1;
    }

    res.json({
      success: true,
      data: Object.values(groupedData),
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
    });
  }
});

/**
 * POST /api/analytics/record
 * Record new analytics data (called by external service or webhook)
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const {
      postId,
      likes,
      comments,
      shares,
      saves,
      reach,
      impressions,
      engagementRate,
    } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'postId is required',
      });
    }

    const { data, error } = await supabase
      .from('post_analytics')
      .insert({
        post_id: postId,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        saves: saves || 0,
        reach: reach || 0,
        impressions: impressions || 0,
        engagement_rate: engagementRate || 0,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error recording analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record analytics',
    });
  }
});

/**
 * GET /api/analytics/best-times
 * Analyze best posting times based on engagement
 */
router.get('/best-times', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select(`
        posted_at,
        post_analytics (
          engagement_rate,
          reach
        )
      `)
      .eq('status', 'posted')
      .not('posted_at', 'is', null);

    if (error) throw error;

    // Analyze by hour and day of week
    const hourlyEngagement: Record<number, { total: number; count: number }> = {};
    const dailyEngagement: Record<number, { total: number; count: number }> = {};

    for (const post of data || []) {
      if (!post.posted_at || !post.post_analytics?.[0]) continue;

      const date = new Date(post.posted_at);
      const hour = date.getHours();
      const day = date.getDay();
      const engagementRate = post.post_analytics[0].engagement_rate || 0;

      if (!hourlyEngagement[hour]) {
        hourlyEngagement[hour] = { total: 0, count: 0 };
      }
      hourlyEngagement[hour].total += engagementRate;
      hourlyEngagement[hour].count += 1;

      if (!dailyEngagement[day]) {
        dailyEngagement[day] = { total: 0, count: 0 };
      }
      dailyEngagement[day].total += engagementRate;
      dailyEngagement[day].count += 1;
    }

    // Calculate averages
    const bestHours = Object.entries(hourlyEngagement)
      .map(([hour, data]) => ({
        hour: Number(hour),
        avgEngagement: data.total / data.count,
        postCount: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDays = Object.entries(dailyEngagement)
      .map(([day, data]) => ({
        day: dayNames[Number(day)],
        avgEngagement: data.total / data.count,
        postCount: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    res.json({
      success: true,
      data: {
        bestHours: bestHours.slice(0, 5),
        bestDays,
      },
    });
  } catch (error) {
    logger.error('Error analyzing best times:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze best posting times',
    });
  }
});

export default router;

