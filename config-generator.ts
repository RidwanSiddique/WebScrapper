#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { ScraperConfig } from './config/scraper-config.js';

function createCustomConfig(siteName: string, baseUrl: string): ScraperConfig {
  const domain = new URL(baseUrl).hostname;
  
  console.log(`\n🔧 Creating custom configuration for: ${siteName}`);
  console.log(`🌐 Domain: ${domain}`);
  
  // Smart defaults based on common patterns
  const config: ScraperConfig = {
    siteName,
    baseUrl,
    paginationPattern: '?page=${pageNumber}',
    
    productSelectors: {
      containerSelectors: [
        '.products', 
        '.product-grid', 
        '.product-list',
        '.items', 
        '.catalog',
        'main',
        '.shop-items'
      ],
      linkSelectors: [
        // Generic product link patterns
        'a[href*="/product"]',
        'a[href*="/products/"]', 
        'a[href*="/item"]',
        'a[href*="/items/"]',
        'a[href*="/p/"]',
        // Class-based selectors
        '.product-link',
        '.product a',
        '.item a',
        '.product-item a',
        '.card a',
        '[class*="product"] a'
      ],
      titleSelectors: [
        '.product-title',
        '.product-name',
        '.title',
        '.name',
        'h1', 'h2', 'h3', 'h4',
        '.card-title'
      ]
    },
    
    extractionRules: {
      title: [
        'h1',
        '.product-title',
        '.product-name', 
        '.title',
        '.name',
        '[class*="title"]'
      ],
      description: [
        '.product-description',
        '.description',
        '.product-details',
        '.details',
        '.content p',
        '.summary',
        'main p',
        '.product-summary'
      ],
      image: [
        '.product-image img',
        '.product-img img',
        '.main-image img',
        '.featured-image img',
        '.hero-image img',
        '.gallery img:first-child',
        'main img',
        '.image img'
      ],
      price: [
        '.price',
        '.product-price',
        '.current-price',
        '.sale-price',
        '[class*="price"]',
        '.cost',
        '.money'
      ],
      specifications: {
        selectors: [
          '.specifications li',
          '.specs li',
          '.product-specs li',
          '.technical-specs li',
          '.attributes li',
          'table tr',
          '.spec-item',
          '[class*="specification"] li'
        ],
        headingKeywords: ['specifications', 'specs', 'details', 'attributes', 'technical']
      },
      features: {
        selectors: [
          '.features li',
          '.product-features li',
          '.feature-list li',
          '.highlights li',
          '.key-features li',
          '[class*="feature"] li'
        ],
        headingKeywords: ['features', 'feature', 'highlights', 'benefits']
      },
      benefits: {
        selectors: [
          '.benefits li',
          '.advantages li',
          '[class*="benefit"] li'
        ],
        headingKeywords: ['benefits', 'benefit', 'advantages', 'why choose']
      },
      applications: {
        selectors: [
          '.applications li',
          '.uses li',
          '.suitable-for li',
          '[class*="application"] li'
        ],
        headingKeywords: ['applications', 'application', 'uses', 'suitable for']
      },
      details: {
        selectors: [
          '.details p',
          '.product-details p',
          '.description p',
          '.content p',
          '.info p'
        ],
        headingKeywords: ['details', 'detail', 'description', 'about', 'overview']
      },
      resources: {
        selectors: [
          '.resources a',
          '.downloads a',
          '.documentation a',
          '.files a',
          '.attachments a'
        ],
        headingKeywords: ['resources', 'downloads', 'documentation', 'files']
      }
    },
    
    navigation: {
      waitForSelector: '.product-item, .product, .card, [class*="product"]',
      waitTime: 2000,
      maxRetries: 3,
      timeout: 30000
    },
    
    filters: {
      skipUrls: [
        '/cart', '/checkout', '/account', '/login', '/contact', 
        '/about', '/privacy', '/terms', '/search', '/categories'
      ],
      requiredUrlPatterns: [], // Will be auto-detected
      minDescriptionLength: 30,
      invalidTitleKeywords: ['404', 'not found', 'error', 'page not found'],
      invalidDescriptionKeywords: ['not found', 'error', 'coming soon', '404']
    }
  };

  // Domain-specific optimizations
  if (domain.includes('shopify')) {
    config.productSelectors.linkSelectors = [
      '.product-item__link',
      '.card__link', 
      '.product-link'
    ];
    config.extractionRules.title = ['h1.product__title', '.product__title', 'h1'];
    config.extractionRules.description = ['.product__description', '.product-description', '.rte'];
    config.extractionRules.price = ['.product__price', '.price', '.money'];
    config.filters.requiredUrlPatterns = ['/products/'];
  }
  
  if (domain.includes('woocommerce') || domain.includes('wordpress')) {
    config.productSelectors.linkSelectors = [
      '.woocommerce-loop-product__link',
      '.product-item a',
      '.product a'
    ];
    config.extractionRules.title = ['.product_title', 'h1.entry-title', 'h1'];
    config.extractionRules.description = ['.woocommerce-product-details__short-description', '.product-description'];
    config.extractionRules.price = ['.woocommerce-Price-amount', '.price', '.amount'];
    config.filters.requiredUrlPatterns = ['/product/', '/shop/'];
  }
  
  if (domain.includes('magento')) {
    config.productSelectors.linkSelectors = [
      '.product-item-link',
      '.product-item a'
    ];
    config.extractionRules.title = ['.page-title', 'h1.page-title-wrapper'];
    config.extractionRules.description = ['.product.attribute.description', '.product-description'];
    config.extractionRules.price = ['.price-box .price', '.price'];
  }

  return config;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args.includes('--help')) {
    console.log(`
🔧 Custom Configuration Generator

USAGE:
  tsx config-generator.ts <site-name> <base-url>

EXAMPLES:
  tsx config-generator.ts "My Store" "https://mystore.com/products"
  tsx config-generator.ts "Electronics Shop" "https://electronics.example.com"

This will generate a custom configuration file that you can use with:
  CONFIG_FILE=custom-config.json npm run scrape
`);
    process.exit(0);
  }

  const siteName = args[0];
  const baseUrl = args[1];

  try {
    // Validate URL
    new URL(baseUrl);
    
    const config = createCustomConfig(siteName, baseUrl);
    
    // Save configuration
    const configDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const filename = `${siteName.toLowerCase().replace(/\s+/g, '_')}_config.json`;
    const filepath = path.join(configDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
    
    console.log(`\n✅ Configuration saved to: ${filepath}`);
    console.log(`\n🚀 Usage examples:`);
    console.log(`   CONFIG_FILE=${filepath} npm run scrape`);
    console.log(`   CONFIG_FILE=${filepath} BOT_MITIGATION=1 npm run scrape`);
    console.log(`   CONFIG_FILE=${filepath} APP_VISUAL=1 MAX_PAGES=3 npm run scrape`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
