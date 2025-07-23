import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { StripeService, MockStripeService } from '../services/stripe'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

// Payment form component
const PaymentForm = ({ amount, onSuccess, onError, isProcessing, setIsProcessing }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsProcessing(true)
    setError('')

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.')
      setIsProcessing(false)
      return
    }

    try {
      const cardElement = elements.getElement(CardElement)
      
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (paymentMethodError) {
        setError(paymentMethodError.message)
        setIsProcessing(false)
        return
      }

      // Create payment intent via API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      })

      if (confirmError) {
        setError(confirmError.message)
        setIsProcessing(false)
        return
      }

      onSuccess(paymentIntent)
    } catch (error) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  )
}

// Main Stripe checkout component
const StripeCheckout = ({ amount, onSuccess, onError, isProcessing, setIsProcessing }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  )
}

export default StripeCheckout 