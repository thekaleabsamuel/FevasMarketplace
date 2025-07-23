// Orders service for managing orders via API
class OrdersService {
  static async getAllOrders() {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.orders || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  static async createOrder(order) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  static async updateOrder(id, updates) {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  static async deleteOrder(id) {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  // Migration helper: move orders from localStorage to API
  static async migrateFromLocalStorage() {
    try {
      const localOrders = localStorage.getItem('orders')
      if (!localOrders) {
        console.log('No local orders to migrate')
        return
      }

      const orders = JSON.parse(localOrders)
      console.log(`Migrating ${orders.length} orders from localStorage...`)

      for (const order of orders) {
        try {
          await this.createOrder(order)
          console.log(`✅ Migrated order: ${order.id}`)
        } catch (error) {
          console.error(`❌ Failed to migrate order ${order.id}:`, error)
        }
      }

      console.log('Migration completed!')
    } catch (error) {
      console.error('Migration error:', error)
    }
  }
}

export default OrdersService 