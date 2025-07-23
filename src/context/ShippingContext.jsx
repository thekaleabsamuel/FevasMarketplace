import React, { createContext, useContext, useState, useCallback } from 'react'
import { ShippoService, formatAddressForShippo, createParcelsFromItems, getWarehouseAddress, getFallbackShippingRates } from '../services/shippo'

const ShippingContext = createContext()

export const useShipping = () => {
  const context = useContext(ShippingContext)
  if (!context) {
    console.error('useShipping must be used within a ShippingProvider')
    // Return a fallback context instead of throwing to prevent crashes
    return {
      shippingRates: [],
      selectedRate: null,
      setSelectedRate: () => {},
      loading: false,
      error: null,
      shippingAddress: null,
      setShippingAddress: () => {},
      calculateShippingRates: async () => {},
      validateAddress: async () => ({ validation_results: { is_valid: true } }),
      createShippingLabel: async () => ({}),
      clearShipping: () => {}
    }
  }
  return context
}

export const ShippingProvider = ({ children }) => {
  const [shippingRates, setShippingRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shippingAddress, setShippingAddress] = useState(null)

  // Debug logging removed to prevent infinite re-renders

  // Calculate shipping rates for a given address and cart items
  const calculateShippingRates = useCallback(async (address, cartItems) => {
    if (!address || !cartItems || cartItems.length === 0) {
      console.log('No address or cart items, clearing shipping rates')
      setShippingRates([])
      setSelectedRate(null)
      return
    }

    console.log('Calculating shipping rates for:', { address, cartItems })
    setLoading(true)
    setError(null)

    try {
      const fromAddress = getWarehouseAddress()
      const toAddress = formatAddressForShippo(address)
      const parcels = createParcelsFromItems(cartItems)

      console.log('Formatted addresses:', { fromAddress, toAddress, parcels })

      // Calculate total weight for fallback rates
      const totalWeight = parcels.reduce((sum, parcel) => sum + parseFloat(parcel.weight), 0)
      console.log('Total weight for shipping:', totalWeight)

      const rates = await ShippoService.getShippingRates(fromAddress, toAddress, parcels)
      console.log('Received shipping rates:', rates)
      
      // If no rates returned from API, use fallback rates
      if (!rates || rates.length === 0) {
        console.log('No rates from API, using fallback rates')
        const fallbackRates = getFallbackShippingRates(totalWeight)
        console.log('Fallback rates:', fallbackRates)
        setShippingRates(fallbackRates)
        
        if (fallbackRates.length > 0) {
          const cheapestRate = fallbackRates.reduce((min, rate) => 
            rate.price < min.price ? rate : min
          )
          console.log('Auto-selecting cheapest fallback rate:', cheapestRate)
          setSelectedRate(cheapestRate)
        }
      } else {
        setShippingRates(rates)
        
        // Auto-select the cheapest rate
        if (rates.length > 0) {
          const cheapestRate = rates.reduce((min, rate) => 
            rate.price < min.price ? rate : min
          )
          console.log('Auto-selecting cheapest rate:', cheapestRate)
          setSelectedRate(cheapestRate)
        }
      }
    } catch (err) {
      console.error('Shipping rate calculation error:', err)
      setError('Failed to calculate shipping rates. Please try again.')
      
      // Calculate total weight for fallback rates
      const parcels = createParcelsFromItems(cartItems)
      const totalWeight = parcels.reduce((sum, parcel) => sum + parseFloat(parcel.weight), 0)
      
      // Fallback to default rates
      const fallbackRates = getFallbackShippingRates(totalWeight)
      console.log('Using fallback rates due to error:', fallbackRates)
      setShippingRates(fallbackRates)
      
      if (fallbackRates.length > 0) {
        setSelectedRate(fallbackRates[0])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Validate shipping address
  const validateAddress = useCallback(async (address) => {
    try {
      const formattedAddress = formatAddressForShippo(address)
      const validation = await ShippoService.validateAddress(formattedAddress)
      return validation
    } catch (err) {
      console.error('Address validation error:', err)
      return { validation_results: { is_valid: true } }
    }
  }, [])

  // Create shipping label
  const createShippingLabel = useCallback(async (rateId, labelFileType = 'PDF') => {
    try {
      const label = await ShippoService.createShippingLabel(rateId, labelFileType)
      return label
    } catch (err) {
      console.error('Label creation error:', err)
      throw err
    }
  }, [])

  // Clear shipping data
  const clearShipping = useCallback(() => {
    setShippingRates([])
    setSelectedRate(null)
    setError(null)
    setShippingAddress(null)
  }, [])

  const value = {
    shippingRates,
    selectedRate,
    setSelectedRate,
    loading,
    error,
    shippingAddress,
    setShippingAddress,
    calculateShippingRates,
    validateAddress,
    createShippingLabel,
    clearShipping
  }

  // Debug logging removed to prevent infinite re-renders

  return (
    <ShippingContext.Provider value={value}>
      {children}
    </ShippingContext.Provider>
  )
} 