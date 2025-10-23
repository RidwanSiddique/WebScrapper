import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const DEBUG = process.env.APP_DEBUG === '1';
const VISUAL = process.env.APP_VISUAL === '1' || DEBUG;
const BOT_MITIGATION = process.env.BOT_MITIGATION === '1';
// Configuration for pagination
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '5'); // Default to 5 pages, set MAX_PAGES=1 for single page
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
  details?: string[];
  resources?: string[];
  drawing?: string;
}

// Bot mitigation utilities
const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const getRandomViewport = () => {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
    { width: 1600, height: 900 }
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
};

const getRandomDelay = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const humanLikeDelay = () => {
  return new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 3000)));
};

// Wrap everything in a main function for better error handling
async function main() {
  const browser = await puppeteer.launch({
    headless: !VISUAL,                   // See the browser in visual/debug mode, headless in prod
    devtools: DEBUG,                     // Open Chrome DevTools window (only in debug mode)
    slowMo: VISUAL ? getRandomDelay(100, 300) : 0, // Random slow motion for more human-like behavior
    channel: 'chrome',                   // Prefer system Chrome (Puppeteer ≥21). Remove if you want bundled Chromium.
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled', // Hide webdriver property
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-client-side-phishing-detection',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',
      '--safebrowsing-disable-auto-update',
      '--enable-automation=false',
      '--password-store=basic',
      '--use-mock-keychain'
    ],
    // dumpio: DEBUG,                    // (Browser logs to Node stdio) enable when needed
  });

  if (DEBUG) {
    // Debugging the page (client code) from Node
    browser.on('targetchanged', t => console.log('[TARGET]', t.url()));
  }

  const page = await browser.newPage();

  if (BOT_MITIGATION) {
    console.log('🛡️  Bot mitigation enabled - applying stealth techniques...');
    
    // Bot mitigation: Set random user agent
    const randomUserAgent = getRandomUserAgent();
    await page.setUserAgent(randomUserAgent);
    console.log(`🤖 Using User Agent: ${randomUserAgent}`);

    // Bot mitigation: Set random viewport
    const randomViewport = getRandomViewport();
    await page.setViewport(randomViewport);
    console.log(`📱 Using Viewport: ${randomViewport.width}x${randomViewport.height}`);
  } else {
    // Default viewport for non-stealth mode
    await page.setViewport({ width: 1080, height: 1024 });
  }

  if (BOT_MITIGATION) {
    // Bot mitigation: Remove webdriver traces
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Mock permissions
      const originalQuery = (window.navigator.permissions as any).query;
      (window.navigator.permissions as any).query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: 'granted' }) :
          originalQuery(parameters)
      );

      // Mock chrome runtime
      if (!(window as any).chrome) {
        (window as any).chrome = {};
      }
      if (!(window as any).chrome.runtime) {
        (window as any).chrome.runtime = {};
      }
    });

    // Add visual cursor for stealth mode (only in visual mode)
    if (VISUAL) {
      await page.evaluateOnNewDocument(() => {
        // Create a custom cursor element
        const cursor = document.createElement('div');
        cursor.id = 'bot-cursor';
        cursor.style.cssText = `
          position: fixed;
          width: 20px;
          height: 20px;
          background: rgba(255, 0, 0, 0.7);
          border: 2px solid #ff0000;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          transition: all 0.1s ease;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        `;
        
        // Add cursor to page when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(cursor);
          });
        } else {
          document.body.appendChild(cursor);
        }

        // Track mouse movements and update cursor position
        let lastX = 0, lastY = 0;
        const updateCursor = (x: number, y: number) => {
          const cursor = document.getElementById('bot-cursor');
          if (cursor) {
            cursor.style.left = (x - 10) + 'px';
            cursor.style.top = (y - 10) + 'px';
            lastX = x;
            lastY = y;
          }
        };

        // Override mouse events to show our custom cursor
        const originalMouseMove = document.onmousemove;
        document.addEventListener('mousemove', (e) => {
          updateCursor(e.clientX, e.clientY);
        });

        // Initialize cursor position
        setTimeout(() => updateCursor(100, 100), 100);
      });
    }

    // Bot mitigation: Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

        // Bot mitigation: Block tracking and unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // Block tracking scripts and analytics
      if (url.includes('google-analytics') || 
          url.includes('googletagmanager') ||
          url.includes('facebook.com') ||
          url.includes('linkedin.com/analytics') ||
          url.includes('doubleclick') ||
          url.includes('googlesyndication') ||
          url.includes('amazon-adsystem') ||
          url.includes('outbrain') ||
          url.includes('taboola')) {
        req.abort();
      }
      // Optionally block fonts and stylesheets for faster loading (comment out if you want full styling)
      else if (resourceType === 'font') {
        req.abort();
      }
      // Allow images, documents, scripts, and other important resources
      else {
        req.continue();
      }
    });
  }

  if (VISUAL || DEBUG) {
    // Show browser activity logs in visual/debug mode
    page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('[PAGE ERROR]', err));
    page.on('requestfailed', r => console.warn('[REQ FAIL]', r.failure()?.errorText, r.url()));
  }

  pause(); // 1) Pause after browser setup

  // Function to scrape detailed product information from individual product page
  async function scrapeProductDetails(productUrl: string, productTitle: string, index: number): Promise<ProductData | null> {
    try {
      console.log(`\n--- Scraping Product ${index + 1}: ${productTitle} ---`);
      console.log(`Navigating to: ${productUrl}`);
      
      // Human-like delay before navigation (only in stealth mode)
      if (BOT_MITIGATION) {
        const navigationDelay = getRandomDelay(1500, 3500);
        console.log(`⏳ Human-like navigation delay: ${navigationDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, navigationDelay));
      }
      
      await page.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      if (BOT_MITIGATION) {
        // Random mouse movement to simulate reading with visual feedback
        const mouseX = getRandomDelay(100, 400);
        const mouseY = getRandomDelay(100, 300);
        console.log(`🖱️  Moving mouse to (${mouseX}, ${mouseY}) to simulate reading behavior`);
        await page.mouse.move(mouseX, mouseY);
        
        // Update visual cursor if in visual mode
        if (VISUAL) {
          await page.evaluate((x, y) => {
            const cursor = document.getElementById('bot-cursor');
            if (cursor) {
              cursor.style.left = (x - 10) + 'px';
              cursor.style.top = (y - 10) + 'px';
              cursor.style.background = 'rgba(0, 255, 0, 0.7)'; // Green for reading
              cursor.style.borderColor = '#00ff00';
            }
          }, mouseX, mouseY);
        }
        
        // Wait for content to load with random delay
        const contentDelay = getRandomDelay(2000, 4000);
        console.log(`⏳ Content analysis delay: ${contentDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, contentDelay));

        // Simulate scrolling behavior with visual feedback
        console.log(`📜 Scrolling page to simulate reading behavior`);
        await page.evaluate(() => {
          const scrollHeight = Math.floor(Math.random() * 500) + 200;
          window.scrollBy(0, scrollHeight);
        });
        await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1200)));

        // Another random mouse movement with visual feedback
        const mouseX2 = getRandomDelay(200, 600);
        const mouseY2 = getRandomDelay(200, 500);
        console.log(`🖱️  Moving mouse to (${mouseX2}, ${mouseY2}) for continued interaction`);
        await page.mouse.move(mouseX2, mouseY2);
        
        if (VISUAL) {
          await page.evaluate((x, y) => {
            const cursor = document.getElementById('bot-cursor');
            if (cursor) {
              cursor.style.left = (x - 10) + 'px';
              cursor.style.top = (y - 10) + 'px';
              cursor.style.background = 'rgba(0, 0, 255, 0.7)'; // Blue for interaction
              cursor.style.borderColor = '#0000ff';
            }
          }, mouseX2, mouseY2);
        }
      } else {
        // Standard delay for non-stealth mode
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

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
        
        // Try to extract the main description (usually the first substantial paragraph)
        let mainDescription = '';
        if (descriptions.length > 0) {
          // Look for the first substantial description paragraph
          const firstDesc = descriptions[0];
          const sentences = firstDesc.split(/[.!?]+/);
          
          // Take first 2-3 sentences for main description
          if (sentences.length >= 2) {
            mainDescription = sentences.slice(0, 3).join('. ').trim();
            if (!mainDescription.endsWith('.')) {
              mainDescription += '.';
            }
          } else {
            mainDescription = firstDesc;
          }
        }
        
        // If no good description found, try alternative methods
        if (!mainDescription) {
          const altDescElements = document.querySelectorAll('main p, .content p, article p');
          for (const p of altDescElements) {
            const text = p.textContent?.trim();
            if (text && text.length > 50 && !text.toLowerCase().includes('contact') && !text.toLowerCase().includes('buy online')) {
              mainDescription = text;
              break;
            }
          }
        }
        
        product.description = mainDescription;

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
          '.spec-item',
          '[class*="specification"] li'
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

        // Extract features using multiple approaches
        const features: string[] = [];
        
        // Method 1: Class-based selectors
        const featureSelectors = [
          '.features li',
          '.product-features li',
          '.feature-list li',
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
        
        // Method 2: Find Features section by heading text
        const featuresHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
          h.textContent?.toLowerCase().includes('features') || h.textContent?.toLowerCase().includes('feature')
        );
        
        if (featuresHeading) {
          let nextElement = featuresHeading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
              const items = nextElement.querySelectorAll('li');
              items.forEach(item => {
                const text = item.textContent?.trim();
                if (text && text.length > 5 && text.length < 200) {
                  features.push(text);
                }
              });
            }
            nextElement = nextElement.nextElementSibling;
          }
        }
        
        product.features = [...new Set(features)]; // Remove duplicates

        // Extract Benefits
        const benefits: string[] = [];
        
        // Method 1: Class-based selectors
        const benefitSelectors = [
          '.benefits li',
          '[class*="benefit"] li'
        ];
        
        benefitSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 5 && text.length < 200) {
              benefits.push(text);
            }
          });
        });
        
        // Method 2: Find Benefits section by looking for headings
        const benefitsHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
          h.textContent?.toLowerCase().includes('benefits') || h.textContent?.toLowerCase().includes('benefit')
        );
        
        if (benefitsHeading) {
          let nextElement = benefitsHeading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
              const items = nextElement.querySelectorAll('li');
              items.forEach(item => {
                const text = item.textContent?.trim();
                if (text && text.length > 5) {
                  benefits.push(text);
                }
              });
            } else if (nextElement.tagName === 'P') {
              const text = nextElement.textContent?.trim();
              if (text && text.length > 10) {
                benefits.push(text);
              }
            }
            nextElement = nextElement.nextElementSibling;
          }
        }
        
        product.benefits = [...new Set(benefits)]; // Remove duplicates

        // Extract Applications
        const applications: string[] = [];
        const applicationsHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
          h.textContent?.toLowerCase().includes('applications') || h.textContent?.toLowerCase().includes('application')
        );
        
        if (applicationsHeading) {
          let nextElement = applicationsHeading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
              const items = nextElement.querySelectorAll('li');
              items.forEach(item => {
                const text = item.textContent?.trim();
                if (text && text.length > 2) {
                  applications.push(text);
                }
              });
            } else if (nextElement.tagName === 'P' && nextElement.textContent?.trim()) {
              const text = nextElement.textContent.trim();
              if (text.length > 5) {
                applications.push(text);
              }
            }
            nextElement = nextElement.nextElementSibling;
          }
        }
        
        product.applications = [...new Set(applications)];

        // Extract Details - Enhanced to capture full technical content
        const details: string[] = [];
        
        // Method 1: Look for specific details/specifications headings
        const detailsHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
          h.textContent?.toLowerCase().includes('details') || 
          h.textContent?.toLowerCase().includes('detail') ||
          h.textContent?.toLowerCase().includes('specifications') ||
          h.textContent?.toLowerCase().includes('specification')
        );
        
        if (detailsHeading) {
          let nextElement = detailsHeading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
              const items = nextElement.querySelectorAll('li');
              items.forEach(item => {
                const text = item.textContent?.trim();
                if (text && text.length > 5) {
                  details.push(text);
                }
              });
            } else if (nextElement.tagName === 'P' && nextElement.textContent?.trim()) {
              const text = nextElement.textContent.trim();
              if (text.length > 20) {
                details.push(text);
              }
            }
            nextElement = nextElement.nextElementSibling;
          }
        }
        
        // Method 2: Extract detailed technical content from main content area
        // This captures the longer technical descriptions that aren't in the main description
        const allParagraphs = document.querySelectorAll('main p, .content p, .entry-content p, article p');
        let foundMainDesc = false;
        
        allParagraphs.forEach(p => {
          const text = p.textContent?.trim();
          if (text && text.length > 100) {
            // Skip the main description paragraph we already captured
            if (text.includes(product.description.substring(0, 50))) {
              foundMainDesc = true;
              return;
            }
            
            // If we found the main description, capture subsequent detailed paragraphs
            if (foundMainDesc && !text.toLowerCase().includes('contact') && 
                !text.toLowerCase().includes('buy online') && 
                !text.toLowerCase().includes('datasheet available')) {
              details.push(text);
            }
            
            // Also capture paragraphs that look like technical details
            if (text.toLowerCase().includes('frequency') || 
                text.toLowerCase().includes('antenna') ||
                text.toLowerCase().includes('filtering') ||
                text.toLowerCase().includes('lte') ||
                text.toLowerCase().includes('signals') ||
                text.toLowerCase().includes('technology') ||
                text.toLowerCase().includes('performance') ||
                text.toLowerCase().includes('rugged') ||
                text.toLowerCase().includes('installation')) {
              details.push(text);
            }
          }
        });
        
        // Method 3: Look for any remaining technical content
        const techContent = document.querySelectorAll('.technical-details, .product-details, .details-section');
        techContent.forEach(section => {
          const text = section.textContent?.trim();
          if (text && text.length > 50) {
            details.push(text);
          }
        });
        
        product.details = [...new Set(details)]; // Remove duplicates

        // Extract Resources
        const resources: string[] = [];
        const resourcesHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
          h.textContent?.toLowerCase().includes('resources') || 
          h.textContent?.toLowerCase().includes('resource') ||
          h.textContent?.toLowerCase().includes('downloads') ||
          h.textContent?.toLowerCase().includes('documentation')
        );
        
        if (resourcesHeading) {
          let nextElement = resourcesHeading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
              const items = nextElement.querySelectorAll('li');
              items.forEach(item => {
                const text = item.textContent?.trim();
                if (text && text.length > 3) {
                  resources.push(text);
                }
              });
            }
            // Also look for download links or resource links
            const links = nextElement.querySelectorAll('a');
            links.forEach(link => {
              const linkText = link.textContent?.trim();
              const href = link.href;
              if (linkText && href && (href.includes('.pdf') || href.includes('download') || href.includes('datasheet'))) {
                resources.push(`${linkText}: ${href}`);
              }
            });
            nextElement = nextElement.nextElementSibling;
          }
        }
        
        product.resources = [...new Set(resources)];

        // Extract Drawing information
        const drawingSelectors = [
          'a[href*="drawing"]',
          'a[href*="Drawing"]',
          'a[href*=".dwg"]',
          'a[href*=".pdf"][href*="drawing"]',
          '.drawing-link',
          '[class*="drawing"]'
        ];
        
        for (const selector of drawingSelectors) {
          const drawingLink = document.querySelector(selector) as HTMLAnchorElement;
          if (drawingLink?.href) {
            product.drawing = drawingLink.href;
            break;
          }
        }

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
      console.log(`  - Benefits: ${productData.benefits?.length || 0} items`);
      console.log(`  - Applications: ${productData.applications?.length || 0} items`);
      console.log(`  - Details: ${productData.details?.length || 0} items`);
      console.log(`  - Resources: ${productData.resources?.length || 0} items`);
      console.log(`  - Image: ${productData.image ? 'Found' : 'None'}`);
      console.log(`  - Drawing: ${productData.drawing ? 'Found' : 'None'}`);

      return productData;

    } catch (error) {
      console.error(`Error scraping product ${productTitle}:`, error);
      return null;
    }
  }

  // Function to get product links from a specific page
  async function getProductLinksFromPage(pageNumber: number): Promise<any[]> {
    const pageUrl = `https://www.calian.com/advanced-technologies/products/gnss-products/#!page=${pageNumber}`;
    
    console.log(`\n📄 Navigating to page ${pageNumber}: ${pageUrl}`);
    
    // Add human-like delay before navigation (only in stealth mode)
    if (BOT_MITIGATION) {
      console.log(`⏳ Human-like delay before navigation...`);
      await humanLikeDelay();
    }
    
    await page.goto(pageUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the products to load with random delay
    console.log(`Waiting for products to load on page ${pageNumber}...`);
    await page.waitForSelector('.product-card, .product-item, .card, [class*="product"], .grid-item', { timeout: 10000 }).catch(() => {
      console.log('No standard product selectors found, will try to find products dynamically...');
    });

    // Give some time for any dynamic content to load with conditional random delay
    if (BOT_MITIGATION) {
      const loadDelay = getRandomDelay(2000, 4000);
      console.log(`⏳ Random content load delay: ${loadDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, loadDelay));
      
      // Add random mouse movements to simulate human behavior with visual feedback
      console.log(`🖱️  Simulating human browsing behavior on page ${pageNumber}`);
      
      // First movement - scanning the page
      const scanX1 = getRandomDelay(100, 800);
      const scanY1 = getRandomDelay(100, 600);
      console.log(`🔍 Scanning page - move 1: (${scanX1}, ${scanY1})`);
      await page.mouse.move(scanX1, scanY1);
      
      if (VISUAL) {
        await page.evaluate((x, y) => {
          const cursor = document.getElementById('bot-cursor');
          if (cursor) {
            cursor.style.left = (x - 10) + 'px';
            cursor.style.top = (y - 10) + 'px';
            cursor.style.background = 'rgba(255, 165, 0, 0.7)'; // Orange for browsing
            cursor.style.borderColor = '#ff8c00';
          }
        }, scanX1, scanY1);
      }
      
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1000)));
      
      // Second movement - looking at products
      const scanX2 = getRandomDelay(200, 900);
      const scanY2 = getRandomDelay(200, 700);
      console.log(`🔍 Scanning products - move 2: (${scanX2}, ${scanY2})`);
      await page.mouse.move(scanX2, scanY2);
      
      if (VISUAL) {
        await page.evaluate((x, y) => {
          const cursor = document.getElementById('bot-cursor');
          if (cursor) {
            cursor.style.left = (x - 10) + 'px';
            cursor.style.top = (y - 10) + 'px';
            cursor.style.background = 'rgba(128, 0, 128, 0.7)'; // Purple for product scanning
            cursor.style.borderColor = '#800080';
          }
        }, scanX2, scanY2);
      }
    } else {
      // Standard delay for non-stealth mode
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Find all product links on this page
    console.log(`Finding product links on page ${pageNumber}...`);
    const productLinks = await page.evaluate((pageNum) => {
      // Focus on actual product links with /gnss_product/ in URL
      const productElements = Array.from(document.querySelectorAll('a[href*="/gnss_product/"]'));
      
      return productElements.map((element, index) => {
        const link = element as HTMLAnchorElement;
        const title = element.textContent?.trim() || `Product ${index + 1}`;
        
        return {
          url: link.href,
          title: title,
          index: index,
          pageNumber: pageNum
        };
      }).filter(product => product.url && product.url.includes('/gnss_product/'));
    }, pageNumber);

    console.log(`Found ${productLinks.length} product links on page ${pageNumber}`);
    return productLinks;
  }

  // Process pages one by one with complete product scraping per page
  console.log(`\n🔍 Starting page-by-page scraping (Max pages: ${MAX_PAGES})`);
  let allProducts: ProductData[] = [];
  let currentPage = 1;
  let emptyPagesCount = 0;
  const maxEmptyPages = 2; // Stop if we encounter 2 consecutive empty pages

  while (currentPage <= MAX_PAGES && emptyPagesCount < maxEmptyPages) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 PROCESSING PAGE ${currentPage} OF ${MAX_PAGES}`);
      console.log(`${'='.repeat(60)}`);
      
      // Get product links for current page
      const pageLinks = await getProductLinksFromPage(currentPage);
      
      if (pageLinks.length === 0) {
        console.log(`⚠️  No products found on page ${currentPage}`);
        emptyPagesCount++;
      } else {
        emptyPagesCount = 0; // Reset empty page counter
        console.log(`📋 Found ${pageLinks.length} products on page ${currentPage}`);
        
        // Process all products from this page immediately
        console.log(`\n🔍 Starting individual product scraping for page ${currentPage}...`);
        
        for (let i = 0; i < pageLinks.length; i++) {
          const link = pageLinks[i];
          
          console.log(`\n[Page ${currentPage}] [${i + 1}/${pageLinks.length}] Processing: ${link.title}`);
          
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

          // Add conditional delay between product requests
          if (i < pageLinks.length - 1) {
            if (BOT_MITIGATION) {
              const betweenProductDelay = getRandomDelay(2000, 5000);
              console.log(`⏳ Human-like delay before next product: ${betweenProductDelay}ms`);
              await new Promise(resolve => setTimeout(resolve, betweenProductDelay));
            } else {
              console.log('Waiting before next product...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        console.log(`\n✅ PAGE ${currentPage} COMPLETE: Processed ${pageLinks.length} products, ${allProducts.filter(p => p.url && pageLinks.some(link => link.url === p.url)).length} valid products added`);
      }
      
      currentPage++;
      
      // Add conditional pause between pages
      if (currentPage <= MAX_PAGES && emptyPagesCount < maxEmptyPages) {
        console.log(`\n⏸️  PAUSING BEFORE NEXT PAGE...`);
        console.log(`📊 Current progress: ${allProducts.length} total valid products collected so far`);
        if (BOT_MITIGATION) {
          const betweenPageDelay = getRandomDelay(5000, 10000);
          console.log(`⏳ Human-like delay before proceeding to page ${currentPage}: ${betweenPageDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, betweenPageDelay));
        } else {
          console.log(`⏳ Waiting 3 seconds before proceeding to page ${currentPage}...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
    } catch (error) {
      console.error(`Error processing page ${currentPage}:`, error);
      emptyPagesCount++;
      currentPage++;
    }
  }

  const finalProductsCount = allProducts.length;

  console.log(`\n📊 Multi-page scraping complete:`);
  console.log(`   - Pages processed: ${currentPage - 1}`);
  console.log(`   - Total valid products scraped: ${finalProductsCount}`);

  const products = allProducts;

  console.log(`\n📊 FINAL SCRAPING SUMMARY:`);
  console.log(`   - Pages processed: ${currentPage - 1}`);
  console.log(`   - Total valid products scraped: ${products.length}`);
  
  // Log each product summary
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

  pause(); // 3) Pause after scraping - inspect the results

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
        report.push('FEATURES:');
        product.features.forEach(feature => {
          report.push(`  • ${feature}`);
        });
        report.push('');
      }

      // Benefits
      if (product.benefits && product.benefits.length > 0) {
        report.push('BENEFITS:');
        product.benefits.forEach(benefit => {
          report.push(`  • ${benefit}`);
        });
        report.push('');
      }

      // Applications
      if (product.applications && product.applications.length > 0) {
        report.push('APPLICATIONS:');
        product.applications.forEach(app => {
          report.push(`  • ${app}`);
        });
        report.push('');
      }

      // Details
      if (product.details && product.details.length > 0) {
        report.push('DETAILS:');
        product.details.forEach(detail => {
          const wrappedDetail = detail.match(/.{1,80}(\s|$)/g) || [detail];
          wrappedDetail.forEach((line, index) => {
            if (index === 0) {
              report.push(`  • ${line.trim()}`);
            } else {
              report.push(`    ${line.trim()}`);
            }
          });
        });
        report.push('');
      }

      // Resources
      if (product.resources && product.resources.length > 0) {
        report.push('RESOURCES:');
        product.resources.forEach(resource => {
          report.push(`  • ${resource}`);
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
      if (product.drawing) {
        report.push(`DRAWING: ${product.drawing}`);
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
