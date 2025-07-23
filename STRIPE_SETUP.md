# Stripe Payment Integration Setup

Your Fevas e-commerce platform now includes Stripe payment integration! This guide will help you set up secure payment processing.

## 🚀 Current Status

✅ **Stripe Integration Complete**
- Secure payment form with Stripe Elements
- Test mode enabled for development
- Mock payment service for testing
- Real Stripe integration ready for production

## 🧪 Testing Without Real Money

### Test Card Numbers
Use these Stripe test cards to simulate different scenarios:

- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

### Test Details
- **Expiry Date**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## 🔧 Setup for Production

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and click "Start now"
2. Complete account setup and verification
3. Get your API keys from the Stripe Dashboard

### Step 2: Environment Configuration
Create a `.env.local` file in your project root:

```env
# Stripe Configuration (Replace with your actual keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### Step 3: API Endpoint Setup
For production, you'll need to set up the payment intent API endpoint:

**Option A: Vercel Serverless Function**
Create `api/create-payment-intent.js` in your project:

```javascript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })
    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}
```

**Option B: Express.js Backend**
```javascript
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})
```

## 🎯 Features

### ✅ What's Working
- **Secure Payment Form**: Stripe Elements for PCI compliance
- **Test Mode**: Safe testing with mock payments
- **Error Handling**: User-friendly error messages
- **Order Processing**: Complete order creation after payment
- **Shipping Integration**: Automatic shipping label creation
- **Admin Panel**: Order management with payment status

### 🔄 Payment Flow
1. Customer fills shipping information
2. Enters payment details securely via Stripe
3. Payment is processed and confirmed
4. Order is created with "paid" status
5. Shipping label is generated
6. Customer receives confirmation

## 💰 Stripe Fees

**Standard Stripe Fees:**
- **US Cards**: 2.9% + 30¢ per successful charge
- **International Cards**: 3.9% + 30¢ per successful charge
- **No monthly fees** or setup costs

## 🛡️ Security Features

- **PCI Compliance**: Stripe handles sensitive card data
- **Tokenization**: Card details are never stored on your server
- **Fraud Protection**: Stripe Radar built-in protection
- **3D Secure**: Automatic authentication for high-risk transactions

## 🚀 Deployment Checklist

- [ ] Create Stripe account
- [ ] Get API keys from Stripe Dashboard
- [ ] Set environment variables
- [ ] Deploy API endpoint
- [ ] Test with Stripe test cards
- [ ] Switch to live mode when ready

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: Available in Stripe Dashboard
- **Test Mode**: Use test cards for development

## 🔄 Switching to Live Mode

When ready for real payments:

1. **Update Environment Variables**:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
   STRIPE_SECRET_KEY=sk_live_your_live_key_here
   ```

2. **Set Up Webhooks** (Optional):
   In Stripe Dashboard → Webhooks:
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Test with Real Cards**:
   - Use small amounts first
   - Verify payment confirmations
   - Check order processing

Your e-commerce site is now ready for secure payment processing! 🎉 