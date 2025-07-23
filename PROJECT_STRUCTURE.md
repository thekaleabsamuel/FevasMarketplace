# Fevas Ecommerce Project Structure

## Overview
This is a React-based ecommerce website that integrates:
- **Sanity CMS** for content management
- **Snipcart** for shopping cart functionality
- **Shippo** for shipping (to be implemented)
- **Tailwind CSS** for styling

## Directory Structure

```
src/
├── components/
│   └── Product.jsx          # Reusable product card component
├── schemas/
│   ├── product.js           # Sanity product schema
│   ├── category.js          # Sanity category schema
│   └── sanity-schema.js     # Main Sanity schema configuration
├── assets/                  # Static assets
├── App.jsx                  # Main application component
├── App.css                  # App-specific styles
├── index.css               # Global styles with Tailwind directives
└── main.jsx                # Application entry point
```

## Key Features

### Product Schema (`src/schemas/product.js`)
- **Title**: Product name (required)
- **Slug**: URL-friendly identifier (required)
- **Description**: Product details
- **Price**: Current price (required)
- **Compare at Price**: Original price for sales
- **Images**: Array of product images with hotspot support
- **Category**: Reference to category
- **Tags**: Array of tags for filtering
- **In Stock**: Boolean for inventory status
- **SKU**: Stock keeping unit
- **Weight**: Product weight in grams
- **Dimensions**: Length, width, height in cm

### Product Component (`src/components/Product.jsx`)
- Displays product information in a card format
- Shows discount badges when compareAtPrice > price
- Out of stock indicators
- Snipcart integration for "Add to Cart" functionality
- Responsive design with Tailwind CSS

### App Component (`src/App.jsx`)
- Fetches products from Sanity CMS
- Displays loading and error states
- Responsive grid layout
- Snipcart checkout integration

## Setup Requirements

### 1. Sanity Configuration
- Replace `<your-project-id>` in `App.jsx` with your actual Sanity project ID
- Configure your Sanity studio with the schemas in `src/schemas/`

### 2. Snipcart Configuration
- Replace `YOUR_PUBLIC_API_KEY` in `App.jsx` with your Snipcart public API key
- Configure Snipcart settings in your Snipcart dashboard

### 3. Environment Variables
Consider creating a `.env` file for:
```
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
VITE_SNIPCART_API_KEY=your-snipcart-key
```

## Next Steps for Shippo Integration
1. Install Shippo SDK: `npm install shippo`
2. Create shipping calculation components
3. Integrate with Snipcart for shipping rates
4. Add address validation

## Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
``` 