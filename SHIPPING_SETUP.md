# Shipping Integration Setup Guide

## Overview
Your Fevas e-commerce platform now includes comprehensive shipping integration with Shippo, allowing for:
- Real-time shipping rate calculations
- Automatic shipping label generation
- Order management and tracking
- Wholesale pricing tiers

## Features Implemented

### 1. Wholesale Pricing Structure
- **Retail Price**: Single item pricing
- **Wholesale Tiers**: Bulk pricing with quantity breaks
- **Dynamic Pricing**: Prices update based on quantity selected
- **Savings Display**: Shows savings per unit for wholesale orders

### 2. Shipping Integration
- **Real-time Rates**: Calculates shipping costs based on customer location
- **Multiple Carriers**: USPS, UPS, FedEx, and other carriers via Shippo
- **Address Validation**: Validates shipping addresses automatically
- **Label Generation**: Creates shipping labels for your client

### 3. Admin Panel
- **Order Management**: View all customer orders
- **Shipping Labels**: Generate and download shipping labels
- **Tracking**: Track packages and provide tracking links to customers
- **Order Details**: Complete order information and customer details

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in your project root with:
```
VITE_SHIPPO_API_KEY=your_shippo_api_key_here
```

### 2. Warehouse Address Configuration
Update the warehouse address in `src/services/shippo.js`:
```javascript
export const getWarehouseAddress = () => {
  return {
    name: 'Your Company Name',
    street1: 'Your Warehouse Address',
    city: 'Your City',
    state: 'Your State',
    zip: 'Your ZIP Code',
    country: 'US',
    phone: 'Your Phone Number',
    email: 'your-email@company.com'
  }
}
```

### 3. Product Configuration in Sanity
1. Go to https://fevas.sanity.studio/
2. Edit any product to set up pricing tiers:
   - **Retail Price**: Price for single items
   - **Wholesale Tiers**: Add multiple tiers with:
     - Minimum quantity (e.g., 10)
     - Maximum quantity (optional, e.g., 49)
     - Price per unit at that tier
     - Tier name (e.g., "Small Wholesale")

### 4. Testing the Integration
1. Start your development server: `npm run dev`
2. Add products to cart with different quantities
3. Proceed to checkout and enter a shipping address
4. Select shipping method and complete order
5. Use the Admin panel to generate shipping labels

## How It Works

### For Customers:
1. **Browse Products**: See retail prices by default
2. **Quantity Selection**: As they increase quantity, wholesale pricing applies
3. **Shipping Calculation**: Real-time rates based on their address
4. **Checkout**: Complete order with accurate shipping costs
5. **Order Confirmation**: Receive tracking information

### For Your Client (Admin):
1. **Access Admin Panel**: Click "Admin" in the navigation
2. **View Orders**: See all customer orders with status
3. **Generate Labels**: Click "Create Shipping Label" for pending orders
4. **Download Labels**: Print and apply shipping labels
5. **Track Packages**: Monitor delivery status

## API Keys and Security

### Current Setup:
- **Shippo Test Key**: Currently using test API key
- **Production Ready**: Easy to switch to production key

### For Production:
1. Get a production Shippo API key
2. Update the environment variable
3. Test with real addresses and carriers

## Troubleshooting

### Common Issues:
1. **Shipping Rates Not Loading**: Check internet connection and API key
2. **Label Generation Fails**: Verify address is complete and valid
3. **Pricing Not Updating**: Ensure products have pricing tiers configured

### Support:
- Shippo Documentation: https://goshippo.com/docs/
- Sanity Documentation: https://www.sanity.io/docs

## Next Steps

### Recommended Enhancements:
1. **Payment Integration**: Add Stripe or PayPal
2. **Email Notifications**: Send order confirmations and tracking updates
3. **Inventory Management**: Track stock levels in Sanity
4. **Return Labels**: Generate return shipping labels
5. **Analytics**: Track sales and shipping metrics

### Production Deployment:
1. Set up production Shippo account
2. Configure production Sanity dataset
3. Set up proper domain and SSL
4. Implement proper payment processing
5. Add email service for notifications

## Files Modified/Created

### New Files:
- `src/context/ShippingContext.jsx` - Shipping state management
- `src/lib/pricing.js` - Pricing calculation utilities
- `src/components/AdminPanel.jsx` - Admin interface
- `SHIPPING_SETUP.md` - This setup guide

### Modified Files:
- `fevas/schemaTypes/product.js` - Added pricing structure
- `src/services/shippo.js` - Enabled real Shippo integration
- `src/components/Checkout.jsx` - Added shipping rate calculation
- `src/components/ProductDetail.jsx` - Added pricing tiers display
- `src/components/Product.jsx` - Updated pricing display
- `src/components/OrderConfirmation.jsx` - Added order saving
- `src/App.jsx` - Added admin panel and shipping context

Your shipping integration is now complete and ready for testing! 