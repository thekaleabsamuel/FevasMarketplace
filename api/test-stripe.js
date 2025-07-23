export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    
    res.status(200).json({ 
      stripeKeyAvailable: !!stripeKey,
      stripeKeyLength: stripeKey ? stripeKey.length : 0,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 10) : 'N/A',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    })
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({ error: 'Test failed: ' + error.message })
  }
} 