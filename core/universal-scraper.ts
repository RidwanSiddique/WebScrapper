import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { ScraperConfig, ConfigLoader } from '../config/scraper-config.js';
import { ProductData, ProductExtractor } from '../extractors/product-extractor.js';
import { ProductDiscovery } from '../extractors/product-discovery.js';
import { StealthBehavior } from './stealth-behavior.js';

export interface ScraperOptions {
  maxPages?: number;
  isVisual?: boolean;
  isDebug?: boolean;
  enableStealth?: boolean;
  outputDir?: string;
  configName?: string;
  customConfig?: ScraperConfig;
}

export class UniversalScraper {
  private browser?: Browser;
  private page?: Page;
  private config: ScraperConfig;
  private stealth?: StealthBehavior;
  private extractor?: ProductExtractor;
  private discovery?: ProductDiscovery;
  
  constructor(private options: ScraperOptions) {
    // Load configuration
    if (options.customConfig) {
      this.config = options.customConfig;
    } else if (options.configName) {
      this.config = ConfigLoader.load(options.configName);
    } else {
      throw new Error('Either configName or customConfig must be provided');
    }
    
    console.log(`🚀 Initializing Universal Scraper for: ${this.config.siteName}`);
  }

  async initialize(): Promise<void> {
    console.log('⚙️  Setting up browser...');
    
    this.browser = await puppeteer.launch({
      headless: !this.options.isVisual,
      devtools: this.options.isDebug,
      slowMo: this.options.isVisual ? 100 : 0,
      channel: 'chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--enable-automation=false',
        '--no-default-browser-check'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Initialize components
    this.stealth = new StealthBehavior(
      this.page, 
      this.config, 
      this.options.enableStealth || false,
      this.options.isVisual || false
    );
    
    this.extractor = new ProductExtractor(this.page, this.config);
    this.discovery = new ProductDiscovery(this.page, this.config);
    
    // Setup stealth if enabled
    await this.stealth.setupStealth();
    
    if (this.options.isVisual || this.options.isDebug) {
      this.page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
      this.page.on('pageerror', err => console.error('[PAGE ERROR]', err));
    }
  }

  async scrapeProducts(): Promise<ProductData[]> {
    if (!this.page || !this.discovery || !this.extractor || !this.stealth) {
      throw new Error('Scraper not initialized. Call initialize() first.');
    }

    const maxPages = this.options.maxPages || 5;
    console.log(`\n🔍 Starting scraping (Max pages: ${maxPages})`);
    
    const allProducts: ProductData[] = [];
    let currentPage = 1;
    let emptyPagesCount = 0;
    const maxEmptyPages = 2;

    while (currentPage <= maxPages && emptyPagesCount < maxEmptyPages) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 PROCESSING PAGE ${currentPage} OF ${maxPages}`);
        console.log(`${'='.repeat(60)}`);
        
        // Simulate human behavior before navigation
        await this.stealth.simulateHumanBehavior('browsing');
        
        // Get product links for current page
        const pageLinks = await this.discovery.getProductLinksFromPage(currentPage);
        
        if (pageLinks.length === 0) {
          console.log(`⚠️  No products found on page ${currentPage}`);
          emptyPagesCount++;
        } else {
          emptyPagesCount = 0;
          console.log(`📋 Found ${pageLinks.length} products on page ${currentPage}`);
          
          // Process all products from this page
          for (let i = 0; i < pageLinks.length; i++) {
            const link = pageLinks[i];
            
            console.log(`\n[Page ${currentPage}] [${i + 1}/${pageLinks.length}] Processing: ${link.title}`);
            
            // Navigate to product page
            await this.page.goto(link.url, { 
              waitUntil: 'networkidle2',
              timeout: this.config.navigation.timeout 
            });
            
            // Simulate reading behavior
            await this.stealth.simulateHumanBehavior('reading');
            
            // Extract product data
            const productData = await this.extractor.extractProduct(link.url, link.title);
            
            if (productData) {
              allProducts.push(productData);
              console.log(`✅ Added valid product: ${productData.title}`);
            } else {
              console.log(`❌ Filtered out invalid product: ${link.title}`);
            }

            // Random delay between products
            if (i < pageLinks.length - 1) {
              await this.stealth.randomDelay(2000, 5000);
            }
          }
          
          console.log(`\n✅ PAGE ${currentPage} COMPLETE: ${pageLinks.length} processed, ${allProducts.length} total products`);
        }
        
        currentPage++;
        
        // Pause between pages
        if (currentPage <= maxPages && emptyPagesCount < maxEmptyPages) {
          console.log(`\n⏸️  PAUSING BEFORE NEXT PAGE...`);
          console.log(`📊 Progress: ${allProducts.length} total products collected`);
          await this.stealth.randomDelay(5000, 10000);
        }
        
      } catch (error) {
        console.error(`Error processing page ${currentPage}:`, error);
        emptyPagesCount++;
        currentPage++;
      }
    }

    console.log(`\n📊 Scraping complete: ${allProducts.length} products from ${currentPage - 1} pages`);
    return allProducts;
  }

  async saveResults(products: ProductData[]): Promise<void> {
    const outputDir = this.options.outputDir || path.join(process.cwd(), 'scraped_data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const siteName = this.config.siteName.toLowerCase().replace(/\s+/g, '_');
    
    // Save JSON
    const jsonFilename = `${siteName}_products_${timestamp}.json`;
    const jsonFilepath = path.join(outputDir, jsonFilename);
    fs.writeFileSync(jsonFilepath, JSON.stringify(products, null, 2));
    console.log(`\n💾 JSON data saved to: ${jsonFilepath}`);
    
    // Save detailed report
    const reportFilename = `${siteName}_report_${timestamp}.txt`;
    const reportFilepath = path.join(outputDir, reportFilename);
    const report = this.generateReport(products);
    fs.writeFileSync(reportFilepath, report);
    console.log(`📄 Report saved to: ${reportFilepath}`);
  }

  private generateReport(products: ProductData[]): string {
    const report: string[] = [];
    const siteName = this.config.siteName.toUpperCase();
    
    report.push('='.repeat(80));
    report.push(`${siteName} - PRODUCT SCRAPING REPORT`);
    report.push('='.repeat(80));
    report.push(`Generated: ${new Date().toLocaleString()}`);
    report.push(`Site: ${this.config.siteName}`);
    report.push(`Base URL: ${this.config.baseUrl}`);
    report.push(`Total Products: ${products.length}`);
    report.push('='.repeat(80));
    report.push('');

    // Product summary
    products.forEach((product, index) => {
      report.push(`${index + 1}. ${product.title}`);
      report.push(`   URL: ${product.url}`);
      report.push(`   Description: ${product.description.substring(0, 150)}...`);
      if (product.price) report.push(`   Price: ${product.price}`);
      if (product.specifications?.length) report.push(`   Specifications: ${product.specifications.length} items`);
      if (product.features?.length) report.push(`   Features: ${product.features.length} items`);
      report.push('');
    });

    report.push('='.repeat(80));
    report.push('End of Report');
    return report.join('\n');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔚 Browser closed');
    }
  }

  // Static method to create scraper with predefined config
  static async createForSite(siteName: string, options: Omit<ScraperOptions, 'configName'>): Promise<UniversalScraper> {
    const scraper = new UniversalScraper({ ...options, configName: siteName });
    await scraper.initialize();
    return scraper;
  }

  // Static method to create scraper with custom config
  static async createCustom(config: ScraperConfig, options: Omit<ScraperOptions, 'customConfig' | 'configName'>): Promise<UniversalScraper> {
    const scraper = new UniversalScraper({ ...options, customConfig: config });
    await scraper.initialize();
    return scraper;
  }
}
