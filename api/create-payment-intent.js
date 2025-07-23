// This is a sample API endpoint for creating Stripe payment intents
// In a real deployment, this would be a serverless function or API route

import Stripe from 'stripe'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('=== PAYMENT INTENT REQUEST ===')
    console.log('Request body:', req.body)
    
    // Check environment variable and clean it
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
    console.log('Stripe key available:', !!stripeKey)
    console.log('Stripe key length:', stripeKey ? stripeKey.length : 0)
    console.log('Stripe key starts with:', stripeKey ? stripeKey.substring(0, 10) : 'N/A')
    
    if (!stripeKey) {
      return res.status(500).json({ error: 'Stripe secret key not configured' })
    }
    
    // Create Stripe instance with minimal configuration
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    })
    
    const { amount } = req.body

    if (!amount || amount < 50) {
      console.log('Invalid amount:', amount)
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is $0.50' })
    }

    console.log('Creating payment intent for amount:', amount)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('Payment intent created successfully:', paymentIntent.id)
    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      requestId: error.requestId,
    })
    res.status(500).json({ error: 'Failed to create payment intent: ' + error.message })
  }
} 