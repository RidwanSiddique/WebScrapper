import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const DEBUG = process.env.APP_DEBUG === '1';
const VISUAL = process.env.APP_VISUAL === '1' || DEBUG;
// Pause helper (only active in debug builds)
const pause = () => { if (DEBUG) debugger; };

interface ProductData {
  title: string;
  description: string;
  image: string;
  url: string;
  specifications?: string[];
  features?: string[];
  price?: string;
  productId?: string;
  technicalSpecs?: string[];
  benefits?: string[];
  applications?: string[];
}

// Wrap everything in a main function for better error handling
async function main() {
  const browser = await puppeteer.launch({
    headless: !VISUAL,                // See the browser in visual/debug mode, headless in prod
    devtools: DEBUG,                  // Open Chrome DevTools window (only in debug mode)
    slowMo: VISUAL ? 200 : 0,         // Slow down steps so you can watch them
    channel: 'chrome',                // Prefer system Chrome (Puppeteer ≥21). Remove if you want bundled Chromium.
    // dumpio: DEBUG,                 // (Browser logs to Node stdio) enable when needed
  });

  if (DEBUG) {
    // Debugging the page (client code) from Node
    browser.on('targetchanged', t => console.log('[TARGET]', t.url()));
  }

  const page = await browser.newPage();

  if (VISUAL || DEBUG) {
    // Show browser activity logs in visual/debug mode
    page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('[PAGE ERROR]', err));
    page.on('requestfailed', r => console.warn('[REQ FAIL]', r.failure()?.errorText, r.url()));
  }

  pause(); // 1) Pause after browser setup

  console.log('Navigating to GNSS products page...');
  await page.goto('https://www.calian.com/advanced-technologies/products/gnss-products/#!page=1', { 
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  pause(); // 2) Pause after page loads - inspect the loaded page

  await page.setViewport({ width: 1080, height: 1024 });

  // Wait for the products to load
  console.log('Waiting for products to load...');
  await page.waitForSelector('.product-card, .product-item, .card, [class*="product"], .grid-item', { timeout: 10000 }).catch(() => {
    console.log('No standard product selectors found, will try to find products dynamically...');
  });

  // Give some time for any dynamic content to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Find all product links on the page
  console.log('Finding product links...');
  const productLinks = await page.evaluate(() => {
    // Focus on actual product links with /gnss_product/ in URL
    const productElements = Array.from(document.querySelectorAll('a[href*="/gnss_product/"]'));
    
    return productElements.map((element, index) => {
      const link = element as HTMLAnchorElement;
      const title = element.textContent?.trim() || `Product ${index + 1}`;
      
      return {
        url: link.href,
        title: title,
        index: index
      };
    }).filter(product => product.url && product.url.includes('/gnss_product/'));
  });

  console.log(`Found ${productLinks.length} product links to scrape`);
  
  const allProducts: ProductData[] = [];

  // Function to scrape detailed product information from individual product page
  async function scrapeProductDetails(productUrl: string, productTitle: string, index: number): Promise<ProductData | null> {
    try {
      console.log(`\n--- Scraping Product ${index + 1}: ${productTitle} ---`);
      console.log(`Navigating to: ${productUrl}`);
      
      await page.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract comprehensive product data from the product page
      const productData = await page.evaluate((url, title) => {
        const product: ProductData = {
          title: title,
          description: '',
          image: '',
          url: url,
          specifications: [],
          features: [],
          productId: ''
        };

        // Extract product ID from URL
        const urlMatch = url.match(/\/gnss_product\/([^\/]+)/);
        if (urlMatch) {
          product.productId = urlMatch[1];
        }

        // Extract main title (might be more detailed on product page)
        const mainTitle = document.querySelector('h1, .product-title, .entry-title, [class*="title"]');
        if (mainTitle?.textContent?.trim()) {
          product.title = mainTitle.textContent.trim();
        }

        // Extract main description/content
        const descriptions: string[] = [];
        const descSelectors = [
          '.product-description',
          '.entry-content',
          '.product-details',
          '.content',
          'main p',
          '.description'
        ];
        
        descSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 20) {
              descriptions.push(text);
            }
          });
        });
        
        product.description = descriptions.join(' ').substring(0, 1000);

        // Extract main product image
        const imgSelectors = [
          '.product-image img',
          '.featured-image img',
          '.hero-image img',
          'main img',
          '.gallery img'
        ];
        
        for (const selector of imgSelectors) {
          const img = document.querySelector(selector) as HTMLImageElement;
          if (img?.src && !img.src.includes('logo')) {
            product.image = img.src;
            break;
          }
        }

        // Extract specifications
        const specs: string[] = [];
        const specSelectors = [
          '.specifications li',
          '.specs li',
          '.product-specs li',
          '.technical-specs li',
          'table tr',
          '.spec-item'
        ];
        
        specSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 5 && text.length < 200) {
              specs.push(text);
            }
          });
        });
        
        product.specifications = [...new Set(specs)]; // Remove duplicates

        // Extract features
        const features: string[] = [];
        const featureSelectors = [
          '.features li',
          '.product-features li',
          '.feature-list li',
          '.benefits li',
          '[class*="feature"] li'
        ];
        
        featureSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 5 && text.length < 200) {
              features.push(text);
            }
          });
        });
        
        product.features = [...new Set(features)]; // Remove duplicates

        // Extract price
        const priceSelectors = [
          '.price',
          '.product-price',
          '[class*="price"]',
          '.cost'
        ];
        
        for (const selector of priceSelectors) {
          const priceEl = document.querySelector(selector);
          if (priceEl?.textContent?.trim()) {
            product.price = priceEl.textContent.trim();
            break;
          }
        }

        return product;
      }, productUrl, productTitle);

      console.log(`✓ Scraped: ${productData.title}`);
      console.log(`  - Description: ${productData.description.substring(0, 100)}...`);
      console.log(`  - Specifications: ${productData.specifications?.length || 0} items`);
      console.log(`  - Features: ${productData.features?.length || 0} items`);
      console.log(`  - Image: ${productData.image ? 'Found' : 'None'}`);

      return productData;

    } catch (error) {
      console.error(`Error scraping product ${productTitle}:`, error);
      return null;
    }
  }

  // Scrape each product individually
  for (let i = 0; i < productLinks.length; i++) {
    const link = productLinks[i];
    const productData = await scrapeProductDetails(link.url, link.title, i);
    
    // Filter out broken links and invalid products
    if (productData && 
        !productData.title.includes('Page not found') && 
        !productData.description.includes("This page has either moved or doesn't exist") &&
        productData.description.length > 50) {
      allProducts.push(productData);
      console.log(`✅ Added valid product: ${productData.title}`);
    } else {
      console.log(`❌ Filtered out broken/invalid product: ${productData?.title || link.title}`);
    }

    // Add a small delay between requests to be respectful
    if (i < productLinks.length - 1) {
      console.log('Waiting before next product...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const products = allProducts;

  console.log(`Found ${products.length} products on the page`);
  
  // Log each product
  products.forEach((product, index) => {
    console.log(`\n--- Product ${index + 1} ---`);
    console.log(`Title: ${product.title}`);
    console.log(`URL: ${product.url}`);
    console.log(`Description: ${product.description.substring(0, 200)}${product.description.length > 200 ? '...' : ''}`);
    if (product.image) console.log(`Image: ${product.image}`);
    if (product.price) console.log(`Price: ${product.price}`);
    if (product.specifications && product.specifications.length > 0) {
      console.log(`Specifications: ${product.specifications.slice(0, 3).join(', ')}${product.specifications.length > 3 ? '...' : ''}`);
    }
  });

  // Create output directory
  const outputDir = path.join(process.cwd(), 'scraped_data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save to JSON file
  const jsonFilename = `gnss_products_${timestamp}.json`;
  const jsonFilepath = path.join(outputDir, jsonFilename);
  fs.writeFileSync(jsonFilepath, JSON.stringify(products, null, 2));
  console.log(`\nJSON data saved to: ${jsonFilepath}`);

  // Generate detailed TXT report
  const txtFilename = `gnss_products_report_${timestamp}.txt`;
  const txtFilepath = path.join(outputDir, txtFilename);
  
  const generateDetailedReport = (products: ProductData[]): string => {
    const report: string[] = [];
    
    // Header
    report.push('='.repeat(80));
    report.push('CALIAN GNSS PRODUCTS - DETAILED REPORT');
    report.push('='.repeat(80));
    report.push(`Generated: ${new Date().toLocaleString()}`);
    report.push(`Total Valid Products: ${products.length}`);
    report.push('='.repeat(80));
    report.push('');

    // Executive Summary
    report.push('EXECUTIVE SUMMARY');
    report.push('-'.repeat(40));
    report.push(`This report contains detailed information about ${products.length} GNSS products from Calian's portfolio.`);
    report.push('The products include antennas, smart GNSS solutions, SDK packages, and specialized equipment');
    report.push('for various applications including automotive, aerospace, maritime, and precision agriculture.');
    report.push('');

    // Product Categories
    const categories = {
      'Smart Antennas': products.filter(p => p.title.toLowerCase().includes('smart') || p.title.toLowerCase().includes('sdk')),
      'Precision Antennas': products.filter(p => p.title.toLowerCase().includes('precision') || p.title.toLowerCase().includes('ac499')),
      'Anti-Jamming Solutions': products.filter(p => p.title.toLowerCase().includes('anti-jam') || p.title.toLowerCase().includes('crpa')),
      'Space-Qualified': products.filter(p => p.title.toLowerCase().includes('space') || p.title.toLowerCase().includes('arm928')),
      'Passive Antennas': products.filter(p => p.title.toLowerCase().includes('passive') || p.title.toLowerCase().includes('veraphase'))
    };

    report.push('PRODUCT CATEGORIES OVERVIEW');
    report.push('-'.repeat(40));
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length > 0) {
        report.push(`${category}: ${items.length} products`);
      }
    });
    report.push('');

    // Detailed Product Information
    report.push('DETAILED PRODUCT INFORMATION');
    report.push('='.repeat(80));
    report.push('');

    products.forEach((product, index) => {
      report.push(`${index + 1}. ${product.title.toUpperCase()}`);
      report.push('-'.repeat(product.title.length + 3));
      
      // Basic Information
      report.push(`Product ID: ${product.productId || 'N/A'}`);
      report.push(`URL: ${product.url}`);
      report.push('');
      
      // Description
      report.push('DESCRIPTION:');
      const wrappedDesc = product.description.match(/.{1,80}(\s|$)/g) || [product.description];
      wrappedDesc.forEach(line => report.push(`  ${line.trim()}`));
      report.push('');
      
      // Technical Specifications
      if (product.specifications && product.specifications.length > 0) {
        report.push('TECHNICAL SPECIFICATIONS:');
        product.specifications.forEach(spec => {
          report.push(`  • ${spec}`);
        });
        report.push('');
      }
      
      // Features
      if (product.features && product.features.length > 0) {
        report.push('KEY FEATURES:');
        product.features.forEach(feature => {
          report.push(`  • ${feature}`);
        });
        report.push('');
      }
      
      // Additional Information
      if (product.image) {
        report.push(`IMAGE: ${product.image}`);
      }
      if (product.price) {
        report.push(`PRICE: ${product.price}`);
      }
      
      report.push('');
      report.push('='.repeat(80));
      report.push('');
    });

    // Constellation Support Summary
    report.push('GNSS CONSTELLATION SUPPORT ANALYSIS');
    report.push('-'.repeat(50));
    const constellations = ['GPS', 'GLONASS', 'Galileo', 'BeiDou', 'QZSS', 'NavIC'];
    constellations.forEach(constellation => {
      const supportingProducts = products.filter(p => 
        p.specifications?.some(spec => spec.includes(constellation)) ||
        p.description.includes(constellation)
      );
      if (supportingProducts.length > 0) {
        report.push(`${constellation}: ${supportingProducts.length} products support this constellation`);
      }
    });
    report.push('');

    // Application Areas
    report.push('APPLICATION AREAS');
    report.push('-'.repeat(30));
    const applications = ['Automotive', 'Maritime', 'Aerospace', 'Agriculture', 'Survey', 'Timing', 'UAV', 'Precision'];
    applications.forEach(app => {
      const relevantProducts = products.filter(p => 
        p.description.toLowerCase().includes(app.toLowerCase()) ||
        p.title.toLowerCase().includes(app.toLowerCase())
      );
      if (relevantProducts.length > 0) {
        report.push(`${app}: ${relevantProducts.length} relevant products`);
      }
    });
    report.push('');

    // Footer
    report.push('='.repeat(80));
    report.push('END OF REPORT');
    report.push('Generated by Calian GNSS Product Scraper');
    report.push('='.repeat(80));

    return report.join('\n');
  };

  const reportContent = generateDetailedReport(products);
  fs.writeFileSync(txtFilepath, reportContent);
  console.log(`\nDetailed TXT report saved to: ${txtFilepath}`);

  pause(); // 3) Pause after scraping - inspect the results

  await browser.close();
}

// Run the main function with error handling
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}).finally(() => {
  // Ensure the process exits cleanly
  process.exit(0);
});
