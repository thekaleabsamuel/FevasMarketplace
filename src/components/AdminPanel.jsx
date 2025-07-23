import React, { useState, useEffect } from 'react'
import { useShipping } from '../context/ShippingContext'
import { useAdmin } from '../context/AdminContext'
import { client } from '../lib/sanity'

const AdminPanel = ({ onClose }) => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'products'
  const { createShippingLabel } = useShipping()
  const { logout } = useAdmin()

  // Mock orders data - in a real app, this would come from your backend
  useEffect(() => {
    // Load orders from localStorage or your backend
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    setOrders(savedOrders)
  }, [])

  // Fetch products from Sanity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = `*[_type == "product"]{
          _id,
          title,
          description,
          pricing,
          "images": images[]{
            "url": asset->url
          },
          category,
          inStock,
          unitsAvailable,
          sku,
          slug,
          weight,
          dimensions,
          sizeOptions
        }`
        const productsResult = await client.fetch(productsQuery)
        setProducts(productsResult || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await client.delete(productId)
      // Remove from local state
      setProducts(products.filter(p => p._id !== productId))
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLabel = async (order) => {
    if (!order.shipping.rateId) {
      alert('No shipping rate selected for this order')
      return
    }

    setLoading(true)
    try {
      const label = await createShippingLabel(order.shipping.rateId)
      
      // Update order with label information
      const updatedOrder = {
        ...order,
        shipping: {
          ...order.shipping,
          trackingNumber: label.tracking_number,
          trackingUrl: label.tracking_url,
          labelUrl: label.label_url,
          labelCreated: new Date().toISOString()
        }
      }

      // Update orders list
      const updatedOrders = orders.map(o => 
        o.id === order.id ? updatedOrder : o
      )
      setOrders(updatedOrders)
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      
      alert('Shipping label created successfully!')
    } catch (error) {
      console.error('Error creating label:', error)
      alert('Failed to create shipping label. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadLabel = (order) => {
    if (order.shipping.labelUrl) {
      window.open(order.shipping.labelUrl, '_blank')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrentPrice = (product) => {
    if (product.pricing?.retailPrice) {
      return product.pricing.retailPrice
    }
    return product.price || 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                logout()
                onClose()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Logout
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Product Management
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'orders' ? (
            // Orders Tab
            <div className="flex h-full">
              {/* Orders List */}
              <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders found</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.id}</h4>
                            <p className="text-sm text-gray-600">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${order.totals.total.toFixed(2)}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.shipping.trackingNumber
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.shipping.trackingNumber ? 'Shipped' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedOrder ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Information</h4>
                        <p className="text-gray-600">
                          {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                        </p>
                        <p className="text-gray-600">{selectedOrder.customer.email}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Shipping Address</h4>
                        <p className="text-gray-600">{selectedOrder.shipping.address}</p>
                        <p className="text-gray-600">
                          {selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zip}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">Order Items</h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span>${selectedOrder.totals.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {!selectedOrder.shipping.trackingNumber ? (
                          <button
                            onClick={() => handleCreateLabel(selectedOrder)}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading ? 'Creating Shipping Label...' : 'Create Shipping Label'}
                          </button>
                        ) : (
                          <button
                            onClick={() => downloadLabel(selectedOrder)}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Download Label
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select an order to view details
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Products Tab
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
                <button
                  onClick={() => window.open('https://fevas.sanity.studio/', '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Open Sanity Studio
                </button>
              </div>
              
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h4>
                          <p className="text-sm text-gray-600">${getCurrentPrice(product)}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded ml-3"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 