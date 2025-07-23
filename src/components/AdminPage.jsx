import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShipping } from '../context/ShippingContext'
import { useAdmin } from '../context/AdminContext'
import OrdersService from '../services/orders'
import AdminLogin from './AdminLogin'

const AdminPage = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const { createShippingLabel } = useShipping()
  const { isAuthenticated, logout } = useAdmin()
  const navigate = useNavigate()

  // No redirect - just show login form if not authenticated

  // Load orders from API backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('=== ADMIN PAGE: Loading orders from API ===')
        setLoading(true)
        
        // Try to load from API first
        try {
          const apiOrders = await OrdersService.getAllOrders()
          console.log('✅ Orders loaded from API:', apiOrders)
          
          if (apiOrders && apiOrders.length > 0) {
            // Transform the orders to match the admin display format
            const formattedOrders = apiOrders.map((order, index) => {
              try {
                // Validate order structure
                if (!order || typeof order !== 'object') {
                  console.warn(`Invalid order at index ${index}:`, order)
                  return null
                }
                
                // Validate customer data
                if (!order.customer || typeof order.customer !== 'object') {
                  console.warn(`Invalid customer data in order ${index}:`, order.customer)
                  return null
                }
                
                // Validate totals data
                if (!order.totals || typeof order.totals !== 'object') {
                  console.warn(`Invalid totals data in order ${index}:`, order.totals)
                  return null
                }
                
                // Safe property access with fallbacks
                const firstName = order.customer.firstName || 'Unknown'
                const lastName = order.customer.lastName || 'Customer'
                const email = order.customer.email || 'No email'
                const total = order.totals.total || 0
                const date = order.date ? new Date(order.date).toLocaleDateString() : 'Unknown date'
                
                return {
                  ...order,
                  customer: `${firstName} ${lastName}`,
                  email: email,
                  total: total,
                  date: date,
                  shippingAddress: {
                    name: `${firstName} ${lastName}`,
                    address: order.customer.address || 'No address',
                    city: order.customer.city || 'No city',
                    state: order.customer.state || 'No state',
                    zip: order.customer.zipCode || 'No zip',
                    country: order.customer.country || 'US'
                  }
                }
              } catch (error) {
                console.error(`Error processing order at index ${index}:`, error, order)
                return null
              }
            }).filter(Boolean) // Remove null entries
            
            console.log('Formatted orders from API:', formattedOrders)
            setOrders(formattedOrders)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.warn('⚠️ API failed, falling back to localStorage:', apiError)
        }
        
        // Fallback to localStorage if API fails or no orders
        console.log('🔄 Falling back to localStorage...')
        const savedOrders = localStorage.getItem('orders')
        
        if (savedOrders) {
          console.log('Attempting to parse localStorage orders...')
          const parsedOrders = JSON.parse(savedOrders)
          console.log('Successfully parsed localStorage orders:', parsedOrders)
          
          // Transform localStorage orders
          const formattedOrders = parsedOrders.map((order, index) => {
            try {
              if (!order || typeof order !== 'object') return null
              if (!order.customer || typeof order.customer !== 'object') return null
              if (!order.totals || typeof order.totals !== 'object') return null
              
              const firstName = order.customer.firstName || 'Unknown'
              const lastName = order.customer.lastName || 'Customer'
              const email = order.customer.email || 'No email'
              const total = order.totals.total || 0
              const date = order.date ? new Date(order.date).toLocaleDateString() : 'Unknown date'
              
              return {
                ...order,
                customer: `${firstName} ${lastName}`,
                email: email,
                total: total,
                date: date,
                shippingAddress: {
                  name: `${firstName} ${lastName}`,
                  address: order.customer.address || 'No address',
                  city: order.customer.city || 'No city',
                  state: order.customer.state || 'No state',
                  zip: order.customer.zipCode || 'No zip',
                  country: order.customer.country || 'US'
                }
              }
            } catch (error) {
              console.error(`Error processing localStorage order at index ${index}:`, error, order)
              return null
            }
          }).filter(Boolean)
          
          console.log('Formatted localStorage orders:', formattedOrders)
          setOrders(formattedOrders)
        } else {
          console.log('No orders found in localStorage either')
          setOrders([])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading orders:', error)
        setOrders([])
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleCreateLabel = async (order) => {
    setLoading(true)
    try {
      const label = await createShippingLabel(order.shippingAddress)
      console.log('Shipping label created:', label)
      alert('Shipping label created successfully!')
    } catch (error) {
      console.error('Error creating shipping label:', error)
      alert('Error creating shipping label')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <AdminLogin isModal={false} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Fevas Admin Panel</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Admin Access
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
              >
                Back to Store
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Orders Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
              <p className="text-gray-600 mt-1">Manage customer orders and create shipping labels</p>
              {/* Enhanced Debug Info for Mobile */}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>🔍 Current Domain:</strong> {window.location.hostname}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📱 Full URL:</strong> {window.location.href}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📊 localStorage Available:</strong> {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📦 localStorage Length:</strong> {typeof localStorage !== 'undefined' ? localStorage.length : 'N/A'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>🔑 All localStorage Keys:</strong> {typeof localStorage !== 'undefined' ? Object.keys(localStorage).join(', ') : 'N/A'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📋 Orders Key Exists:</strong> {typeof localStorage !== 'undefined' ? (localStorage.getItem('orders') ? 'Yes' : 'No') : 'N/A'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>🛒 Cart Key Exists:</strong> {typeof localStorage !== 'undefined' ? (localStorage.getItem('cartItems') ? 'Yes' : 'No') : 'N/A'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📱 User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📱 Is Mobile:</strong> {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>📋 Raw Orders Data:</strong> {typeof localStorage !== 'undefined' ? (localStorage.getItem('orders') ? localStorage.getItem('orders').substring(0, 100) + '...' : 'No data') : 'N/A'}
                </p>
                {window.location.hostname !== 'fevasmarketplace.com' && window.location.hostname !== 'www.fevasmarketplace.com' && (
                  <p className="text-amber-800 text-sm mt-1">
                    <strong>⚠️ Domain Notice:</strong> For best order management, access this admin panel from{' '}
                    <a href="https://fevasmarketplace.com/admin" className="text-blue-600 hover:text-blue-800 underline">
                      https://fevasmarketplace.com/admin
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Orders</span>
              </button>
              
              <button
                onClick={async () => {
                  try {
                    console.log('🔄 Starting migration from localStorage to API...')
                    await OrdersService.migrateFromLocalStorage()
                    alert('Migration completed! Refreshing...')
                    window.location.reload()
                  } catch (error) {
                    console.error('Migration failed:', error)
                    alert('Migration failed: ' + error.message)
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Migrate to API</span>
              </button>
              
              {window.location.hostname !== 'fevasmarketplace.com' && window.location.hostname !== 'www.fevasmarketplace.com' && (
                <button
                  onClick={() => window.open('https://fevasmarketplace.com/admin', '_blank')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open Main Domain</span>
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleCreateLabel(order)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Label'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                  <p><strong className="text-gray-900">Name:</strong> {selectedOrder.customer}</p>
                  <p><strong className="text-gray-900">Email:</strong> {selectedOrder.email}</p>
                  {selectedOrder.customer?.phone && (
                    <p><strong className="text-gray-900">Phone:</strong> {selectedOrder.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {selectedOrder.payment && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                    <p><strong className="text-gray-900">Method:</strong> {selectedOrder.payment.method}</p>
                    <p><strong className="text-gray-900">Card:</strong> **** **** **** {selectedOrder.payment.last4}</p>
                    <p><strong className="text-gray-900">Type:</strong> {selectedOrder.payment.brand}</p>
                    <p><strong className="text-gray-900">Status:</strong> <span className="text-green-600 font-medium">{selectedOrder.status}</span></p>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                  <p className="text-gray-900">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Shipping Information */}
              {selectedOrder.shipping && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                    <p><strong className="text-gray-900">Method:</strong> {selectedOrder.shipping.method}</p>
                    <p><strong className="text-gray-900">Provider:</strong> {selectedOrder.shipping.provider}</p>
                    <p><strong className="text-gray-900">Cost:</strong> ${selectedOrder.shipping.cost?.toFixed(2) || '0.00'}</p>
                    {selectedOrder.shipping.trackingNumber && (
                      <p><strong className="text-gray-900">Tracking:</strong> {selectedOrder.shipping.trackingNumber}</p>
                    )}
                    {selectedOrder.shipping.eta && (
                      <p><strong className="text-gray-900">ETA:</strong> {new Date(selectedOrder.shipping.eta).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, index) => {
                    try {
                      // Validate item structure
                      if (!item || typeof item !== 'object') {
                        console.warn(`Invalid item at index ${index}:`, item)
                        return null
                      }
                      
                      // Handle both old mock format and new real format
                      const itemName = item.name || item.product?.title || 'Unknown Product'
                      const itemQuantity = item.quantity || 1
                      const itemPrice = item.price || 0
                      const itemTotal = itemPrice * itemQuantity
                      
                      return (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{itemName}</p>
                            <p className="text-sm text-gray-600">Qty: {itemQuantity}</p>
                            {(item.selectedColor || item.selectedOption) && (
                              <div className="flex gap-2 mt-1">
                                {item.selectedColor && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedOption && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {item.selectedOption}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">${itemTotal.toFixed(2)}</p>
                        </div>
                      )
                    } catch (error) {
                      console.error(`Error rendering item at index ${index}:`, error, item)
                      return null
                    }
                  }).filter(Boolean) : (
                    <div className="text-gray-500 text-center py-4">No items found</div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${selectedOrder.totals?.subtotal?.toFixed(2) || selectedOrder.total.toFixed(2)}</span>
                    </div>
                    {selectedOrder.totals?.shipping && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="text-gray-900">${selectedOrder.totals.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.totals?.tax && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="text-gray-900">${selectedOrder.totals.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleCreateLabel(selectedOrder)}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Shipping Label...' : 'Create Shipping Label'}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage 