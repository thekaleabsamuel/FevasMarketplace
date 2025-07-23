import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentPrice } from '../lib/pricing'

const CartContext = createContext()

// Safari-safe localStorage functions
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage.getItem failed:', error)
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('localStorage.setItem failed:', error)
    }
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = safeLocalStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Validate the parsed cart structure
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart)
        } else {
          console.warn('Invalid cart structure, resetting to empty')
          setCartItems([])
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        setCartItems([])
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes (with debouncing for Safari)
  useEffect(() => {
    if (!isInitialized) return // Don't save until initialized
    
    const timeoutId = setTimeout(() => {
      try {
        safeLocalStorage.setItem('cart', JSON.stringify(cartItems))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }, 100) // Small delay to prevent excessive writes

    return () => clearTimeout(timeoutId)
  }, [cartItems, isInitialized])

  const addToCart = (product, quantity = 1, selectedColor = null, selectedOption = null) => {
    // Validate inputs for Safari safety
    if (!product || !product._id) {
      console.error('Invalid product provided to addToCart')
      return
    }

    setCartItems(prevItems => {
      try {
        // Ensure prevItems is an array
        const currentItems = Array.isArray(prevItems) ? prevItems : []
        
        const existingItemIndex = currentItems.findIndex(item => 
          item && item.product && item.product._id === product._id && 
          item.selectedColor === selectedColor && 
          item.selectedOption === selectedOption
        )

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...currentItems]
          const existingItem = updatedItems[existingItemIndex]
          if (existingItem) {
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: (existingItem.quantity || 0) + quantity
            }
          }
          return updatedItems
        } else {
          // Add new item
          const newItem = {
            product,
            quantity: quantity || 1,
            selectedColor,
            selectedOption
          }
          return [...currentItems, newItem]
        }
      } catch (error) {
        console.error('Error in addToCart:', error)
        return prevItems // Return previous state if error occurs
      }
    })

    // Show toast notification with error handling
    try {
      const colorText = selectedColor ? ` (${selectedColor})` : ''
      const optionText = selectedOption ? ` (${selectedOption})` : ''
      const quantityText = quantity > 1 ? ` x${quantity}` : ''
      setToast({
        show: true,
        message: `${product.title}${colorText}${optionText}${quantityText} added to cart!`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error setting toast:', error)
    }
  }

  const removeFromCart = (index) => {
    setCartItems(prevItems => {
      try {
        const currentItems = Array.isArray(prevItems) ? prevItems : []
        if (index >= 0 && index < currentItems.length) {
          return currentItems.filter((_, i) => i !== index)
        }
        return currentItems
      } catch (error) {
        console.error('Error in removeFromCart:', error)
        return prevItems
      }
    })
  }

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return
    
    setCartItems(prevItems => {
      try {
        const currentItems = Array.isArray(prevItems) ? prevItems : []
        if (index >= 0 && index < currentItems.length) {
          return currentItems.map((item, i) => 
            i === index ? { ...item, quantity } : item
          )
        }
        return currentItems
      } catch (error) {
        console.error('Error in updateQuantity:', error)
        return prevItems
      }
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    try {
      return cartItems.reduce((total, item) => total + (item?.quantity || 0), 0)
    } catch (error) {
      console.error('Error in getTotalItems:', error)
      return 0
    }
  }

  const getTotalPrice = () => {
    try {
      return cartItems.reduce((total, item) => {
        if (!item || !item.product) return total
        const itemPrice = getCurrentPrice(item.product, item.selectedOption, item.selectedColor)
        return total + (itemPrice * (item.quantity || 0))
      }, 0)
    } catch (error) {
      console.error('Error in getTotalPrice:', error)
      return 0
    }
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    toast,
    setToast
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 