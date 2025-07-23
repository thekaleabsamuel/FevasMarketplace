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
    const stripeKey = process.env.STRIPE_SECRET_KEY
    console.log('Testing with key:', stripeKey ? stripeKey.substring(0, 20) + '...' : 'NOT FOUND')
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
      timeout: 10000,
    })

    console.log('Stripe instance created, attempting payment intent...')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
    })

    console.log('Payment intent created successfully:', paymentIntent.id)
    res.status(200).json({ 
      success: true, 
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret 
    })
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      requestId: error.requestId
    })
    res.status(500).json({ 
      error: 'Payment intent creation failed',
      details: error.message,
      type: error.type,
      code: error.code
    })
  }
} 