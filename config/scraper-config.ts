export interface ScraperConfig {
  // Site Configuration
  siteName: string;
  baseUrl: string;
  paginationPattern: string; // e.g., "?page=${pageNumber}" or "#!page=${pageNumber}"
  
  // Product Discovery
  productSelectors: {
    containerSelectors: string[]; // Where to find product links
    linkSelectors: string[]; // Actual product link selectors
    titleSelectors: string[]; // How to extract titles from listing
  };
  
  // Product Page Extraction
  extractionRules: {
    title: string[];
    description: string[];
    image: string[];
    price: string[];
    specifications: {
      selectors: string[];
      headingKeywords: string[];
    };
    features: {
      selectors: string[];
      headingKeywords: string[];
    };
    benefits: {
      selectors: string[];
      headingKeywords: string[];
    };
    applications: {
      selectors: string[];
      headingKeywords: string[];
    };
    details: {
      selectors: string[];
      headingKeywords: string[];
    };
    resources: {
      selectors: string[];
      headingKeywords: string[];
    };
    additionalFields?: {
      [key: string]: string[];
    };
  };
  
  // Navigation & Timing
  navigation: {
    waitForSelector?: string;
    waitTime: number;
    maxRetries: number;
    timeout: number;
  };
  
  // Filtering & Validation
  filters: {
    skipUrls: string[]; // URLs to skip (like /contact, /about)
    requiredUrlPatterns: string[]; // URLs must contain these patterns
    minDescriptionLength: number;
    invalidTitleKeywords: string[]; // Skip if title contains these
    invalidDescriptionKeywords: string[]; // Skip if description contains these
  };
}

