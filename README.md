# 🕷️ Universal Product Scraper

A robust, scalable, and configurable web scraper that can extract product information from any e-commerce website with advanced bot mitigation techniques.

## 🔀 Dual Scraper System

You have **TWO independent scraping systems** working side by side:

### 🎯 **Original GNSS Scraper** (`index.ts`)
**Purpose**: Optimized specifically for Calian GNSS products  
**Status**: ✅ Fully preserved and enhanced with all bot mitigation features  
**Best for**: Calian GNSS product scraping with your custom logic

### 🌐 **Universal Scraper** (`universal-scraper.ts`)  
**Purpose**: Works with ANY e-commerce website  
**Status**: ✅ Brand new modular system  
**Best for**: Scraping any other website with automatic configuration

## 🚀 Features

### ✨ **Universal Compatibility**
- **Plug & Play**: Works with any e-commerce site
- **Smart Auto-Detection**: Automatically detects common product patterns
- **Predefined Configs**: Ready-to-use configurations for popular platforms
- **Custom Configs**: Create configurations for any website

### 🛡️ **Advanced Bot Mitigation**
- **Stealth Mode**: Random user agents, viewports, and timing
- **Human Behavior**: Realistic mouse movements and scrolling
- **Visual Cursor**: See bot actions in real-time
- **Request Filtering**: Blocks tracking scripts and analytics

### 🔧 **Highly Configurable**
- **Modular Architecture**: Easily extensible and maintainable
- **Flexible Selectors**: Multiple fallback strategies for data extraction
- **Custom Fields**: Extract any additional data fields
- **Smart Filtering**: Automatic validation and cleanup

### 📊 **Professional Output**
- **Multiple Formats**: JSON and detailed text reports
- **Rich Data**: Specifications, features, benefits, applications
- **Error Handling**: Robust error recovery and logging
- **Progress Tracking**: Real-time scraping progress

## 🏗️ Architecture

```
├── config/
│   └── scraper-config.ts      # Configuration system and presets
├── core/
│   ├── universal-scraper.ts   # Main scraper orchestrator
│   └── stealth-behavior.ts    # Bot mitigation and human simulation
├── extractors/
│   ├── product-extractor.ts   # Product data extraction engine
│   └── product-discovery.ts   # Product link discovery
├── index.ts                   # Original Calian-specific scraper
├── universal-scraper.ts       # Universal scraper entry point
└── config-generator.ts        # Custom config generator
```

## 🚀 Quick Start

### 📋 **Which Scraper to Use?**

#### **For Calian GNSS Products** (Original Scraper):
```bash
# Your original commands (work exactly the same)
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

#### **For Any Other Website** (Universal Scraper):

### 1. **Use Predefined Configurations**

```bash
# Scrape with Calian GNSS config (default)
npm run scrape

# Scrape Shopify stores
npm run scrape:shopify

# Scrape generic e-commerce sites
npm run scrape:ecommerce

# With stealth mode and visual browser
npm run scrape:stealth:visual
```

### 2. **Scrape Any Website with Auto-Config**

```bash
# Auto-generate config for any site
npm run scrape:custom --url=https://yourstore.com/products

# With environment variables
SITE_URL=https://example.com/shop BOT_MITIGATION=1 npm run scrape
```

### 3. **Create Custom Configuration**

```bash
# Generate custom config
tsx config-generator.ts "My Store" "https://mystore.com"

# Use the generated config
CONFIG_FILE=configs/my_store_config.json npm run scrape
```

## 🎯 Predefined Configurations

| Configuration | Description | Best For |
|---------------|-------------|----------|
| `calian-gnss` | Calian GNSS products | Technical product catalogs |
| `generic-ecommerce` | Generic e-commerce sites | Most online stores |
| `shopify-store` | Shopify-powered stores | Shopify sites |

## 🛠️ Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CONFIG_NAME` | Predefined config to use | `calian-gnss` | `shopify-store` |
| `SITE_URL` | Custom site URL (auto-config) | - | `https://store.com` |
| `MAX_PAGES` | Maximum pages to scrape | `5` | `10` |
| `BOT_MITIGATION` | Enable stealth mode | `false` | `1` |
| `APP_VISUAL` | Show browser window | `false` | `1` |
| `APP_DEBUG` | Debug mode | `false` | `1` |

## 📋 Complete Usage Examples

### **Original GNSS Scraper** (Your Calian workflow):

