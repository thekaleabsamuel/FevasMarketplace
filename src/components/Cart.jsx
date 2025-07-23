import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { getCurrentPrice } from '../lib/pricing'
import Checkout from './Checkout'
import OrderConfirmation from './OrderConfirmation'

const Cart = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [isClosing, setIsClosing] = useState(false)

  // Safari-safe close handler
  const handleClose = () => {
    if (isClosing) return // Prevent double-closing
    setIsClosing(true)
    
    // Small delay to prevent Safari from getting confused
    setTimeout(() => {
      onClose()
    }, 50)
  }

  const handleCheckout = () => {
    try {
      setShowCheckout(true)
    } catch (error) {
      console.error('Error opening checkout:', error)
    }
  }

  const handleOrderComplete = (order) => {
    try {
      setCompletedOrder(order)
      setShowCheckout(false)
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  const handleCloseCheckout = () => {
    try {
      setShowCheckout(false)
    } catch (error) {
      console.error('Error closing checkout:', error)
    }
  }

  const handleCloseConfirmation = () => {
    try {
      setCompletedOrder(null)
      clearCart() // Clear cart when order confirmation is closed
      handleClose()
    } catch (error) {
      console.error('Error closing confirmation:', error)
    }
  }

  const getItemPrice = (item) => {
    // Use the pricing functions to get the correct price based on selected option and color
    return getCurrentPrice(item.product, item.selectedOption, item.selectedColor)
  }

  const getItemTotal = (item) => {
    return getItemPrice(item) * item.quantity
  }

  if (cartItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-800/30">
          <div className="flex justify-between items-center p-6 border-b border-amber-800/30">
            <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-amber-400 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-300 mb-6">Add some products to get started!</p>
            <button
              onClick={handleClose}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show checkout modal
  if (showCheckout) {
    return (
      <Checkout 
        onClose={handleCloseCheckout}
        onOrderComplete={handleOrderComplete}
      />
    )
  }

  // Show order confirmation modal
  if (completedOrder) {
    return (
      <OrderConfirmation 
        order={completedOrder}
        onClose={handleCloseConfirmation}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-amber-800/30">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-amber-800/30">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white pr-2">Shopping Cart ({getTotalItems()} items)</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-amber-400 text-xl sm:text-2xl font-bold flex-shrink-0"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {cartItems.map((item, index) => {
              try {
                if (!item || !item.product) {
                  console.warn('Invalid cart item at index:', index)
                  return null
                }
                
                const itemPrice = getItemPrice(item)
                const itemTotal = getItemTotal(item)
              
                return (
                  <div key={index} className="border border-amber-800/30 rounded-lg bg-gray-700/50 overflow-hidden">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="p-3">
                        {/* Product Image and Title Row */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-16 h-16 flex-shrink-0">
                            <img
                              src={item.product.images && item.product.images[0] 
                                ? item.product.images[0].url || item.product.images[0].asset?.url
                                : 'https://via.placeholder.com/80x80?text=No+Image'
                              }
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2">{item.product.title}</h3>
                            <p className="text-xs text-gray-300">${itemPrice.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Color/Option Tags */}
                        {(item.selectedColor || item.selectedOption) && (
                          <div className="flex gap-2 mb-3">
                            {item.selectedColor && (
                              <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-1 rounded">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedOption && (
                              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                                {item.selectedOption}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Quantity and Price Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center hover:bg-gray-600 bg-gray-700 text-white"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold text-white text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center hover:bg-gray-600 bg-gray-700 text-white"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-semibold text-amber-400 text-lg">${itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.product.images && item.product.images[0] 
                            ? item.product.images[0].url || item.product.images[0].asset?.url
                            : 'https://via.placeholder.com/80x80?text=No+Image'
                          }
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-base">{item.product.title}</h3>
                        <p className="text-sm text-gray-300">${itemPrice.toFixed(2)}</p>
                        {(item.selectedColor || item.selectedOption) && (
                          <div className="flex gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-1 rounded">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedOption && (
                              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                                {item.selectedOption}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center hover:bg-gray-600 bg-gray-700 text-white"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-600 flex items-center justify-center hover:bg-gray-600 bg-gray-700 text-white"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right min-w-0">
                        <p className="font-semibold text-amber-400">${itemTotal.toFixed(2)}</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              } catch (error) {
                console.error('Error rendering cart item at index:', index, error)
                return null
              }
            })}
          </div>
          
          {/* Cart Summary */}
          <div className="border-t border-amber-800/30 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-white">Subtotal:</span>
              <span className="text-2xl font-bold text-amber-400">${getTotalPrice().toFixed(2)}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="flex-1 py-3 px-6 border border-amber-800/30 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart 