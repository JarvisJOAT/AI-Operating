/**
 * Application Configuration
 * 
 * Centralized configuration loaded from environment variables.
 * 
 * @module config
 */

import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

/**
 * Application configuration object
 */
export const config = {
  /**
   * Server configuration
   */
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    timezone: process.env.TIMEZONE || 'America/New_York',
  },

  /**
   * Supabase configuration
   */
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  /**
   * InvestorLift configuration
   */
  investorLift: {
    username: process.env.INVESTORLIFT_USERNAME || '',
    password: process.env.INVESTORLIFT_PASSWORD || '',
    baseUrl: 'https://investorlift.com',
    marketplaceUrl: 'https://investorlift.com/marketplace',
  },

  /**
   * Instagram configuration
   */
  instagram: {
    method: process.env.INSTAGRAM_METHOD || 'graph_api', // 'graph_api' or 'instagrapi'
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    pageId: process.env.INSTAGRAM_PAGE_ID || '',
    appId: process.env.INSTAGRAM_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || '',
    username: process.env.INSTAGRAM_USERNAME || '',
    password: process.env.INSTAGRAM_PASSWORD || '',
    useAiCaptions: process.env.USE_AI_CAPTIONS === 'true',
    maxPostsPerRun: parseInt(process.env.MAX_POSTS_PER_RUN || '5', 10),
    delayBetweenPosts: parseInt(process.env.DELAY_BETWEEN_POSTS || '60', 10),
    filterFaces: process.env.FILTER_FACES === 'true',
  },

  /**
   * OpenAI configuration
   */
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  /**
   * Scraper configuration
   */
  scraper: {
    headless: process.env.SCRAPER_HEADLESS !== 'false',
    maxDeals: parseInt(process.env.MAX_DEALS_PER_SCRAPE || '50', 10),
    rateLimit: {
      minDelay: parseInt(process.env.RATE_LIMIT_MIN_DELAY || '2000', 10),
      maxDelay: parseInt(process.env.RATE_LIMIT_MAX_DELAY || '5000', 10),
    },
  },

  /**
   * Location filters for scraping
   */
  filters: {
    states: process.env.FILTER_STATES?.split(',') || [],
    cities: process.env.FILTER_CITIES?.split(',') || [],
    excludeStates: process.env.EXCLUDE_STATES?.split(',') || [],
    minPrice: parseInt(process.env.FILTER_MIN_PRICE || '0', 10),
    maxPrice: parseInt(process.env.FILTER_MAX_PRICE || '500000', 10),
  },

  /**
   * Output configuration
   */
  output: {
    imagesFolder: process.env.IMAGES_FOLDER || './output/images',
    captionsFolder: process.env.CAPTIONS_FOLDER || './output/captions',
    dealsFile: process.env.DEALS_FILE || './output/deals.json',
  },
};

export default config;