```bash
# Default GNSS scraping
npm run gnss                     # or npm run start

# Visual mode (see browser)
npm run gnss:visual              # or npm run start:visual

# Stealth mode (bot mitigation)
npm run gnss:stealth             # or npm run start:stealth

# Stealth + Visual (see cursor movements)
npm run gnss:stealth:visual      # or npm run start:stealth:visual

# Page-specific scraping
npm run gnss:3pages              # 3 pages only
npm run gnss:all                 # All pages (10)

# Advanced combinations
MAX_PAGES=7 npm run gnss:stealth:visual
```

### **Universal Scraper** (Any website):

#### **Basic Scraping**

```bash
# Default configuration (5 pages)
npm run scrape

# Specific page count
MAX_PAGES=10 npm run scrape

# With visual feedback
APP_VISUAL=1 npm run scrape
```

#### **Stealth Mode**

```bash
# Headless stealth
npm run scrape:stealth

# Visual stealth with cursor tracking
npm run scrape:stealth:visual

# Custom site with stealth
SITE_URL=https://store.com BOT_MITIGATION=1 npm run scrape
```

#### **Different Platforms**

```bash
# Shopify store
CONFIG_NAME=shopify-store MAX_PAGES=3 npm run scrape

# Generic e-commerce
CONFIG_NAME=generic-ecommerce BOT_MITIGATION=1 npm run scrape

# Custom Magento site
SITE_URL=https://magento-store.com/catalog npm run scrape
```

#### **Custom Configuration**

```bash
# Generate config for new site
tsx config-generator.ts "Electronics Store" "https://electronics.com"

# Use generated config
CONFIG_FILE=configs/electronics_store_config.json npm run scrape
```

## 🎯 When to Use Which System?

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

### **Both Systems Share:**
- ✅ **Stealth features**: Same bot mitigation capabilities
- ✅ **Visual cursor**: Same cursor tracking system
- ✅ **Environment variables**: Same BOT_MITIGATION, APP_VISUAL, etc.
- ✅ **Output quality**: Professional JSON and text reports

## 🔧 Creating Custom Configurations

### **Option 1: Auto-Generate**

```bash
tsx config-generator.ts "Store Name" "https://store.com/products"
```

### **Option 2: Manual Configuration**

Create a JSON file following the `ScraperConfig` interface:

```json
{
  "siteName": "My Custom Store",
  "baseUrl": "https://mystore.com/products",
  "paginationPattern": "?page=${pageNumber}",
  "productSelectors": {
    "containerSelectors": [".products", ".product-grid"],
    "linkSelectors": ["a[href*='/product/']", ".product-link"],
    "titleSelectors": [".product-title", "h3"]
  },
  "extractionRules": {
    "title": ["h1", ".product-title"],
    "description": [".description", ".product-desc"],
    "image": [".product-image img", ".main-img"],
    "price": [".price", ".cost"],
    "specifications": {
      "selectors": [".specs li", ".specifications li"],
      "headingKeywords": ["specifications", "specs"]
    }
  }
}
```

## 🎨 Bot Mitigation Features

### **Visual Cursor Tracking**
When using `APP_VISUAL=1` and `BOT_MITIGATION=1`, you'll see:
- 🔴 **Red cursor**: Default position
- 🟠 **Orange cursor**: Browsing/scanning pages  
- 🟢 **Green cursor**: Reading product content
- 🔵 **Blue cursor**: Interacting with elements
- 🟣 **Purple cursor**: Scanning product listings

### **Human-Like Behaviors**
- Random mouse movements and scrolling
- Variable delays between actions (2-10 seconds)
- Realistic viewport sizes and user agents
- Request filtering to avoid detection
- Natural browsing patterns

## 📊 Output

### **JSON Data** (`sitename_products_timestamp.json`)
```json
[
  {
    "title": "Product Name",
    "description": "Product description...",
    "url": "https://...",
    "price": "$99.99",
    "specifications": ["Spec 1", "Spec 2"],
    "features": ["Feature 1", "Feature 2"],
    "benefits": ["Benefit 1", "Benefit 2"],
    "image": "https://..."
  }
]
```

### **Detailed Report** (`sitename_report_timestamp.txt`)
- Executive summary
- Product categories
- Detailed product information
- Technical specifications
- Feature analysis

## 🚨 Common Issues & Solutions

### **No Products Found**
```bash
# For GNSS: Check with visual mode
npm run gnss:visual

# For Universal: Check selectors with visual mode
APP_VISUAL=1 npm run scrape

# Try generic config for universal
CONFIG_NAME=generic-ecommerce npm run scrape

# Generate custom config
tsx config-generator.ts "Site Name" "https://site.com"
```

