import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

const EmailDiagnostic = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testEmailJSConfig = async () => {
    setLoading(true)
    clearResults()
    
    addResult('🔍 Starting EmailJS diagnostic...', 'info')
    
    try {
      // Test 1: Check environment variables
      addResult('📋 Checking environment variables...', 'info')
      const envVars = {
        VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        VITE_EMAILJS_USER_ID: import.meta.env.VITE_EMAILJS_USER_ID
      }
      
      addResult(`Environment Variables: ${JSON.stringify(envVars, null, 2)}`, 'info')
      
      // Test 2: Check if EmailJS can be initialized
      addResult('🔧 Checking EmailJS initialization...', 'info')
      try {
        const testUserId = import.meta.env.VITE_EMAILJS_USER_ID || '6YO2Gqezvy5o5-IlL'
        emailjs.init(testUserId)
        addResult('✅ EmailJS initialized successfully', 'success')
      } catch (error) {
        addResult(`❌ EmailJS init failed: ${error.message}`, 'error')
      }
      
      // Test 3: Test with correct template data
      addResult('🧪 Testing with correct template data for template_s1pvkof...', 'info')
      const minimalData = {
        to_email: 'test@example.com',
        order_id: 'TEST-123',
        customer_name: 'Test User',
        order_total: '$99.99',
        order_date: new Date().toLocaleDateString()
      }
      
      addResult(`Test data: ${JSON.stringify(minimalData, null, 2)}`, 'info')
      
      // Test 4: Try different service configurations
      const testConfigs = [
        {
          name: 'Current Config',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_s1pvkof',
          userId: '6YO2Gqezvy5o5-IlL'
        },
        {
          name: 'Alternative Config 1',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_contact_form',
          userId: '6YO2Gqezvy5o5-IlL'
        },
        {
          name: 'Alternative Config 2',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_generic',
          userId: '6YO2Gqezvy5o5-IlL'
        },
        {
          name: 'Order Confirmation Template',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_order_confirmation',
          userId: '6YO2Gqezvy5o5-IlL'
        },
        {
          name: 'Basic Email Template',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_basic',
          userId: '6YO2Gqezvy5o5-IlL'
        },
        {
          name: 'Default Template',
          serviceId: 'service_tk8ieoz',
          templateId: 'template_default',
          userId: '6YO2Gqezvy5o5-IlL'
        }
      ]
      
      for (const config of testConfigs) {
        addResult(`🧪 Testing ${config.name}...`, 'info')
        try {
          const result = await emailjs.send(
            config.serviceId,
            config.templateId,
            minimalData,
            config.userId
          )
          addResult(`✅ ${config.name} SUCCESS: ${JSON.stringify(result, null, 2)}`, 'success')
          break // Found working config
        } catch (error) {
          addResult(`❌ ${config.name} FAILED: ${error.message}`, 'error')
        }
      }
      
      // Test 5: Check if it's a CORS or network issue
      addResult('🌐 Testing network connectivity...', 'info')
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: 'service_tk8ieoz',
            template_id: 'template_s1pvkof',
            user_id: '6YO2Gqezvy5o5-IlL',
            template_params: minimalData
          })
        })
        
        if (response.ok) {
          addResult('✅ Network connectivity to EmailJS API successful', 'success')
        } else {
          addResult(`❌ Network response: ${response.status} ${response.statusText}`, 'error')
        }
      } catch (error) {
        addResult(`❌ Network test failed: ${error.message}`, 'error')
      }
      
    } catch (error) {
      addResult(`❌ Diagnostic failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
      addResult('🏁 Diagnostic complete', 'info')
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 EmailJS Diagnostic Tool</h2>
      
      <div className="mb-6">
        <button
          onClick={testEmailJSConfig}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Diagnostic...' : 'Run EmailJS Diagnostic'}
        </button>
        
        <button
          onClick={clearResults}
          className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnostic Results:</h3>
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg text-sm font-mono ${
                result.type === 'success' ? 'bg-green-100 text-green-800' :
                result.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              <span className="text-xs text-gray-500">[{result.timestamp}]</span> {result.message}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current EmailJS Configuration:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Service ID:</strong> {import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tk8ieoz'}</p>
          <p><strong>Template ID:</strong> {import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_s1pvkof'}</p>
          <p><strong>User ID:</strong> {import.meta.env.VITE_EMAILJS_USER_ID || '6YO2Gqezvy5o5-IlL'}</p>
        </div>
      </div>
    </div>
  )
}

export default EmailDiagnostic
