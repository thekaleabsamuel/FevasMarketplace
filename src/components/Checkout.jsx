import React, { useState, useEffect, useCallback } from 'react'
import { useCart } from '../context/CartContext'
import { useShipping } from '../context/ShippingContext'
import { TaxService } from '../services/tax'
import EmailService from '../services/email'
import OrdersService from '../services/orders'
import StripeCheckout from './StripeCheckout'

const Checkout = ({ onClose, onOrderComplete }) => {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const { 
    shippingRates, 
    selectedRate, 
    setSelectedRate, 
    loading: loadingRates, 
    error: shippingError,
    calculateShippingRates,
    createShippingLabel
  } = useShipping()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Order Summary
    shippingMethod: '',
    notes: ''
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [taxCalculation, setTaxCalculation] = useState(null)
  const [showFallbackRates, setShowFallbackRates] = useState(false)


  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Fetch shipping rates when address is complete
  const fetchShippingRates = useCallback(async () => {
    if (!formData.firstName || !formData.lastName || !formData.address || 
        !formData.city || !formData.state || !formData.zipCode || !cartItems || cartItems.length === 0) {
      return
    }

    const address = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email
    }

    console.log('Fetching shipping rates for address:', address)
    console.log('Cart items:', cartItems)
    
    try {
      await calculateShippingRates(address, cartItems)
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
    }
  }, [formData.firstName, formData.lastName, formData.address, formData.city, formData.state, formData.zipCode, formData.country, formData.phone, formData.email, cartItems, calculateShippingRates])

  // Fetch rates when address fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShippingRates()
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [fetchShippingRates])

  // Calculate tax when address or items change
  const calculateTax = useCallback(() => {
    if (formData.state && formData.city && cartItems && cartItems.length > 0) {
      const address = {
        state: formData.state,
        city: formData.city,
        country: formData.country,
        taxExempt: formData.taxExempt
      }
      const subtotal = getTotalPrice()
      const calculation = TaxService.calculateTax(address, subtotal, cartItems)
      setTaxCalculation(calculation)
    } else {
      setTaxCalculation(null)
    }
  }, [formData.state, formData.city, formData.country, formData.taxExempt, cartItems, getTotalPrice])

  useEffect(() => {
    calculateTax()
  }, [calculateTax])

  // Set showFallbackRates to true only when we have a valid address but no API rates
  useEffect(() => {
    const hasValidAddress = formData.address && formData.city && formData.state && formData.zipCode
    const hasNoApiRates = shippingRates.length === 0 && !loadingRates
    
    if (hasValidAddress && hasNoApiRates) {
      setShowFallbackRates(true)
    } else {
      setShowFallbackRates(false)
    }
  }, [formData.address, formData.city, formData.state, formData.zipCode, shippingRates.length, loadingRates])

  // Auto-select first fallback rate if no API rates are available
  useEffect(() => {
    if (showFallbackRates && !selectedRate && !loadingRates && formData.address && formData.city && formData.state && formData.zipCode && cartItems && cartItems.length > 0) {
      // Calculate weight-based fallback rate
      const totalWeightGrams = cartItems.reduce((sum, cartItem) => {
        const product = cartItem.product || cartItem
        let itemWeight = 0
        if (cartItem.selectedOption && product.sizeOptions && Array.isArray(product.sizeOptions)) {
          // If option is selected, use option-specific weight
          const sizeOption = product.sizeOptions.find(option => option.size === cartItem.selectedOption)
          if (sizeOption && sizeOption.weight) {
            itemWeight = sizeOption.weight
          }
        } else if (product.weight) {
          itemWeight = product.weight
        } else {
          itemWeight = 500 // fallback
        }
        return sum + (cartItem.quantity * itemWeight)
      }, 0)
      
      const totalWeightLbs = totalWeightGrams / 453.592
      
      let fallbackRate
      if (totalWeightLbs > 70) {
        fallbackRate = {
          id: 'freight_ltl',
          service: 'Freight Shipping (LTL)',
          provider: 'Freight Carrier',
          price: Math.max(150, totalWeightLbs * 1.5),
          days: '5-10 business days'
        }
      } else if (totalWeightLbs > 20) {
        fallbackRate = {
          id: 'standard',
          service: 'Standard Shipping',
          provider: 'USPS',
          price: Math.max(8.99, totalWeightLbs * 0.8),
          days: '3-5 business days'
        }
      } else {
        fallbackRate = {
          id: 'standard',
          service: 'Standard Shipping',
          provider: 'USPS',
          price: 4.99,
          days: '3-5 business days'
        }
      }
      
      setSelectedRate(fallbackRate)
      updateFormData('shippingMethod', fallbackRate.id)
    }
  }, [showFallbackRates, selectedRate, loadingRates, updateFormData, cartItems, formData.address, formData.city, formData.state, formData.zipCode])

  const getShippingCost = () => {
    if (selectedRate) {
      return selectedRate.price
    }
    // Fallback to default rates
    switch (formData.shippingMethod) {
      case 'express':
        return 15.99
      case 'priority':
        return 9.99
      default:
        return 4.99
    }
  }

  const getSubtotal = () => getTotalPrice()
  const getShipping = () => getShippingCost()
  const getTax = () => taxCalculation?.taxAmount || 0
  const getTotal = () => getSubtotal() + getShipping() + getTax()

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Create real shipping label using Shippo
      let shippingLabel = null
      if (selectedRate) {
        try {
          shippingLabel = await createShippingLabel(selectedRate.id)
        } catch (error) {
          console.error('Error creating shipping label:', error)
          // Continue without label if there's an error
        }
      }
      
      // Create order object
      const order = {
        id: `ORD-${Date.now()}`,
        items: cartItems,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        payment: {
          method: 'stripe',
          paymentIntentId: paymentResult.id,
          last4: paymentResult.payment_method?.card?.last4 || '****',
          brand: paymentResult.payment_method?.card?.brand || 'card'
        },
        shipping: {
          method: selectedRate?.service || formData.shippingMethod,
          provider: selectedRate?.provider || 'USPS',
          cost: getShipping(),
          originalCost: getShippingCost(),
          rateId: selectedRate?.id,
          trackingNumber: shippingLabel?.tracking_number,
          trackingUrl: shippingLabel?.tracking_url,
          labelUrl: shippingLabel?.label_url,
          eta: shippingLabel?.eta || selectedRate?.arrives_by
        },

        totals: {
          subtotal: getSubtotal(),
          shipping: getShipping(),
          tax: getTax(),
          total: getTotal()
        },
        notes: formData.notes,
        date: new Date().toISOString(),
        status: 'paid'
      }

      console.log('=== ORDER CREATED ===')
      console.log('Order object:', order)
      console.log('Order JSON string length:', JSON.stringify(order).length)
      console.log('Cart items count:', cartItems.length)
      console.log('First cart item:', cartItems[0])

      // Save order to API backend
      try {
        console.log('💾 Saving order to backend...')
        await OrdersService.createOrder(order)
        console.log('✅ Order saved to backend successfully')
      } catch (saveError) {
        console.error('❌ Error saving order to backend:', saveError)
        // Fallback to localStorage if API fails
        try {
          const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
          existingOrders.push(order)
          localStorage.setItem('orders', JSON.stringify(existingOrders))
          console.log('✅ Order saved to localStorage as fallback')
        } catch (localError) {
          console.error('❌ Error saving to localStorage:', localError)
        }
      }

      // Send email confirmation
      try {
        console.log('📧 Sending order confirmation email...')
        await EmailService.sendOrderConfirmation(order, formData.email)
        console.log('✅ Email confirmation sent successfully')
      } catch (emailError) {
        console.error('❌ Error sending email confirmation:', emailError)
        // Don't fail the order if email fails
      }

      // Show success - don't clear cart yet, let order confirmation handle it
      setIsProcessing(false)
      onOrderComplete(order)
    } catch (error) {
      console.error('Error processing order:', error)
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (errorMessage) => {
    console.error('Payment error:', errorMessage)
    setIsProcessing(false)
  }

  const handleSubmitOrder = async () => {
    // This will now be handled by the Stripe component
    // The payment form will trigger handlePaymentSuccess when payment is successful
  }




  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderShippingForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <select
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          >
            <option value="">Select State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
      </div>

      {/* Tax Exemption */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            id="taxExempt"
            checked={formData.taxExempt || false}
            onChange={(e) => updateFormData('taxExempt', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="taxExempt" className="text-sm font-medium text-gray-700">
            I have a tax exemption certificate
          </label>
        </div>
        {formData.taxExempt && (
          <div className="ml-6 text-xs text-gray-600">
            Please provide your tax exemption certificate number in the order notes section.
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Method</label>
        {/* Debug information */}
        <div className="text-xs text-gray-500 mb-2">
          Debug: Loading={loadingRates}, Rates={shippingRates.length}, Selected={selectedRate?.id || 'none'}, 
          ShowFallback={showFallbackRates}, HasAddress={!!(formData.address && formData.city && formData.state && formData.zipCode)}
        </div>
        {loadingRates ? (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading shipping rates...</span>
          </div>
        ) : (shippingRates.length > 0) ? (
          <div className="space-y-2">
            {shippingRates.map(rate => (
              <label key={rate.id} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={rate.id}
                  checked={selectedRate?.id === rate.id}
                  onChange={() => {
                    setSelectedRate(rate)
                    updateFormData('shippingMethod', rate.id)
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{rate.service}</span>
                      <span className="text-xs text-gray-500 ml-2">via {rate.provider}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${rate.price.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {rate.days ? `${rate.days} business days` : 'Delivery time varies'}
                    {rate.arrives_by && ` • Arrives by ${new Date(rate.arrives_by).toLocaleDateString()}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (showFallbackRates && formData.address && formData.city && formData.state && formData.zipCode && cartItems && cartItems.length > 0) ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 mb-2">
              Available shipping options:
            </div>
            {(() => {
              // Calculate total weight for shipping rates
              const totalWeightGrams = cartItems.reduce((sum, cartItem) => {
                const product = cartItem.product || cartItem
                let itemWeight = 0
                if (cartItem.selectedOption && product.sizeOptions && Array.isArray(product.sizeOptions)) {
                  // If option is selected, use option-specific weight
                  const sizeOption = product.sizeOptions.find(option => option.size === cartItem.selectedOption)
                  if (sizeOption && sizeOption.weight) {
                    itemWeight = sizeOption.weight
                  }
                } else if (product.weight) {
                  itemWeight = product.weight
                } else {
                  itemWeight = 500 // fallback
                }
                return sum + (cartItem.quantity * itemWeight)
              }, 0)
              
              const totalWeightLbs = totalWeightGrams / 453.592
              
              // Get appropriate shipping rates based on weight
              let fallbackRates = []
              
              if (totalWeightLbs > 70) {
                // Heavy orders - freight only
                fallbackRates = [
                  {
                    id: 'freight_ltl',
                    service: 'Freight Shipping (LTL)',
                    provider: 'Freight Carrier',
                    price: Math.max(150, totalWeightLbs * 1.5),
                    days: '5-10 business days'
                  },
                  {
                    id: 'freight_pallet',
                    service: 'Pallet Shipping',
                    provider: 'Freight Carrier',
                    price: Math.max(300, totalWeightLbs * 2.0),
                    days: '7-14 business days'
                  }
                ]
              } else if (totalWeightLbs > 20) {
                // Medium orders - realistic standard shipping
                fallbackRates = [
                  {
                    id: 'standard',
                    service: 'Standard Shipping',
                    provider: 'USPS',
                    price: Math.max(8.99, totalWeightLbs * 0.8),
                    days: '3-5 business days'
                  },
                  {
                    id: 'priority',
                    service: 'Priority Shipping',
                    provider: 'USPS',
                    price: Math.max(12.99, totalWeightLbs * 1.2),
                    days: '2-3 business days'
                  },
                  {
                    id: 'express',
                    service: 'Express Shipping',
                    provider: 'USPS',
                    price: Math.max(18.99, totalWeightLbs * 1.8),
                    days: '1-2 business days'
                  }
                ]
              } else {
                // Small orders - standard rates
                fallbackRates = [
                  {
                    id: 'standard',
                    service: 'Standard Shipping',
                    provider: 'USPS',
                    price: 4.99,
                    days: '3-5 business days'
                  },
                  {
                    id: 'priority',
                    service: 'Priority Shipping',
                    provider: 'USPS',
                    price: 9.99,
                    days: '2-3 business days'
                  },
                  {
                    id: 'express',
                    service: 'Express Shipping',
                    provider: 'USPS',
                    price: 15.99,
                    days: '1-2 business days'
                  }
                ]
              }
              
              return fallbackRates
            })().map(rate => (
              <label key={rate.id} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={rate.id}
                  checked={selectedRate?.id === rate.id}
                  onChange={() => {
                    setSelectedRate(rate)
                    updateFormData('shippingMethod', rate.id)
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{rate.service}</span>
                      <span className="text-xs text-gray-500 ml-2">via {rate.provider}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${rate.price.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {rate.days}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Enter your shipping address to see available rates
          </div>
        )}
      </div>
    </div>
  )

  const renderPaymentForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
      
      <StripeCheckout
        amount={getTotal()}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Any special instructions or notes..."
        />
      </div>
    </div>
  )

  const renderOrderReview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Review</h3>
      
      {/* Order Items */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Items</h4>
        {cartItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={item.images?.[0]?.url || 'https://via.placeholder.com/40x40?text=No+Image'}
                alt={item.title}
                className="w-10 h-10 object-cover rounded"
              />
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Shipping Information */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p>{formData.firstName} {formData.lastName}</p>
          <p>{formData.address}</p>
          <p>{formData.city}, {formData.state} {formData.zipCode}</p>
          <p>{formData.email}</p>
          {formData.phone && <p>{formData.phone}</p>}
        </div>
      </div>



      {/* Order Summary */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${getSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${getShipping().toFixed(2)}</span>
          </div>
          
          {/* Tax Breakdown */}
          {taxCalculation && (
            <>
              {taxCalculation.exemptions.isExempt ? (
                <div className="flex justify-between text-green-600">
                  <span>Tax (Exempt):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
              ) : (
                <>
                  {TaxService.formatTaxBreakdown(taxCalculation).map((tax, index) => (
                    <div key={index} className="flex justify-between text-gray-600">
                      <span>{tax.label} ({(tax.rate * 100).toFixed(2)}%):</span>
                      <span>${tax.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Total Tax:</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                </>
              )}
              
              {/* Tax Exemption Notice */}
              {taxCalculation.exemptions.isExempt && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                  <strong>Tax Exempt:</strong> 
                  {taxCalculation.exemptions.reasons.hasExemptionCertificate && ' Tax exemption certificate provided.'}
                  {taxCalculation.exemptions.reasons.isWholesaleOrder && ' Wholesale/resale order.'}
                  {taxCalculation.exemptions.reasons.isBulkOrder && ' Bulk order (10+ items).'}
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderShippingForm()
      case 2:
        return renderPaymentForm()
      case 3:
        return renderOrderReview()
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.address && formData.city && formData.state && formData.zipCode
      case 2:
        return false // Disable Continue button on payment step - payment handles the flow
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Checkout
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {renderStepIndicator()}
          
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStep === 2 ? 'Payment Required' : 'Continue'}
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={!canProceed() || isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout 