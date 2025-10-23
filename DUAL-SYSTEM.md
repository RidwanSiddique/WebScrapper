# 🔀 Dual Scraper System Overview

You now have **TWO independent scraping systems** working side by side:

## 🎯 **Original GNSS Scraper** (`index.ts`)
**Purpose**: Optimized specifically for Calian GNSS products  
**Status**: ✅ Fully preserved and enhanced with all bot mitigation features  
**Best for**: Calian GNSS product scraping with your custom logic

### Commands:
```bash
# Your original commands (still work exactly the same)
npm run start                    # Default GNSS scraping
npm run start:visual             # Visual mode
npm run start:stealth            # Stealth mode
npm run start:stealth:visual     # Stealth + Visual
npm run start:3pages             # 3 pages only
npm run start:all:stealth        # All pages with stealth

# New shortcuts for clarity
npm run gnss                     # Same as start
npm run gnss:visual              # GNSS visual mode
npm run gnss:stealth             # GNSS stealth mode
npm run gnss:stealth:visual      # GNSS stealth + visual
npm run gnss:3pages              # GNSS 3 pages
npm run gnss:all                 # GNSS all pages
```

## 🌐 **Universal Scraper** (`universal-scraper.ts`)
**Purpose**: Works with ANY e-commerce website  
**Status**: ✅ Brand new modular system  
**Best for**: Scraping any other website with automatic configuration

### Commands:
```bash
# Universal scraper commands
npm run scrape                   # Default (uses Calian config)
npm run scrape:help             # Show help and options
npm run scrape:visual           # Visual mode
npm run scrape:stealth          # Stealth mode
npm run scrape:stealth:visual   # Stealth + Visual

# Platform-specific
npm run scrape:shopify          # Shopify stores
npm run scrape:ecommerce        # Generic e-commerce

# Custom sites
SITE_URL=https://store.com npm run scrape
npm run scrape:custom --url=https://example.com
```

## 🎯 **When to Use Which?**

### **Use Original GNSS Scraper (`npm run gnss:*`)** when:
- ✅ Scraping Calian GNSS products specifically
- ✅ You want your proven, custom-tuned extraction logic
- ✅ You need the exact output format you're used to
- ✅ Working with the specific GNSS site structure

### **Use Universal Scraper (`npm run scrape:*`)** when:
- 🌐 Scraping any other e-commerce website
- 🔧 Testing new sites or configurations
- 📦 Scraping Shopify, WooCommerce, or other platforms
- 🚀 Quick setup for any new website

## 🔄 **Both Systems Share:**
- ✅ **Stealth features**: Same bot mitigation capabilities
- ✅ **Visual cursor**: Same cursor tracking system
- ✅ **Environment variables**: Same BOT_MITIGATION, APP_VISUAL, etc.
- ✅ **Output quality**: Professional JSON and text reports

## 💡 **Examples:**

### **Your usual GNSS workflow:**
```bash
# Same as always - your original scraper with enhancements
npm run gnss:stealth:visual

# Or the traditional way
npm run start:stealth:visual
```

### **New e-commerce sites:**
```bash
# Try a Shopify store
npm run scrape:shopify

# Test any website
SITE_URL=https://electronics-store.com npm run scrape:stealth:visual

# Create custom config
tsx config-generator.ts "Electronics Store" "https://electronics.com"
```

## 📁 **File Structure:**
```
├── index.ts                 # 🎯 Your original GNSS scraper (preserved)
├── universal-scraper.ts     # 🌐 New universal entry point
├── config/
│   └── scraper-config.ts    # 🔧 Universal configurations
├── core/
│   ├── universal-scraper.ts # 🏗️ Universal scraper engine  
│   └── stealth-behavior.ts  # 🛡️ Shared stealth features
└── extractors/
    ├── product-extractor.ts # 📊 Universal data extraction
    └── product-discovery.ts # 🔍 Universal product discovery
```

## 🚀 **Quick Test:**

**Test your original GNSS scraper:**
```bash
npm run gnss:visual
```

**Test the universal scraper:**
```bash
npm run scrape:help
npm run scrape:visual
```

Both will work independently and give you the same professional results! 🎉

---

**The beauty**: Your original workflow is untouched, but now you have the power to scrape ANY website with the same quality and stealth features! 🔥
