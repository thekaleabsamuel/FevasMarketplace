// Shippo API key
const SHIPPO_API_KEY = import.meta.env.VITE_SHIPPO_API_KEY || 'shippo_test_6c68c9fe347ba9df7dcd069ffd496c74d8c8eb2c'

// Safe environment variable access
const getShippoApiKey = () => {
  try {
    return import.meta.env.VITE_SHIPPO_API_KEY || 'shippo_test_6c68c9fe347ba9df7dcd069ffd496c74d8c8eb2c'
  } catch (error) {
    console.warn('Error accessing Shippo API key:', error)
    return 'shippo_test_6c68c9fe347ba9df7dcd069ffd496c74d8c8eb2c'
  }
}

// Simple Shippo API client using fetch
const shippoApi = {
  async request(endpoint, data = null) {
    const url = `https://api.goshippo.com${endpoint}`
    const apiKey = getShippoApiKey()
    const headers = {
      'Authorization': `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json'
    }
    
    const options = {
      method: data ? 'POST' : 'GET',
      headers,
      ...(data && { body: JSON.stringify(data) })
    }
    
    const response = await fetch(url, options)
    return response.json()
  }
}

export class ShippoService {
  // Get shipping rates for a shipment
  static async getShippingRates(fromAddress, toAddress, parcels) {
    try {
      // Calculate total weight for freight determination
      const totalWeight = parcels.reduce((sum, parcel) => sum + parseFloat(parcel.weight), 0)
      
      // For very heavy orders (>70 lbs), use freight rates instead of standard shipping
      if (totalWeight > 70) {
        console.log('Heavy order detected, using freight shipping rates')
        return getFallbackShippingRates(totalWeight)
      }

      const shipment = {
        address_from: fromAddress,
        address_to: toAddress,
        parcels: parcels,
        async: false
      }

      console.log('Creating shipment with:', shipment) // Debug log
      
      const response = await shippoApi.request('/shipments/', shipment)
      console.log('Shippo response:', response) // Debug log
      
      if (response.status === 'SUCCESS' && response.rates && response.rates.length > 0) {
        console.log('Shippo rates:', response.rates) // Debug log
        return response.rates.map(rate => {
          console.log('Processing rate:', rate) // Debug log
          const price = parseFloat(rate.rate) || parseFloat(rate.amount) || 0
          console.log('Parsed price:', price) // Debug log
          return {
            id: rate.object_id,
            service: rate.servicelevel?.name || rate.service || 'Standard',
            provider: rate.provider || 'Unknown',
            price: price,
            days: rate.estimated_days || '3-5',
            provider_image: rate.provider_image_75,
            service_token: rate.servicelevel?.token,
            provider_token: rate.provider
          }
        })
      } else {
        console.error('Shippo error or no rates:', response.messages || 'No rates returned')
        return getFallbackShippingRates(totalWeight)
      }
    } catch (error) {
      console.error('Error getting shipping rates:', error)
      console.error('Error details:', error.message, error.stack) // More detailed error
      const totalWeight = parcels.reduce((sum, parcel) => sum + parseFloat(parcel.weight), 0)
      return getFallbackShippingRates(totalWeight)
    }
  }

    // Create a shipping label
  static async createShippingLabel(rateId, labelFileType = 'PDF') {
    try {
      const transaction = await shippoApi.request('/transactions/', {
        rate: rateId,
        label_file_type: labelFileType,
        async: false
      })

      if (transaction.status === 'SUCCESS') {
        return {
          label_url: transaction.label_url,
          tracking_number: transaction.tracking_number,
          tracking_url: transaction.tracking_url_provider,
          eta: transaction.eta,
          label_file_type: labelFileType,
          transaction_id: transaction.object_id
        }
      } else {
        console.error('Shippo transaction error:', transaction.messages)
        throw new Error('Failed to create shipping label')
      }
    } catch (error) {
      console.error('Error creating shipping label:', error)
      throw error
    }
  }

  // Track a shipment
  static async trackShipment(trackingNumber, carrier) {
    // Shippo integration temporarily disabled
    return { status: 'mock_tracking' }
  }

  // Validate an address
  static async validateAddress(address) {
    try {
      const response = await shippoApi.request('/addresses/validate/', address)
      return response
    } catch (error) {
      console.error('Error validating address:', error)
      return { validation_results: { is_valid: true } }
    }
  }

  // Get carrier accounts (for negotiated rates)
  static async getCarrierAccounts() {
    // Shippo integration temporarily disabled
    return []
  }

  // Create a return label
  static async createReturnLabel(originalTransactionId) {
    // Shippo integration temporarily disabled
    return {
      label_url: null,
      tracking_number: `RET${Date.now()}`,
      tracking_url: null
    }
  }
}

// Helper functions for address formatting
export const formatAddressForShippo = (address) => {
  return {
    name: `${address.firstName} ${address.lastName}`,
    street1: address.address,
    city: address.city,
    state: address.state,
    zip: address.zipCode,
    country: address.country || 'US',
    phone: address.phone,
    email: address.email
  }
}

// Helper function to create parcel objects from cart items
export const createParcelsFromItems = (items) => {
  // Calculate total weight in grams from actual product weights
  const totalWeightGrams = items.reduce((sum, cartItem) => {
    // Get the product from the cart item
    const product = cartItem.product || cartItem
    
    // Get weight from the product - check both product weight and size-specific weight
    let itemWeight = 0
    
    if (cartItem.selectedOption && product.sizeOptions && Array.isArray(product.sizeOptions)) {
      // If option is selected, use option-specific weight
      const sizeOption = product.sizeOptions.find(option => option.size === cartItem.selectedOption)
      if (sizeOption && sizeOption.weight) {
        itemWeight = sizeOption.weight
      }
    } else if (product.weight) {
      // Use product weight if no option-specific weight
      itemWeight = product.weight
    } else {
      // Fallback to 500g (about 1.1 lbs) if no weight specified
      itemWeight = 500
    }
    
    return sum + (cartItem.quantity * itemWeight)
  }, 0)
  
  // Convert grams to pounds for Shippo API
  const totalWeightLbs = totalWeightGrams / 453.592 // 1 lb = 453.592 grams
  
  // Ensure minimum weight of 0.1 lbs
  const finalWeight = Math.max(totalWeightLbs, 0.1)
  
  console.log('Shipping calculation:', {
    items: items.map(cartItem => {
      const product = cartItem.product || cartItem
      return {
        title: product.title,
        quantity: cartItem.quantity,
        weight: product.weight,
        selectedOption: cartItem.selectedOption,
        sizeWeight: cartItem.selectedOption && product.sizeOptions && Array.isArray(product.sizeOptions) ? 
          product.sizeOptions.find(opt => opt.size === cartItem.selectedOption)?.weight : null
      }
    }),
    totalWeightGrams,
    totalWeightLbs: finalWeight
  })
  
  // For very heavy orders (>70 lbs), we'll need to split into multiple parcels
  // or use freight shipping
  if (finalWeight > 70) {
    console.log('Heavy order detected, using freight shipping approach')
    // For freight orders, we'll return a single large parcel
    // but the actual shipping will be handled differently
    return [{
      length: '48',
      width: '48', 
      height: '48',
      distance_unit: 'in',
      weight: finalWeight.toFixed(2),
      mass_unit: 'lb'
    }]
  }
  
  return [{
    length: '12',
    width: '12', 
    height: '12',
    distance_unit: 'in',
    weight: finalWeight.toFixed(2),
    mass_unit: 'lb'
  }]
}

// Default warehouse address (you should update this with your actual warehouse)
export const getWarehouseAddress = () => {
  return {
    name: 'Fevas Warehouse',
    street1: '123 Commerce St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'US',
    phone: '+1-555-123-4567',
    email: 'Fevasasamn@gmail.com'
  }
}

// Shipping rate tiers for fallback (when Shippo is unavailable)
export const getFallbackShippingRates = (totalWeight = 0) => {
  // For heavy orders (>70 lbs), only show freight options
  if (totalWeight > 70) {
    console.log(`Heavy order (${totalWeight} lbs) - showing freight options only`)
    return [
      {
        id: 'freight_ltl',
        service: 'Freight Shipping (LTL)',
        provider: 'Freight Carrier',
        price: Math.max(150, totalWeight * 1.5), // Base $150 + $1.50/lb
        days: '5-10 business days',
        provider_image: null
      },
      {
        id: 'freight_pallet',
        service: 'Pallet Shipping',
        provider: 'Freight Carrier',
        price: Math.max(300, totalWeight * 2.0), // Base $300 + $2.00/lb
        days: '7-14 business days',
        provider_image: null
      }
    ]
  }

  // For medium orders (20-70 lbs), show realistic standard shipping
  if (totalWeight > 20) {
    console.log(`Medium order (${totalWeight} lbs) - showing realistic standard shipping`)
    return [
      {
        id: 'standard',
        service: 'Standard Shipping',
        provider: 'USPS',
        price: Math.max(8.99, totalWeight * 0.8), // Base $8.99 + $0.80/lb
        days: '3-5 business days',
        provider_image: null
      },
      {
        id: 'priority',
        service: 'Priority Shipping',
        provider: 'USPS',
        price: Math.max(12.99, totalWeight * 1.2), // Base $12.99 + $1.20/lb
        days: '2-3 business days',
        provider_image: null
      },
      {
        id: 'express',
        service: 'Express Shipping',
        provider: 'USPS',
        price: Math.max(18.99, totalWeight * 1.8), // Base $18.99 + $1.80/lb
        days: '1-2 business days',
        provider_image: null
      }
    ]
  }

  // For small orders (<20 lbs), show standard rates
  return [
    {
      id: 'standard',
      service: 'Standard Shipping',
      provider: 'USPS',
      price: 4.99,
      days: '3-5 business days',
      provider_image: null
    },
    {
      id: 'priority',
      service: 'Priority Shipping',
      provider: 'USPS',
      price: 9.99,
      days: '2-3 business days',
      provider_image: null
    },
    {
      id: 'express',
      service: 'Express Shipping',
      provider: 'USPS',
      price: 15.99,
      days: '1-2 business days',
      provider_image: null
    }
  ]
} 