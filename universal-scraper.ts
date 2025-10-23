#!/usr/bin/env tsx

import { UniversalScraper } from './core/universal-scraper.js';
import { ConfigLoader, PREDEFINED_CONFIGS } from './config/scraper-config.js';

// Environment variables
const DEBUG = process.env.APP_DEBUG === '1';
const VISUAL = process.env.APP_VISUAL === '1' || DEBUG;
const BOT_MITIGATION = process.env.BOT_MITIGATION === '1';
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '5');
const CONFIG_NAME = process.env.CONFIG_NAME || 'calian-gnss';
const SITE_URL = process.env.SITE_URL || '';

async function main() {
  console.log('🚀 Universal Product Scraper Starting...');
  console.log(`Configuration: ${CONFIG_NAME}`);
  console.log(`Max Pages: ${MAX_PAGES}`);
  console.log(`Visual Mode: ${VISUAL}`);
  console.log(`Stealth Mode: ${BOT_MITIGATION}`);
  console.log('');

  let scraper: UniversalScraper;

  try {
    // If custom URL provided, create dynamic config
    if (SITE_URL) {
      console.log(`🔧 Creating dynamic configuration for: ${SITE_URL}`);
      
      const customConfig = ConfigLoader.create({
        siteName: new URL(SITE_URL).hostname,
        baseUrl: SITE_URL,
        paginationPattern: '?page=${pageNumber}',
        productSelectors: {
          containerSelectors: ['.products', '.product-grid', '.items', 'main'],
          linkSelectors: [
            'a[href*="/product"]', 
            'a[href*="/item"]', 
            'a[href*="/p/"]',
            '.product-link',
            '.product a',
            '.item a'
          ],
          titleSelectors: ['.title', '.name', 'h3', 'h4', '.product-title']
        }
      });

      scraper = await UniversalScraper.createCustom(customConfig, {
        maxPages: MAX_PAGES,
        isVisual: VISUAL,
        isDebug: DEBUG,
        enableStealth: BOT_MITIGATION
      });
    } else {
      // Use predefined configuration
      scraper = await UniversalScraper.createForSite(CONFIG_NAME, {
        maxPages: MAX_PAGES,
        isVisual: VISUAL,
        isDebug: DEBUG,
        enableStealth: BOT_MITIGATION
      });
    }

    // Scrape products
    const products = await scraper.scrapeProducts();

    if (products.length === 0) {
      console.log('⚠️  No products found!');
      console.log('💡 Try adjusting the configuration or selectors for this site.');
      return;
    }

    // Save results
    await scraper.saveResults(products);

    // Summary
    console.log(`\n🎉 SUCCESS! Scraped ${products.length} products`);
    console.log('📁 Check the scraped_data folder for your results');

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  } finally {
    if (scraper!) {
      await scraper.close();
    }
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🕷️  Universal Product Scraper

USAGE:
  npm run scrape                    # Use default config (Calian GNSS)
  npm run scrape:stealth           # With bot mitigation
  npm run scrape:visual            # With visual browser
  
ENVIRONMENT VARIABLES:
  CONFIG_NAME=shopify-store        # Use predefined config
  SITE_URL=https://example.com     # Use custom URL with auto-config
  MAX_PAGES=10                     # Number of pages to scrape
  APP_VISUAL=1                     # Show browser window
  BOT_MITIGATION=1                 # Enable stealth mode
  APP_DEBUG=1                      # Debug mode

PREDEFINED CONFIGURATIONS:
${Object.keys(PREDEFINED_CONFIGS).map(name => `  - ${name}`).join('\n')}

EXAMPLES:
  CONFIG_NAME=generic-ecommerce MAX_PAGES=3 npm run scrape
  SITE_URL=https://mystore.com BOT_MITIGATION=1 npm run scrape
  CONFIG_NAME=shopify-store APP_VISUAL=1 npm run scrape
`);
  process.exit(0);
}

// Run the scraper
main().catch(console.error);
