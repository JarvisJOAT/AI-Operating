/**
 * AI Caption Generator Service
 * 
 * Generates engaging Instagram captions for real estate deals
 * using OpenAI GPT-4.
 * 
 * @module services/caption-generator
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Deal data for caption generation
 */
interface DealData {
  title: string;
  location: string;
  price: number;
  arv: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
}

/**
 * OpenAI client instance
 */
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Caption generation prompt template
 */
const CAPTION_PROMPT = `You are a real estate marketing expert creating engaging Instagram captions for wholesale property deals. 

Generate a compelling, professional caption for the following property:

Property Details:
- Location: {location}
- Price: {price}
- After Repair Value (ARV): {arv}
- Bedrooms: {beds}
- Bathrooms: {baths}
- Square Footage: {sqft}
- Description: {description}

Requirements:
1. Start with an attention-grabbing emoji and hook
2. Highlight the investment potential (spread between price and ARV)
3. Include key property details in an easy-to-read format
4. Add a call-to-action encouraging DMs
5. Include 5-10 relevant hashtags at the end
6. Keep the caption under 2200 characters (Instagram limit)
7. Use appropriate emojis throughout
8. Maintain a professional but exciting tone

Generate the caption now:`;

/**
 * Generate an AI-powered caption for a real estate deal
 * 
 * @param deal - Deal data to generate caption for
 * @returns Generated caption
 * 
 * @example
 * const caption = await generateCaption({
 *   title: 'Great Investment Property',
 *   location: 'Houston, TX 77001',
 *   price: 150000,
 *   arv: 220000,
 *   beds: 3,
 *   baths: 2,
 *   sqft: 1500,
 *   description: 'Needs cosmetic updates'
 * });
 */
export async function generateCaption(deal: DealData): Promise<string> {
  try {
    logger.info(`Generating AI caption for: ${deal.title}`);

    // Format price and ARV
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(deal.price);

    const formattedArv = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(deal.arv);

    // Build the prompt
    const prompt = CAPTION_PROMPT
      .replace('{location}', deal.location)
      .replace('{price}', formattedPrice)
      .replace('{arv}', formattedArv)
      .replace('{beds}', String(deal.beds))
      .replace('{baths}', String(deal.baths))
      .replace('{sqft}', deal.sqft.toLocaleString())
      .replace('{description}', deal.description || 'Investment opportunity');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional real estate marketing copywriter specializing in Instagram content for wholesale property deals.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const caption = completion.choices[0]?.message?.content?.trim();

    if (!caption) {
      throw new Error('No caption generated');
    }

    logger.info('AI caption generated successfully');
    return caption;
  } catch (error) {
    logger.error('Failed to generate AI caption:', error);
    
    // Fallback to template caption
    return generateFallbackCaption(deal);
  }
}

/**
 * Generate a fallback template caption when AI fails
 * 
 * @param deal - Deal data
 * @returns Template-based caption
 */
function generateFallbackCaption(deal: DealData): string {
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

  const spread = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(deal.arv - deal.price);

  return `🏠💥 HOT DEAL ALERT! 💥🏠

📍 ${deal.location}

💰 Asking Price: ${price}
📈 ARV: ${arv}
🎯 Potential Spread: ${spread}

🛏️ ${deal.beds} Beds
🛁 ${deal.baths} Baths
📐 ${deal.sqft.toLocaleString()} sqft

${deal.description || '✨ Great investment opportunity!'}

📲 DM us NOW to get this deal before it's gone!

🔗 Link in bio for more details

#RealEstateInvesting #WholesaleDeals #InvestmentProperty #RealEstate #FixAndFlip #CashBuyers #REI #PropertyInvestment #WholesaleRealEstate #RealEstateDeals #KeysOpenDoors`;
}

/**
 * Batch generate captions for multiple deals
 * 
 * @param deals - Array of deals
 * @returns Array of generated captions
 */
export async function generateCaptions(deals: DealData[]): Promise<string[]> {
  const captions: string[] = [];

  for (const deal of deals) {
    const caption = await generateCaption(deal);
    captions.push(caption);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return captions;
}

export default {
  generateCaption,
  generateCaptions,
};

