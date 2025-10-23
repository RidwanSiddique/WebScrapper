import puppeteer, { Browser, Page } from 'puppeteer';
import { ScraperConfig } from '../config/scraper-config.js';
import { ProductData } from '../extractors/product-extractor.js';

export class StealthBehavior {
  constructor(
    private page: Page, 
    private config: ScraperConfig,
    private isStealthMode: boolean = false,
    private isVisual: boolean = false
  ) {}

  async setupStealth(): Promise<void> {
    if (!this.isStealthMode) return;

    console.log('🛡️  Setting up stealth mode...');
    
    await this.setupUserAgent();
    await this.setupViewport();
    await this.setupWebDriverHiding();
    await this.setupVisualCursor();
    await this.setupHeaders();
    await this.setupRequestInterception();
  }

  private async setupUserAgent(): Promise<void> {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
    
    const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await this.page.setUserAgent(randomAgent);
    console.log(`🤖 Using User Agent: ${randomAgent.substring(0, 50)}...`);
  }

  private async setupViewport(): Promise<void> {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 }
    ];
    
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
    await this.page.setViewport(randomViewport);
    console.log(`📱 Using Viewport: ${randomViewport.width}x${randomViewport.height}`);
  }

  private async setupWebDriverHiding(): Promise<void> {
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      
      // Mock chrome runtime
      if (!(window as any).chrome) (window as any).chrome = {};
      if (!(window as any).chrome.runtime) (window as any).chrome.runtime = {};
    });
  }

  private async setupVisualCursor(): Promise<void> {
    if (!this.isVisual) return;

    await this.page.evaluateOnNewDocument(() => {
      const cursor = document.createElement('div');
      cursor.id = 'bot-cursor';
      cursor.style.cssText = `
        position: fixed; width: 20px; height: 20px;
        background: rgba(255, 0, 0, 0.7); border: 2px solid #ff0000;
        border-radius: 50%; pointer-events: none; z-index: 999999;
        transition: all 0.1s ease; box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
      `;
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cursor));
      } else {
        document.body.appendChild(cursor);
      }
    });
  }

  private async setupHeaders(): Promise<void> {
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
  }

  private async setupRequestInterception(): Promise<void> {
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const url = req.url();
      
      if (url.includes('google-analytics') || 
          url.includes('googletagmanager') ||
          url.includes('facebook.com') ||
          url.includes('linkedin.com/analytics') ||
          url.includes('doubleclick') ||
          url.includes('googlesyndication')) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async simulateHumanBehavior(context: 'browsing' | 'reading' | 'interaction'): Promise<void> {
    if (!this.isStealthMode) return;

    const delay = this.getRandomDelay(1000, 3000);
    console.log(`⏳ Human behavior simulation (${context}): ${delay}ms`);
    
    await this.simulateMouseMovement(context);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (Math.random() > 0.7) {
      await this.simulateScrolling();
    }
  }

  private async simulateMouseMovement(context: string): Promise<void> {
    const x = this.getRandomDelay(100, 1200);
    const y = this.getRandomDelay(100, 800);
    
    console.log(`🖱️  Mouse movement (${context}): (${x}, ${y})`);
    await this.page.mouse.move(x, y);
    
    if (this.isVisual) {
      const colors = {
        browsing: 'rgba(255, 165, 0, 0.7)',
        reading: 'rgba(0, 255, 0, 0.7)',
        interaction: 'rgba(0, 0, 255, 0.7)'
      };
      
      await this.page.evaluate((x, y, color) => {
        const cursor = document.getElementById('bot-cursor');
        if (cursor) {
          cursor.style.left = (x - 10) + 'px';
          cursor.style.top = (y - 10) + 'px';
          cursor.style.background = color;
        }
      }, x, y, colors[context as keyof typeof colors]);
    }
  }

  private async simulateScrolling(): Promise<void> {
    console.log('📜 Simulating scroll behavior');
    await this.page.evaluate(() => {
      const scrollHeight = Math.floor(Math.random() * 500) + 200;
      window.scrollBy(0, scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(500, 1200)));
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
    if (!this.isStealthMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    const delay = this.getRandomDelay(min, max);
    console.log(`⏳ Random stealth delay: ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
