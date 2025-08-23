import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export class StripeService {
  static async getStripe() {
    return await stripePromise
  }

  static async createPaymentIntent(amount, orderData = {}) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          orderData, // Pass order information for metadata
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const { clientSecret } = await response.json()
      return clientSecret
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  static async confirmCardPayment(clientSecret, paymentMethod) {
    try {
      const stripe = await this.getStripe()
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      })

      if (error) {
        throw error
      }

      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw error
    }
  }

  static async createPaymentMethod(cardElement) {
    try {
      const stripe = await this.getStripe()
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw error
      }

      return paymentMethod
    } catch (error) {
      console.error('Error creating payment method:', error)
      throw error
    }
  }
}

// Mock Stripe service for development/testing
export class MockStripeService {
  static async processPayment(amount, cardDetails) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate random success/failure for testing
    const isSuccess = Math.random() > 0.1 // 90% success rate
    
    if (!isSuccess) {
      throw new Error('Payment failed - insufficient funds')
    }
    
    return {
      id: `pi_mock_${Date.now()}`,
      status: 'succeeded',
      amount: Math.round(amount * 100),
      payment_method: {
        id: `pm_mock_${Date.now()}`,
        card: {
          last4: cardDetails.last4 || '1234',
          brand: cardDetails.brand || 'visa'
        }
      }
    }
  }
} 