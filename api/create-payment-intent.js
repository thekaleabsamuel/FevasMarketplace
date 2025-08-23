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
    
    const { amount, orderData = {} } = req.body

    if (!amount || amount < 50) {
      console.log('Invalid amount:', amount)
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is $0.50' })
    }

    console.log('Creating payment intent for amount:', amount)
    console.log('Order data:', orderData)

    // Prepare metadata for Stripe (limited to 50 keys, 500 chars per value)
    const metadata = {}
    
    if (orderData.orderId) metadata.order_id = String(orderData.orderId).substring(0, 500)
    if (orderData.customer?.email) metadata.customer_email = String(orderData.customer.email).substring(0, 500)
    if (orderData.customer?.phone) metadata.customer_phone = String(orderData.customer.phone).substring(0, 500)
    if (orderData.customer?.firstName && orderData.customer?.lastName) {
      metadata.customer_name = `${orderData.customer.firstName} ${orderData.customer.lastName}`.substring(0, 500)
    }
    if (orderData.totals?.subtotal) metadata.subtotal = String(orderData.totals.subtotal)
    if (orderData.totals?.shipping) metadata.shipping = String(orderData.totals.shipping)
    if (orderData.totals?.tax) metadata.tax = String(orderData.totals.tax)
    if (orderData.items?.length) metadata.item_count = String(orderData.items.length)
    if (orderData.notes) metadata.notes = String(orderData.notes).substring(0, 500)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: orderData.orderId ? `Order ${orderData.orderId}` : `Fevas Order - $${(amount/100).toFixed(2)}`,
      receipt_email: orderData.customer?.email || null, // Send receipt to customer automatically
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