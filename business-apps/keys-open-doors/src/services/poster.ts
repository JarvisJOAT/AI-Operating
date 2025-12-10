/**
 * Instagram Poster Service
 * 
 * Handles posting scraped deals to Instagram with AI-generated captions.
 * Uses Instagram Graph API for business accounts.
 * 
 * @module services/poster
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { generateCaption } from './caption-generator';
import { config } from '../config';

/**
 * Instagram post result
 */
interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Deal to post
 */
interface DealToPost {
  id: string;
  title: string;
  location: string;
  price: number;
  arv: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  image_urls: string[];
  deal_url: string;
}

/**
 * Instagram Graph API client
 */
class InstagramPoster {
  private accessToken: string;
  private pageId: string;

  constructor() {
    this.accessToken = config.instagram.accessToken;
    this.pageId = config.instagram.pageId;
  }

  /**
   * Post a single image to Instagram
   * 
   * @param imageUrl - URL of the image to post
   * @param caption - Post caption
   * @returns Post result
   */
  async postImage(imageUrl: string, caption: string): Promise<PostResult> {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken,
        }
      );

      const containerId = containerResponse.data.id;
      logger.info(`Created media container: ${containerId}`);

      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/media_publish`,
        {
          creation_id: containerId,
          access_token: this.accessToken,
        }
      );

      const postId = publishResponse.data.id;
      logger.info(`Published post: ${postId}`);

      return {
        success: true,
        postId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to post to Instagram:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Post a carousel of images
   * 
   * @param imageUrls - Array of image URLs
   * @param caption - Post caption
   * @returns Post result
   */
  async postCarousel(imageUrls: string[], caption: string): Promise<PostResult> {
    try {
      // Step 1: Create media containers for each image
      const containerIds: string[] = [];

      for (const imageUrl of imageUrls.slice(0, 10)) { // Max 10 images
        const response = await axios.post(
          `https://graph.facebook.com/v18.0/${this.pageId}/media`,
          {
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: this.accessToken,
          }
        );
        containerIds.push(response.data.id);
      }

      logger.info(`Created ${containerIds.length} carousel items`);

      // Step 2: Create carousel container
      const carouselResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/media`,
        {
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
          caption: caption,
          access_token: this.accessToken,
        }
      );

      const carouselId = carouselResponse.data.id;

      // Step 3: Publish the carousel
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/media_publish`,
        {
          creation_id: carouselId,
          access_token: this.accessToken,
        }
      );

      const postId = publishResponse.data.id;
      logger.info(`Published carousel: ${postId}`);

      return {
        success: true,
        postId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to post carousel to Instagram:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

/**
 * Get unposted deals from the database
 * 
 * @param limit - Maximum number of deals to retrieve
 * @returns Array of deals to post
 */
async function getUnpostedDeals(limit: number = 5): Promise<DealToPost[]> {
  const { data, error } = await supabase
    .from('scraped_deals')
    .select('*')
    .eq('is_posted', false)
    .order('scraped_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Failed to fetch unposted deals:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark a deal as posted in the database
 * 
 * @param dealId - Deal ID
 * @param postId - Instagram post ID
 */
async function markDealAsPosted(dealId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('scraped_deals')
    .update({
      is_posted: true,
      posted_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (error) {
    logger.error(`Failed to mark deal ${dealId} as posted:`, error);
    return;
  }

  // Save to instagram_posts table
  await supabase.from('instagram_posts').insert({
    deal_id: dealId,
    post_id: postId,
    posted_at: new Date().toISOString(),
  });
}

/**
 * Run the poster job
 * 
 * @param options - Posting options
 * @returns Number of deals posted
 * 
 * @example
 * const posted = await runPoster({ maxPosts: 3 });
 * console.log(`Posted ${posted} deals`);
 */
export async function runPoster(options?: {
  maxPosts?: number;
  useAiCaptions?: boolean;
}): Promise<number> {
  const maxPosts = options?.maxPosts ?? config.instagram.maxPostsPerRun;
  const useAiCaptions = options?.useAiCaptions ?? config.instagram.useAiCaptions;
  
  logger.info(`Starting poster job (max: ${maxPosts} posts)`);

  const poster = new InstagramPoster();
  const deals = await getUnpostedDeals(maxPosts);
  
  if (deals.length === 0) {
    logger.info('No unposted deals found');
    return 0;
  }

  logger.info(`Found ${deals.length} deals to post`);
  
  let postedCount = 0;
  
  for (const deal of deals) {
    try {
      // Generate caption
      let caption: string;
      
      if (useAiCaptions) {
        caption = await generateCaption(deal);
      } else {
        caption = generateTemplateCaption(deal);
      }

      // Post to Instagram
      const imageUrl = deal.image_urls[0];
      
      if (!imageUrl) {
        logger.warn(`Deal ${deal.id} has no images, skipping`);
        continue;
      }

      const result = deal.image_urls.length > 1
        ? await poster.postCarousel(deal.image_urls, caption)
        : await poster.postImage(imageUrl, caption);

      if (result.success && result.postId) {
        await markDealAsPosted(deal.id, result.postId);
        postedCount++;
        logger.info(`Posted deal: ${deal.title}`);
      } else {
        logger.warn(`Failed to post deal: ${deal.title} - ${result.error}`);
      }

      // Delay between posts to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, config.instagram.delayBetweenPosts * 1000));
    } catch (error) {
      logger.error(`Error posting deal ${deal.id}:`, error);
    }
  }

  logger.info(`Poster job completed: ${postedCount}/${deals.length} deals posted`);
  return postedCount;
}

/**
 * Generate a template-based caption (fallback when AI is disabled)
 * 
 * @param deal - Deal data
 * @returns Generated caption
 */
function generateTemplateCaption(deal: DealToPost): string {
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(deal.price);

  const arv = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(deal.arv);

  return `🏠 New Investment Opportunity!

📍 ${deal.location}

💰 Price: ${price}
📈 ARV: ${arv}
🛏️ ${deal.beds} Beds | 🛁 ${deal.baths} Baths | 📐 ${deal.sqft.toLocaleString()} sqft

🔥 Don't miss out on this deal!

📩 DM us for more information

#RealEstateInvesting #WholesaleDeals #InvestmentProperty #RealEstate #PropertyForSale #Investor #WholesaleHouses #FixAndFlip #CashBuyers #KeysOpenDoors`;
}

export default {
  runPoster,
  InstagramPoster,
};

