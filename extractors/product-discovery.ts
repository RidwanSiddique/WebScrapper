import { Page } from 'puppeteer';
import { ScraperConfig } from '../config/scraper-config.js';

export class ProductDiscovery {
  constructor(private page: Page, private config: ScraperConfig) {}

  async getProductLinksFromPage(pageNumber: number): Promise<{url: string, title: string}[]> {
    const pageUrl = this.buildPageUrl(pageNumber);
    console.log(`\n📄 Discovering products on page ${pageNumber}: ${pageUrl}`);
    
    await this.navigateToPage(pageUrl);
    await this.waitForProducts();
    
    return await this.extractProductLinks(pageNumber);
  }

  private buildPageUrl(pageNumber: number): string {
    if (pageNumber === 1) {
      return this.config.baseUrl;
    }
    
    const pattern = this.config.paginationPattern;
    if (pattern.includes('${pageNumber}')) {
      const paginationPart = pattern.replace('${pageNumber}', pageNumber.toString());
      return this.config.baseUrl + paginationPart;
    }
    
    // Fallback for different pagination patterns
    return `${this.config.baseUrl}?page=${pageNumber}`;
  }

  private async navigateToPage(url: string): Promise<void> {
    let retries = 0;
    while (retries < this.config.navigation.maxRetries) {
      try {
        await this.page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: this.config.navigation.timeout
        });
        return;
      } catch (error) {
        retries++;
        console.log(`⚠️  Navigation attempt ${retries} failed: ${error}`);
        if (retries >= this.config.navigation.maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  private async waitForProducts(): Promise<void> {
    const { waitForSelector, waitTime } = this.config.navigation;
    
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { 
        timeout: 10000 
      }).catch(() => {
        console.log('⚠️  Standard selectors not found, proceeding with dynamic discovery...');
      });
    }
    
    // Give time for dynamic content
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  private async extractProductLinks(pageNumber: number): Promise<{url: string, title: string}[]> {
    console.log(`🔍 Extracting product links...`);
    
    const productLinks = await this.page.evaluate((config, pageNum) => {
      const links: {url: string, title: string}[] = [];
      
      // Try each link selector
      for (const linkSelector of config.productSelectors.linkSelectors) {
        const elements = document.querySelectorAll(linkSelector);
        
        elements.forEach((element, index) => {
          const link = element as HTMLAnchorElement;
          const href = link.href;
          
          // Skip if URL doesn't match required patterns
          if (config.filters.requiredUrlPatterns.length > 0) {
            const matchesPattern = config.filters.requiredUrlPatterns.some(pattern => 
              href.includes(pattern)
            );
            if (!matchesPattern) return;
          }
          
          // Skip if URL matches skip patterns
          const shouldSkip = config.filters.skipUrls.some(skipUrl => 
            href.includes(skipUrl)
          );
          if (shouldSkip) return;
          
          // Extract title
          let title = '';
          
          // Try to get title from various sources
          for (const titleSelector of config.productSelectors.titleSelectors) {
            const titleElement = element.querySelector(titleSelector) || element;
            if (titleElement?.textContent?.trim()) {
              title = titleElement.textContent.trim();
              break;
            }
          }
          
          // Fallback title extraction
          if (!title) {
            title = element.textContent?.trim() || 
                   element.getAttribute('title') || 
                   element.getAttribute('alt') || 
                   `Product ${index + 1}`;
          }
          
          // Clean title
          title = title.replace(/\s+/g, ' ').trim();
          
          if (href && title) {
            links.push({ url: href, title });
          }
        });
        
        // If we found links with this selector, break
        if (links.length > 0) break;
      }
      
      // Remove duplicates
      const unique = links.filter((item, index, arr) => 
        arr.findIndex(other => other.url === item.url) === index
      );
      
      return unique;
    }, this.config, pageNumber);

    console.log(`📋 Found ${productLinks.length} product links`);
    return productLinks;
  }

  async hasMorePages(currentPage: number): Promise<boolean> {
    // Simple check - if we're at max pages or no products found
    const links = await this.extractProductLinks(currentPage);
    return links.length > 0;
  }
}
