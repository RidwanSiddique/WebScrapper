import { Page } from 'puppeteer';
import { ScraperConfig } from '../config/scraper-config.js';

export interface ProductData {
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
  details?: string[];
  resources?: string[];
  drawing?: string;
  [key: string]: any; // Allow additional custom fields
}

export class ProductExtractor {
  constructor(private page: Page, private config: ScraperConfig) {}

  async extractProduct(productUrl: string, productTitle: string): Promise<ProductData | null> {
    try {
      console.log(`\n--- Extracting: ${productTitle} ---`);
      console.log(`URL: ${productUrl}`);

      const productData = await this.page.evaluate((url, title, config) => {
        const product: ProductData = {
          title: title,
          description: '',
          image: '',
          url: url
        };

        // Helper function to extract text by selectors
        const extractBySelectors = (selectors: string[]): string[] => {
          const results: string[] = [];
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent?.trim();
              if (text && text.length > 5) {
                results.push(text);
              }
            });
          }
          return [...new Set(results)]; // Remove duplicates
        };

        // Helper function to extract by heading keywords
        const extractByHeading = (keywords: string[], followingSelectors: string[] = ['li', 'p']): string[] => {
          const results: string[] = [];
          
          // Find headings containing keywords
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(h => 
            keywords.some(keyword => h.textContent?.toLowerCase().includes(keyword.toLowerCase()))
          );
          
          headings.forEach(heading => {
            let nextElement = heading.nextElementSibling;
            while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
              if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
                const items = nextElement.querySelectorAll('li');
                items.forEach(item => {
                  const text = item.textContent?.trim();
                  if (text && text.length > 5) results.push(text);
                });
              } else if (followingSelectors.includes(nextElement.tagName.toLowerCase())) {
                const text = nextElement.textContent?.trim();
                if (text && text.length > 10) results.push(text);
              }
              nextElement = nextElement.nextElementSibling;
            }
          });
          
          return [...new Set(results)];
        };

        // Extract title
        for (const selector of config.extractionRules.title) {
          const titleEl = document.querySelector(selector);
          if (titleEl?.textContent?.trim()) {
            product.title = titleEl.textContent.trim();
            break;
          }
        }

        // Extract description
        const descriptions: string[] = [];
        for (const selector of config.extractionRules.description) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 20) descriptions.push(text);
          });
        }
        
        if (descriptions.length > 0) {
          const firstDesc = descriptions[0];
          const sentences = firstDesc.split(/[.!?]+/);
          if (sentences.length >= 2) {
            product.description = sentences.slice(0, 3).join('. ').trim();
            if (!product.description.endsWith('.')) product.description += '.';
          } else {
            product.description = firstDesc;
          }
        }

        // Extract image
        for (const selector of config.extractionRules.image) {
          const img = document.querySelector(selector) as HTMLImageElement;
          if (img?.src && !img.src.includes('logo') && !img.src.includes('placeholder')) {
            product.image = img.src;
            break;
          }
        }

        // Extract price
        for (const selector of config.extractionRules.price) {
          const priceEl = document.querySelector(selector);
          if (priceEl?.textContent?.trim()) {
            product.price = priceEl.textContent.trim();
            break;
          }
        }

        // Extract specifications
        const specifications = [
          ...extractBySelectors(config.extractionRules.specifications.selectors),
          ...extractByHeading(config.extractionRules.specifications.headingKeywords)
        ];
        if (specifications.length > 0) product.specifications = specifications;

        // Extract features
        const features = [
          ...extractBySelectors(config.extractionRules.features.selectors),
          ...extractByHeading(config.extractionRules.features.headingKeywords)
        ];
        if (features.length > 0) product.features = features;

        // Extract benefits
        const benefits = [
          ...extractBySelectors(config.extractionRules.benefits.selectors),
          ...extractByHeading(config.extractionRules.benefits.headingKeywords)
        ];
        if (benefits.length > 0) product.benefits = benefits;

        // Extract applications
        const applications = [
          ...extractBySelectors(config.extractionRules.applications.selectors),
          ...extractByHeading(config.extractionRules.applications.headingKeywords)
        ];
        if (applications.length > 0) product.applications = applications;

        // Extract details
        const details = [
          ...extractBySelectors(config.extractionRules.details.selectors),
          ...extractByHeading(config.extractionRules.details.headingKeywords)
        ];
        if (details.length > 0) product.details = details;

        // Extract resources
        const resources = [
          ...extractBySelectors(config.extractionRules.resources.selectors),
          ...extractByHeading(config.extractionRules.resources.headingKeywords)
        ];
        if (resources.length > 0) product.resources = resources;

        // Extract additional custom fields
        if (config.extractionRules.additionalFields) {
          Object.entries(config.extractionRules.additionalFields).forEach(([fieldName, selectors]) => {
            if (Array.isArray(selectors)) {
              const values = extractBySelectors(selectors);
              if (values.length > 0) product[fieldName] = values;
            }
          });
        }

        // Generate product ID from URL
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        if (lastPart) {
          product.productId = lastPart.replace(/[^a-zA-Z0-9-_]/g, '');
        }

        return product;
      }, productUrl, productTitle, this.config);

      // Validate extracted data
      if (!this.isValidProduct(productData)) {
        console.log(`❌ Invalid product: ${productData.title}`);
        return null;
      }

      console.log(`✅ Extracted: ${productData.title}`);
      console.log(`   Description: ${productData.description.substring(0, 100)}...`);
      if (productData.specifications) console.log(`   Specifications: ${productData.specifications.length} items`);
      if (productData.features) console.log(`   Features: ${productData.features.length} items`);
      if (productData.price) console.log(`   Price: ${productData.price}`);

      return productData;

    } catch (error) {
      console.error(`Error extracting product ${productTitle}:`, error);
      return null;
    }
  }

  private isValidProduct(product: ProductData): boolean {
    const { filters } = this.config;
    
    // Check minimum description length
    if (product.description.length < filters.minDescriptionLength) {
      return false;
    }
    
    // Check for invalid title keywords
    for (const keyword of filters.invalidTitleKeywords) {
      if (product.title.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
    }
    
    // Check for invalid description keywords
    for (const keyword of filters.invalidDescriptionKeywords) {
      if (product.description.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }
}
