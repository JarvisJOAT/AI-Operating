/**
 * InvestorLift Scraper Service
 * 
 * Handles scraping of wholesale real estate deals from InvestorLift.
 * Uses Puppeteer for browser automation.
 * 
 * @module services/scraper
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { config } from '../config';

/**
 * Deal data structure from InvestorLift
 */
export interface DealData {
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  arv: number; // After Repair Value
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  imageUrls: string[];
  dealUrl: string;
  dealType: string;
  wholesaler?: string;
  scraped_at: Date;
}

/**
 * Scraper configuration options
 */
interface ScraperOptions {
  headless?: boolean;
  maxDeals?: number;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    states?: string[];
    cities?: string[];
  };
}

/**
 * InvestorLift scraper class
 */
class InvestorLiftScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private options: ScraperOptions;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      headless: true,
      maxDeals: 50,
      ...options,
    };
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    logger.info('Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    logger.info('Browser initialized');
  }

  /**
   * Login to InvestorLift (if credentials are provided)
   */
  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');
    
    const { username, password } = config.investorLift;
    
    if (!username || !password) {
      logger.warn('No InvestorLift credentials provided, proceeding without login');
      return false;
    }

    try {
      logger.info('Logging in to InvestorLift...');
      
      await this.page.goto('https://investorlift.com/login', {
        waitUntil: 'networkidle2',
      });

      // Enter credentials
      await this.page.type('input[name="email"]', username);
      await this.page.type('input[name="password"]', password);
      
      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if login was successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('marketplace') || currentUrl.includes('dashboard')) {
        logger.info('Login successful');
        return true;
      }

      logger.warn('Login may have failed, continuing anyway');
      return false;
    } catch (error) {
      logger.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Navigate to marketplace and scrape deals
   */
  async scrapeDeals(): Promise<DealData[]> {
    if (!this.page) throw new Error('Browser not initialized');
    
    const deals: DealData[] = [];
    
    try {
      logger.info('Navigating to marketplace...');
      
      // Build URL with filters
      let marketplaceUrl = 'https://investorlift.com/marketplace';
      const params = new URLSearchParams();
      
      if (this.options.filters?.states?.length) {
        params.append('states', this.options.filters.states.join(','));
      }
      
      if (params.toString()) {
        marketplaceUrl += '?' + params.toString();
      }

      await this.page.goto(marketplaceUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for deals to load
      await this.page.waitForSelector('.deal-card, [data-deal]', {
        timeout: 10000,
      }).catch(() => {
        logger.warn('Deal cards not found, page structure may have changed');
      });

      // Scroll to load more deals
      await this.scrollToLoadMore();

      // Extract deal data
      const dealElements = await this.page.$$('.deal-card, [data-deal]');
      
      logger.info(`Found ${dealElements.length} deal elements`);

      for (const element of dealElements.slice(0, this.options.maxDeals)) {
        try {
          const deal = await this.extractDealData(element);
          if (deal && this.passesFilters(deal)) {
            deals.push(deal);
          }
        } catch (error) {
          logger.warn('Failed to extract deal:', error);
        }
      }

      logger.info(`Scraped ${deals.length} deals`);
      return deals;
    } catch (error) {
      logger.error('Scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scroll the page to load more deals
   */
  private async scrollToLoadMore(): Promise<void> {
    if (!this.page) return;

    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 10;

    while (scrollAttempts < maxScrollAttempts) {
      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      
      if (currentHeight === previousHeight) break;
      
      previousHeight = currentHeight;
      
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await this.page.waitForTimeout(1500);
      scrollAttempts++;
    }

    logger.info(`Scrolled ${scrollAttempts} times to load more content`);
  }

  /**
   * Extract deal data from a deal element
   */
  private async extractDealData(element: puppeteer.ElementHandle): Promise<DealData | null> {
    try {
      const data = await element.evaluate((el) => {
        // This extraction logic may need to be updated based on actual page structure
        const title = el.querySelector('.deal-title, h3, h4')?.textContent?.trim() || '';
        const priceText = el.querySelector('.price, .deal-price')?.textContent?.trim() || '0';
        const arvText = el.querySelector('.arv, .deal-arv')?.textContent?.trim() || '0';
        const addressEl = el.querySelector('.address, .deal-address');
        const imageEl = el.querySelector('img');
        const linkEl = el.querySelector('a[href*="/deal/"], a[href*="/property/"]');

        return {
          title,
          address: addressEl?.textContent?.trim() || '',
          price: parseInt(priceText.replace(/[^0-9]/g, '')) || 0,
          arv: parseInt(arvText.replace(/[^0-9]/g, '')) || 0,
          imageUrl: imageEl?.getAttribute('src') || '',
          dealUrl: linkEl?.getAttribute('href') || '',
        };
      });

      if (!data.title || !data.address) return null;

      // Parse address components
      const addressParts = data.address.split(',').map(p => p.trim());
      
      return {
        title: data.title,
        address: data.address,
        city: addressParts[0] || '',
        state: addressParts[1]?.split(' ')[0] || '',
        zipCode: addressParts[1]?.split(' ')[1] || '',
        price: data.price,
        arv: data.arv,
        beds: 0, // Would need to extract from detail page
        baths: 0,
        sqft: 0,
        description: '',
        imageUrls: data.imageUrl ? [data.imageUrl] : [],
        dealUrl: data.dealUrl.startsWith('http') 
          ? data.dealUrl 
          : `https://investorlift.com${data.dealUrl}`,
        dealType: 'wholesale',
        scraped_at: new Date(),
      };
    } catch (error) {
      logger.warn('Failed to extract deal data from element:', error);
      return null;
    }
  }

  /**
   * Check if a deal passes the configured filters
   */
  private passesFilters(deal: DealData): boolean {
    const { filters } = this.options;
    
    if (!filters) return true;

    if (filters.minPrice && deal.price < filters.minPrice) return false;
    if (filters.maxPrice && deal.price > filters.maxPrice) return false;
    if (filters.states?.length && !filters.states.includes(deal.state)) return false;
    if (filters.cities?.length && !filters.cities.includes(deal.city)) return false;

    return true;
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Browser closed');
    }
  }
}

/**
 * Run the scraper and save results to database
 * 
 * @param options - Scraper configuration options
 * @returns Array of scraped deals
 * 
 * @example
 * const deals = await runScraper({ maxDeals: 100 });
 * console.log(`Scraped ${deals.length} deals`);
 */
export async function runScraper(options?: ScraperOptions): Promise<DealData[]> {
  const scraper = new InvestorLiftScraper(options);
  
  try {
    await scraper.initialize();
    await scraper.login();
    const deals = await scraper.scrapeDeals();
    
    // Save to database
    await saveDealsToDatabase(deals);
    
    return deals;
  } finally {
    await scraper.close();
  }
}

/**
 * Save scraped deals to Supabase database
 */
async function saveDealsToDatabase(deals: DealData[]): Promise<void> {
  logger.info(`Saving ${deals.length} deals to database...`);
  
  for (const deal of deals) {
    try {
      const { error } = await supabase
        .from('scraped_deals')
        .upsert({
          title: deal.title,
          location: deal.address,
          city: deal.city,
          state: deal.state,
          price: deal.price,
          arv: deal.arv,
          beds: deal.beds,
          baths: deal.baths,
          sqft: deal.sqft,
          description: deal.description,
          image_urls: deal.imageUrls,
          deal_url: deal.dealUrl,
          deal_type: deal.dealType,
          scraped_at: deal.scraped_at.toISOString(),
        }, {
          onConflict: 'deal_url',
        });

      if (error) {
        logger.warn(`Failed to save deal: ${deal.title}`, error);
      }
    } catch (error) {
      logger.error(`Error saving deal: ${deal.title}`, error);
    }
  }
  
  logger.info('Deals saved to database');
}

export default {
  runScraper,
  InvestorLiftScraper,
};