// Predefined configurations for popular sites
export const PREDEFINED_CONFIGS: { [key: string]: ScraperConfig } = {
  'calian-gnss': {
    siteName: 'Calian GNSS',
    baseUrl: 'https://www.calian.com/advanced-technologies/products/gnss-products/',
    paginationPattern: '#!page=${pageNumber}',
    productSelectors: {
      containerSelectors: ['.product-grid', '.products-container', 'main'],
      linkSelectors: ['a[href*="/gnss_product/"]'],
      titleSelectors: ['a[href*="/gnss_product/"]']
    },
    extractionRules: {
      title: ['h1', '.product-title', '.entry-title', '[class*="title"]'],
      description: ['.product-description', '.entry-content', '.product-details', '.content', 'main p', '.description'],
      image: ['.product-image img', '.featured-image img', '.hero-image img', 'main img', '.gallery img'],
      price: ['.price', '.product-price', '[class*="price"]', '.cost'],
      specifications: {
        selectors: ['.specifications li', '.specs li', '.product-specs li', '.technical-specs li', 'table tr', '.spec-item', '[class*="specification"] li'],
        headingKeywords: ['specifications', 'specs', 'technical']
      },
      features: {
        selectors: ['.features li', '.product-features li', '.feature-list li', '[class*="feature"] li'],
        headingKeywords: ['features', 'feature']
      },
      benefits: {
        selectors: ['.benefits li', '[class*="benefit"] li'],
        headingKeywords: ['benefits', 'benefit']
      },
      applications: {
        selectors: ['.applications li', '[class*="application"] li'],
        headingKeywords: ['applications', 'application']
      },
      details: {
        selectors: ['.details li', '.product-details li', '.technical-details li'],
        headingKeywords: ['details', 'detail', 'specifications']
      },
      resources: {
        selectors: ['.resources li', '.downloads li', '.documentation li'],
        headingKeywords: ['resources', 'downloads', 'documentation']
      }
    },
    navigation: {
      waitForSelector: '.product-card, .product-item, .card, [class*="product"], .grid-item',
      waitTime: 2000,
      maxRetries: 3,
      timeout: 30000
    },
    filters: {
      skipUrls: ['/contact', '/about', '/privacy', '/terms'],
      requiredUrlPatterns: ['/gnss_product/'],
      minDescriptionLength: 50,
      invalidTitleKeywords: ['Page not found', '404', 'Error'],
      invalidDescriptionKeywords: ['page has either moved', "doesn't exist", '404']
    }
  },
  
  'generic-ecommerce': {
    siteName: 'Generic E-commerce',
    baseUrl: '',
    paginationPattern: '?page=${pageNumber}',
    productSelectors: {
      containerSelectors: ['.products', '.product-grid', '.shop-items', '.catalog'],
      linkSelectors: ['.product-link', '.product-item a', '.card a', '[class*="product"] a'],
      titleSelectors: ['.product-title', '.product-name', 'h3', 'h4']
    },
    extractionRules: {
      title: ['h1', '.product-title', '.product-name', '[class*="title"]'],
      description: ['.product-description', '.description', '.product-details', '.content p'],
      image: ['.product-image img', '.main-image img', '.hero img', '.gallery img:first-child'],
      price: ['.price', '.product-price', '.current-price', '[class*="price"]'],
      specifications: {
        selectors: ['.specs li', '.specifications li', '.attributes li', 'table td'],
        headingKeywords: ['specifications', 'specs', 'details', 'attributes']
      },
      features: {
        selectors: ['.features li', '.highlights li', '.key-features li'],
        headingKeywords: ['features', 'highlights', 'benefits']
      },
      benefits: {
        selectors: ['.benefits li', '.advantages li'],
        headingKeywords: ['benefits', 'advantages', 'why choose']
      },
      applications: {
        selectors: ['.uses li', '.applications li', '.suitable-for li'],
        headingKeywords: ['applications', 'uses', 'suitable for']
      },
      details: {
        selectors: ['.details p', '.description p', '.content p'],
        headingKeywords: ['details', 'description', 'about']
      },
      resources: {
        selectors: ['.downloads a', '.resources a', '.docs a'],
        headingKeywords: ['downloads', 'resources', 'documentation']
      }
    },
    navigation: {
      waitForSelector: '.product-item, .product-card, .product',
      waitTime: 2000,
      maxRetries: 3,
      timeout: 30000
    },
    filters: {
      skipUrls: ['/cart', '/checkout', '/account', '/login', '/contact'],
      requiredUrlPatterns: ['/product', '/item', '/p/'],
      minDescriptionLength: 30,
      invalidTitleKeywords: ['404', 'not found', 'error'],
      invalidDescriptionKeywords: ['not found', 'error', 'coming soon']
    }
  },

  'shopify-store': {
    siteName: 'Shopify Store',
    baseUrl: '',
    paginationPattern: '?page=${pageNumber}',
    productSelectors: {
      containerSelectors: ['.product-grid', '.collection-grid', '.products'],
      linkSelectors: ['.product-item__link', '.card__link', '.product-link'],
      titleSelectors: ['.product-item__title', '.card__title', '.product-title']
    },
    extractionRules: {
      title: ['h1.product__title', '.product__title', 'h1'],
      description: ['.product__description', '.product-description', '.rte'],
      image: ['.product__media img', '.product-image img', '.featured-image'],
      price: ['.product__price', '.price', '.money'],
      specifications: {
        selectors: ['.product-specs li', '.metafields li', '.product-details li'],
        headingKeywords: ['specifications', 'details', 'specs']
      },
      features: {
        selectors: ['.product-features li', '.highlights li'],
        headingKeywords: ['features', 'highlights']
      },
      benefits: {
        selectors: ['.benefits li', '.advantages li'],
        headingKeywords: ['benefits', 'why buy']
      },
      applications: {
        selectors: ['.uses li', '.applications li'],
        headingKeywords: ['applications', 'uses']
      },
      details: {
        selectors: ['.product-tabs p', '.description p'],
        headingKeywords: ['details', 'description']
      },
      resources: {
        selectors: ['.product-files a', '.downloads a'],
        headingKeywords: ['downloads', 'files']
      }
    },
    navigation: {
      waitForSelector: '.product-item, .card',
      waitTime: 2000,
      maxRetries: 3,
      timeout: 30000
    },
    filters: {
      skipUrls: ['/cart', '/checkout', '/account', '/pages/'],
      requiredUrlPatterns: ['/products/'],
      minDescriptionLength: 30,
      invalidTitleKeywords: ['404', 'not found'],
      invalidDescriptionKeywords: ['not found', 'sold out']
    }
  }
};

// Configuration loader
export class ConfigLoader {
  static load(configName: string): ScraperConfig {
    if (PREDEFINED_CONFIGS[configName]) {
      return PREDEFINED_CONFIGS[configName];
    }
    throw new Error(`Configuration '${configName}' not found. Available: ${Object.keys(PREDEFINED_CONFIGS).join(', ')}`);
  }

  static loadFromFile(filePath: string): ScraperConfig {
    // For loading custom JSON configs
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return config as ScraperConfig;
  }

  static create(baseConfig: Partial<ScraperConfig>): ScraperConfig {
    // Merge with generic defaults
    const defaults = PREDEFINED_CONFIGS['generic-ecommerce'];
    return { ...defaults, ...baseConfig } as ScraperConfig;
  }
}
