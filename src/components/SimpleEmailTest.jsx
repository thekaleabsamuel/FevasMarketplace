import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

const SimpleEmailTest = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectly = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('🧪 Testing EmailJS directly...')
      
      // Initialize EmailJS
      const userId = '6YO2Gqezvy5o5-IlL'
      emailjs.init(userId)
      
      // Test data matching your template
      const testData = {
        to_email: 'test@example.com',
        order_id: 'TEST-123',
        customer_name: 'Test Customer',
        order_total: '$99.99',
        order_date: new Date().toLocaleDateString()
      }
      
      console.log('Test data:', testData)
      
      // Try to send email with your exact configuration
      const result = await emailjs.send(
        'service_tk8ieoz',
        'template_s1pvkof',
        testData,
        userId
      )
      
      console.log('Success!', result)
      setResult(`✅ SUCCESS: ${JSON.stringify(result, null, 2)}`)
      
    } catch (error) {
      console.error('Error details:', error)
      setResult(`❌ ERROR: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Direct EmailJS Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          This test uses your exact EmailJS configuration directly:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li><strong>Service ID:</strong> service_tk8ieoz</li>
          <li><strong>Template ID:</strong> template_s1pvkof</li>
          <li><strong>User ID:</strong> 6YO2Gqezvy5o5-IlL</li>
        </ul>
      </div>
      
      <button
        onClick={testDirectly}
        disabled={loading}
        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Testing Direct EmailJS...' : 'Test Direct EmailJS'}
      </button>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

export default SimpleEmailTest