### **Bot Detection**
```bash
# For GNSS: Enable stealth mode
npm run gnss:stealth

# For Universal: Enable stealth mode
BOT_MITIGATION=1 npm run scrape

# Reduce scraping speed for both
MAX_PAGES=3 npm run gnss:stealth
MAX_PAGES=3 BOT_MITIGATION=1 npm run scrape

# Use visual mode to verify behavior
npm run gnss:stealth:visual
BOT_MITIGATION=1 APP_VISUAL=1 npm run scrape
```

### **Invalid Data**
- Adjust `minDescriptionLength` in config
- Update `invalidTitleKeywords` filters
- Modify extraction selectors

## 🔍 Advanced Configuration

### **Custom Extraction Rules**
```json
{
  "extractionRules": {
    "additionalFields": {
      "sku": [".sku", ".product-id"],
      "brand": [".brand", ".manufacturer"],
      "rating": [".rating", ".stars"],
      "reviews": [".review-count", ".reviews"]
    }
  }
}
```

### **Advanced Filtering**
```json
{
  "filters": {
    "skipUrls": ["/sale", "/clearance"],
    "requiredUrlPatterns": ["/premium-products/"],
    "minDescriptionLength": 100,
    "invalidTitleKeywords": ["sold out", "discontinued"]
  }
}
```

## 🛟 Help & Support

### **Get Help**
```bash
# Original GNSS scraper help
npm run dev                      # Debug mode with visual

# Universal scraper help  
npm run scrape:help              # Show all options
```

### **Debug Mode**
```bash
# GNSS scraper debug
APP_DEBUG=1 npm run gnss:visual

# Universal scraper debug
APP_DEBUG=1 npm run scrape
```

### **Available Configurations**
```bash
tsx universal-scraper.ts --help
```

## 📁 Project Structure

```
├── index.ts                   # 🎯 Original GNSS scraper (preserved)
├── universal-scraper.ts       # 🌐 Universal scraper entry point
├── config-generator.ts        # 🔧 Custom config generator
├── config/
│   └── scraper-config.ts      # Configuration system and presets
├── core/
│   ├── universal-scraper.ts   # Main scraper orchestrator
│   └── stealth-behavior.ts    # Bot mitigation and human simulation
├── extractors/
│   ├── product-extractor.ts   # Product data extraction engine
│   └── product-discovery.ts   # Product link discovery
└── scraped_data/              # Output directory (auto-created)
    ├── gnss_products_*.json   # GNSS scraper output
    ├── gnss_products_*.txt     # GNSS detailed reports
    ├── *_products_*.json       # Universal scraper output
    └── *_report_*.txt          # Universal detailed reports
```

## ⚡ Performance Tips

1. **Start Small**: Begin with `MAX_PAGES=1` to test configuration
   ```bash
   MAX_PAGES=1 npm run gnss:visual     # Test GNSS
   MAX_PAGES=1 npm run scrape:visual   # Test Universal
   ```

2. **Use Stealth Sparingly**: Only when necessary to avoid detection
   ```bash
   npm run gnss:stealth:visual         # GNSS with stealth
   npm run scrape:stealth:visual       # Universal with stealth
   ```

3. **Visual Mode**: Use for testing and configuration tuning
4. **Custom Configs**: Create site-specific configs for best results
5. **Error Handling**: Monitor logs for failed extractions

## 🎯 Migration Guide

### **Existing Users (GNSS Scraper)**
✅ **Nothing changes!** Your original commands work exactly the same:

```bash
# Still works exactly as before
npm run start:stealth:visual

# Or use the new clear naming
npm run gnss:stealth:visual
```

### **New Features Available**
🆕 **Universal scraping capability** for any website:

```bash
# Scrape any e-commerce site
npm run scrape:stealth:visual

# Quick site testing
SITE_URL=https://store.com npm run scrape
```

## 🎉 Quick Examples

### **Continue Your GNSS Workflow:**
```bash
# Your usual GNSS scraping (enhanced with all features)
npm run gnss:stealth:visual

# Traditional command (still works)
npm run start:stealth:visual
```

### **Try Universal Scraping:**
```bash
# Test any website
SITE_URL=https://electronics-store.com npm run scrape:stealth:visual

# Shopify store
npm run scrape:shopify

# Create custom config
tsx config-generator.ts "My Store" "https://mystore.com"
```

---

**🚀 Ready to scrape?** 
- **GNSS Products**: `npm run gnss:stealth:visual`  
- **Any Website**: `npm run scrape:help`

Both systems include advanced bot mitigation, visual cursor tracking, and professional output! 🎯
