import React, { useState } from 'react'
import EmailService from '../services/email.js'

const EmailTest = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const testEmailJS = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log('🧪 Testing your template_s1pvkof...')
      
      const result = await EmailService.testYourTemplate()
      setResult(result)
      console.log('✅ EmailJS test successful:', result)
    } catch (err) {
      setError(err.message)
      console.error('❌ EmailJS test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const testOrderConfirmation = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      // Mock order data for testing
      const mockOrder = {
        id: 'TEST-123',
        customer: {
          firstName: 'John',
          lastName: 'Doe'
        },
        totals: {
          total: 99.99
        },
        date: new Date()
      }

      console.log('🧪 Testing order confirmation email...')
      
      const result = await EmailService.sendOrderConfirmation(mockOrder, 'test@example.com')
      setResult(result)
      console.log('✅ Order confirmation test successful:', result)
    } catch (err) {
      setError(err.message)
      console.error('❌ Order confirmation test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🧪 EmailJS Test Tool</h2>
      
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Current Configuration:</h3>
          <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
            <p><strong>Service ID:</strong> {import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tk8ieoz'}</p>
            <p><strong>Template ID:</strong> {import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_s1pvkof'}</p>
            <p><strong>User ID:</strong> {import.meta.env.VITE_EMAILJS_USER_ID || '6YO2Gqezvy5o5-IlL'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={testEmailJS}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Your Template (template_s1pvkof)'}
          </button>
          
          <button
            onClick={testOrderConfirmation}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Order Confirmation'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Success!</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          <h3 className="font-semibold mb-2">❌ Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p><strong>Note:</strong> Make sure your environment variables are set in Vercel:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><code>VITE_EMAILJS_SERVICE_ID=service_tk8ieoz</code></li>
          <li><code>VITE_EMAILJS_TEMPLATE_ID=template_s1pvkof</code></li>
          <li><code>VITE_EMAILJS_USER_ID=6YO2Gqezvy5o5-IlL</code></li>
        </ul>
      </div>
    </div>
  )
}

export default EmailTest
