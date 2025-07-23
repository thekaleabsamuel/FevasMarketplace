// API endpoint for managing orders
// This will replace localStorage with a proper backend database

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      // Get all orders
      console.log('📋 Fetching all orders...')
      
      // For now, we'll use a simple approach with a JSON file
      // Later we'll integrate with Supabase or another database
      const orders = await getOrders()
      
      res.status(200).json({ orders })
    } 
    else if (req.method === 'POST') {
      // Create new order
      const order = req.body
      console.log('📝 Creating new order:', order.id)
      
      const result = await createOrder(order)
      
      res.status(201).json({ 
        success: true, 
        message: 'Order created successfully',
        order: result 
      })
    }
    else if (req.method === 'PUT') {
      // Update order
      const { id } = req.query
      const updates = req.body
      console.log('✏️ Updating order:', id)
      
      const result = await updateOrder(id, updates)
      
      res.status(200).json({ 
        success: true, 
        message: 'Order updated successfully',
        order: result 
      })
    }
    else if (req.method === 'DELETE') {
      // Delete order
      const { id } = req.query
      console.log('🗑️ Deleting order:', id)
      
      await deleteOrder(id)
      
      res.status(200).json({ 
        success: true, 
        message: 'Order deleted successfully' 
      })
    }
    else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    res.status(500).json({ error: 'Internal server error: ' + error.message })
  }
}

// Temporary storage functions (will be replaced with database)
let ordersStorage = []

async function getOrders() {
  // For now, return from memory
  // Later this will query the database
  return ordersStorage
}

async function createOrder(order) {
  // Add order to storage
  ordersStorage.push(order)
  console.log('✅ Order stored. Total orders:', ordersStorage.length)
  return order
}

async function updateOrder(id, updates) {
  const index = ordersStorage.findIndex(order => order.id === id)
  if (index === -1) {
    throw new Error('Order not found')
  }
  
  ordersStorage[index] = { ...ordersStorage[index], ...updates }
  return ordersStorage[index]
}

async function deleteOrder(id) {
  const index = ordersStorage.findIndex(order => order.id === id)
  if (index === -1) {
    throw new Error('Order not found')
  }
  
  ordersStorage.splice(index, 1)
} 