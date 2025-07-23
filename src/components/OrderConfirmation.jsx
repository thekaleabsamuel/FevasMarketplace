import React, { useEffect } from 'react'
import { getCurrentPrice } from '../lib/pricing'

// Function to generate and download receipt
const generateReceipt = (order) => {
  const receiptContent = `
FEVAS - ORDER RECEIPT
=====================================

Order Information:
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status}

Customer Information:
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}
Email: ${order.customer.email}
${order.customer.phone ? `Phone: ${order.customer.phone}` : ''}

Items Ordered:
${order.items.map((item, index) => {
  const itemPrice = getCurrentPrice(item.product, item.selectedOption, item.selectedColor)
  const itemTotal = itemPrice * item.quantity
  return `${index + 1}. ${item.product.title}
   Quantity: ${item.quantity}
   ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
   ${item.selectedOption ? `Option: ${item.selectedOption}` : ''}
   Price: $${itemPrice.toFixed(2)}
   Total: $${itemTotal.toFixed(2)}
`
}).join('\n')}

Order Summary:
Subtotal: $${order.totals.subtotal.toFixed(2)}
Shipping (${order.shipping.method}): $${order.totals.shipping.toFixed(2)}
Tax: $${order.totals.tax.toFixed(2)}
=====================================
TOTAL: $${order.totals.total.toFixed(2)}

Payment Information:
Method: ${order.payment.method}
Last 4 digits: ${order.payment.last4}
Card type: ${order.payment.brand}

Shipping Information:
Method: ${order.shipping.method}
Provider: ${order.shipping.provider}
${order.shipping.trackingNumber ? `Tracking Number: ${order.shipping.trackingNumber}` : ''}
${order.shipping.eta ? `Estimated Delivery: ${new Date(order.shipping.eta).toLocaleDateString()}` : ''}

${order.notes ? `Order Notes: ${order.notes}` : ''}

Thank you for your purchase!
For support, contact us at Fevasasamn@gmail.com
  `.trim()

  // Create blob and download
  const blob = new Blob([receiptContent], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${order.id}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const OrderConfirmation = ({ order, onClose }) => {
  // Save order to localStorage for admin panel
  useEffect(() => {
    // Use setTimeout to ensure this runs after any potential re-renders
    const saveOrder = () => {
      try {
        console.log('=== SAVING ORDER TO LOCALSTORAGE ===')
        console.log('Current domain when saving:', window.location.origin)
        console.log('Current URL when saving:', window.location.href)
        console.log('Current hostname:', window.location.hostname)
        console.log('Current port:', window.location.port)
        console.log('Order to save:', order)
        
        // Get existing orders
        const existingOrders = localStorage.getItem('orders')
        console.log('Existing orders from localStorage:', existingOrders)
        
        let savedOrders = []
        if (existingOrders) {
          try {
            savedOrders = JSON.parse(existingOrders)
            console.log('Parsed existing orders:', savedOrders)
          } catch (parseError) {
            console.error('Error parsing existing orders:', parseError)
            savedOrders = []
          }
        }
        
        // Ensure savedOrders is an array
        if (!Array.isArray(savedOrders)) {
          console.warn('savedOrders is not an array, resetting to empty array:', savedOrders)
          savedOrders = []
        }
        
        // Add new order
        savedOrders.push(order)
        console.log('Updated orders array:', savedOrders)
        
        // Save back to localStorage
        const ordersJson = JSON.stringify(savedOrders)
        console.log('Saving orders JSON to localStorage:', ordersJson)
        
        localStorage.setItem('orders', ordersJson)
        
        // Verify the save worked
        const verifyOrders = localStorage.getItem('orders')
        console.log('Verification - orders in localStorage after save:', verifyOrders)
        
      } catch (error) {
        console.error('Error saving order to localStorage:', error)
        console.error('Order that failed to save:', order)
      }
    }
    
    // Run the save function with a small delay to avoid re-render issues
    setTimeout(saveOrder, 100)
  }, [order])
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Order Confirmed!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank you for your purchase! 🎉</h3>
            <p className="text-lg text-gray-600 mb-4">Your order has been successfully placed and is being processed.</p>
            
            {/* Email Confirmation Message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-green-800 font-medium">📧 Order confirmation email sent!</p>
                  <p className="text-green-700 text-sm">A detailed receipt has been sent to <strong>{order.customer.email}</strong></p>
                  <p className="text-green-700 text-sm">We've also CC'd our team at <strong>Fevasasamn@gmail.com</strong></p>
                </div>
              </div>
            </div>
            
            {/* Order Number Display */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-lg">
              <div className="text-sm font-medium mb-1">Order Number</div>
              <div className="text-2xl font-bold tracking-wider">{order.id}</div>
              <div className="text-sm opacity-90 mt-1">Keep this number for tracking your order</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {/* Shipping Status */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg">Your Product is on the Way! 🚚</h4>
              </div>
              <p className="text-blue-100">We're preparing your order for shipment. You'll receive tracking information once it ships.</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Order Information</h4>
              <div className="space-y-1 text-sm text-gray-800">
                <p><span className="font-medium text-blue-900">Order ID:</span> <span className="text-gray-900">{order.id}</span></p>
                <p><span className="font-medium text-blue-900">Date:</span> <span className="text-gray-900">{new Date(order.date).toLocaleDateString()}</span></p>
                <p><span className="font-medium text-blue-900">Total:</span> <span className="text-gray-900">${order.totals.total.toFixed(2)}</span></p>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">
                <p className="text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
                <p className="text-gray-900">{order.customer.address}</p>
                <p className="text-gray-900">{order.customer.city}, {order.customer.state} {order.customer.zipCode}</p>
                <p className="text-gray-900">{order.customer.email}</p>
                {order.customer.phone && <p className="text-gray-900">{order.customer.phone}</p>}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Items Ordered</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => {
                  const itemPrice = getCurrentPrice(item.product, item.selectedOption, item.selectedColor)
                  const itemTotal = itemPrice * item.quantity
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.images?.[0]?.url || item.product.images?.[0]?.asset?.url || 'https://via.placeholder.com/40x40?text=No+Image'}
                          alt={item.product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{item.product.title}</p>
                          <p className="text-xs text-gray-700">Qty: {item.quantity}</p>
                          {(item.selectedColor || item.selectedOption) && (
                            <div className="flex gap-1 mt-1">
                              {item.selectedColor && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                  {item.selectedColor}
                                </span>
                              )}
                              {item.selectedOption && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                  {item.selectedOption}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">${itemTotal.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping.trackingNumber && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Shipping & Tracking</h4>
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Tracking Number:</span>
                    <span className="font-mono">{order.shipping.trackingNumber}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Carrier:</span>
                    <span>{order.shipping.provider}</span>
                  </div>
                  {order.shipping.eta && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estimated Delivery:</span>
                      <span>{new Date(order.shipping.eta).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.shipping.trackingUrl && (
                    <a
                      href={order.shipping.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Track Package →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">${order.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping ({order.shipping.method}):</span>
                  <span className="text-gray-900">${order.totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax:</span>
                  <span className="text-gray-900">${order.totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">${order.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
              <h4 className="font-bold text-lg mb-3">What's Next? 📦</h4>
              <ul className="text-green-100 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>You'll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>We'll notify you when your order ships with tracking info</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>Track your order using the order ID: <span className="font-bold">{order.id}</span></span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>Contact us if you have any questions about your order</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => generateReceipt(order)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation 