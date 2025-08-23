import emailjs from '@emailjs/browser'

// EmailJS will be initialized when needed with proper configuration

// Email service for sending order confirmations and receipts
class EmailService {
  static async sendOrderConfirmation(order, customerEmail) {
    try {
      // Try original order confirmation format first (what was working before)
      const orderConfirmationData = {
        to_email: customerEmail,
        order_id: order.id,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        order_total: `$${order.totals.total.toFixed(2)}`,
        order_date: new Date(order.date).toLocaleDateString()
      }

      console.log('📧 Preparing email data (order confirmation format):', orderConfirmationData)

      // Try original template first
      try {
        const customerResult = await this.sendEmail(orderConfirmationData, 'template_s1pvkof')
        console.log('✅ Original template worked!')
        
        // Send business notification
        await this.sendBusinessNotification(order)
        return customerResult
      } catch (originalError) {
        console.log('❌ Original template failed, trying contact form format...')
        
        // Fallback to contact form format
        const contactFormData = {
          to_name: `${order.customer.firstName} ${order.customer.lastName}`,
          to_email: customerEmail,
          from_name: 'Fevas Team',
          message: `Order Confirmation - ${order.id}

Thank you for your order!

Order Details:
- Order ID: ${order.id}
- Customer: ${order.customer.firstName} ${order.customer.lastName}
- Date: ${new Date(order.date).toLocaleDateString()}
- Total: $${order.totals.total.toFixed(2)}

Your order has been received and is being processed.

Contact us: Fevasasamn@gmail.com`
        }

        const customerResult = await this.sendEmail(contactFormData, 'template_contact_form')
        
        // Send business notification
        await this.sendBusinessNotification(order)
        return customerResult
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error)
      throw error
    }
  }

  static async sendBusinessNotification(order) {
    try {
      console.log('📧 Sending business notification email...')
      
      // Create business notification using the same template
      const businessEmailData = {
        to_email: 'Fevasasamn@gmail.com',
        order_id: order.id,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        order_total: `$${order.totals.total.toFixed(2)}`,
        order_date: new Date(order.date).toLocaleDateString()
      }

      console.log('📧 Business notification data:', businessEmailData)
      
      // Send business notification
      return await this.sendEmail(businessEmailData)
    } catch (error) {
      console.error('Error sending business notification:', error)
      // Don't fail the order if business notification fails
    }
  }

  static generateOrderEmailHTML(order) {
    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-id { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .total { font-size: 18px; font-weight: bold; background: #f59e0b; color: white; padding: 15px; border-radius: 8px; text-align: right; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .contact { background: #e5e7eb; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You for Your Order!</h1>
            <p>Your order has been successfully placed and is being processed.</p>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> <span class="order-id">${order.id}</span></p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${order.customer}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
              ${order.shippingAddress.country}
            </p>
            
            <h3>Order Items</h3>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.title}</strong><br>
                Quantity: ${item.quantity}<br>
                Price: ${formatCurrency(item.price)}<br>
                ${item.selectedOption ? `Option: ${item.selectedOption}<br>` : ''}
                ${item.selectedColor ? `Color: ${item.selectedColor}<br>` : ''}
                <strong>Subtotal: ${formatCurrency(item.price * item.quantity)}</strong>
              </div>
            `).join('')}
            
            <div class="total">
              <div>Subtotal: ${formatCurrency(order.totals.subtotal)}</div>
              <div>Shipping: ${formatCurrency(order.shipping.cost)}</div>
              <div>Tax: ${formatCurrency(order.totals.tax)}</div>
              <div style="font-size: 24px; margin-top: 10px;">Total: ${formatCurrency(order.totals.total)}</div>
            </div>
            
            ${order.coupon ? `
              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <strong>Coupon Applied:</strong> ${order.coupon.code} - ${order.coupon.description}
              </div>
            ` : ''}
            
            <div class="contact">
              <h3>Need Help?</h3>
              <p>If you have any questions about your order, please contact us at:</p>
              <p><strong>Email:</strong> <a href="mailto:Fevasasamn@gmail.com">Fevasasamn@gmail.com</a></p>
              <p>Please include your order ID: <strong>${order.id}</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Fevas!</p>
            <p>Your trusted partner for quality wholesale products.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Helper methods to generate detailed order information
  static generateOrderDetailsText(order) {
    return `
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status}
Notes: ${order.notes || 'None'}
    `.trim()
  }

  static generateShippingAddressText(order) {
    return `
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}
${order.customer.country}
Phone: ${order.customer.phone || 'Not provided'}
    `.trim()
  }

  static generateItemsListText(order) {
    return order.items.map(item => `
- ${item.product?.title || item.name || 'Product'}
  Quantity: ${item.quantity}
  Price: $${(item.price || 0).toFixed(2)}
  ${item.selectedOption ? `Option: ${item.selectedOption}` : ''}
  ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
  Subtotal: $${((item.price || 0) * item.quantity).toFixed(2)}
    `.trim()).join('\n')
  }

  static generatePaymentInfoText(order) {
    return `
Payment Method: ${order.payment.method}
Payment ID: ${order.payment.paymentIntentId}
Card: ${order.payment.brand} ending in ${order.payment.last4}
    `.trim()
  }

  static generateTotalsBreakdownText(order) {
    return `
Subtotal: $${order.totals.subtotal.toFixed(2)}
Shipping: $${order.shipping.cost.toFixed(2)}
Tax: $${order.totals.tax.toFixed(2)}
Total: $${order.totals.total.toFixed(2)}
    `.trim()
  }

  // Test method to verify EmailJS is working
  static async testEmailJS() {
    try {
      console.log('🧪 Testing EmailJS connection...')
      
      // Try with minimal template variables first
      const testData = {
        to_name: 'Test Customer',
        to_email: 'test@example.com',
        message: 'This is a test email from Fevas',
        from_name: 'Fevas Team'
      }
      
      console.log('🧪 Test data:', testData)
      
      const result = await this.sendEmail(testData)
      console.log('✅ EmailJS test successful:', result)
      return result
    } catch (error) {
      console.error('❌ EmailJS test failed:', error)
      throw error
    }
  }

  static generateOrderEmailText(order) {
    const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`
    
    return `
ORDER CONFIRMATION - ${order.id}

Thank you for your order! Your order has been successfully placed and is being processed.

ORDER DETAILS:
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Customer: ${order.customer.firstName} ${order.customer.lastName}
Email: ${order.customer.email}

SHIPPING ADDRESS:
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}
${order.customer.country}
Phone: ${order.customer.phone || 'Not provided'}

ORDER ITEMS:
${order.items.map(item => `
- ${item.product?.title || item.name || 'Product'}
  Quantity: ${item.quantity}
  Price: ${formatCurrency(item.price)}
  ${item.selectedOption ? `Option: ${item.selectedOption}` : ''}
  ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
  Subtotal: ${formatCurrency((item.price || 0) * item.quantity)}
`).join('')}

TOTALS:
Subtotal: ${formatCurrency(order.totals.subtotal)}
Shipping: ${formatCurrency(order.shipping.cost)}
Tax: ${formatCurrency(order.totals.tax)}
Total: ${formatCurrency(order.totals.total)}

${order.notes ? `
NOTES:
${order.notes}
` : ''}

NEED HELP?
If you have any questions about your order, please contact us at:
Email: Fevasasamn@gmail.com
Please include your order ID: ${order.id}

Thank you for choosing Fevas!
Your trusted partner for quality wholesale products.
    `.trim()
  }

  static async sendEmail(emailData, customTemplateId = null) {
    try {
      console.log('📧 Sending email via EmailJS...')
      console.log('Email data:', emailData)
      
      // EmailJS configuration
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tk8ieoz'
      const templateId = customTemplateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_s1pvkof'
      const userId = import.meta.env.VITE_EMAILJS_USER_ID || '6YO2Gqezvy5o5-IlL'
      
      console.log('EmailJS Config:', { serviceId, templateId, userId })
      console.log('Environment variables check:', {
        VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        VITE_EMAILJS_USER_ID: import.meta.env.VITE_EMAILJS_USER_ID
      })
      
      // Validate EmailJS configuration
      if (!serviceId || !templateId || !userId) {
        throw new Error(`Missing EmailJS configuration: serviceId=${serviceId}, templateId=${templateId}, userId=${userId}`)
      }
      
      // Initialize EmailJS with the current configuration
      emailjs.init(userId)
      
      // Send email using EmailJS
      const result = await emailjs.send(
        serviceId,
        templateId,
        emailData,
        userId
      )
      
      console.log('✅ Email sent successfully:', result)
      return { success: true, message: 'Email sent successfully', result }
    } catch (error) {
      console.error('❌ EmailJS error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      throw error
    }
  }

  // Test your specific template with correct variables
  static async testYourTemplate() {
    try {
      console.log('🧪 Testing your template_s1pvkof...')
      
      // Use the exact variables your template expects
      const testData = {
        to_email: 'test@example.com',
        order_id: 'TEST-123',
        customer_name: 'Test Customer',
        order_total: '$99.99',
        order_date: new Date().toLocaleDateString()
      }
      
      console.log('Test data:', testData)
      
      const result = await this.sendEmail(testData, 'template_s1pvkof')
      console.log('✅ Your template works!', result)
      return { success: true, templateId: 'template_s1pvkof', result }
    } catch (error) {
      console.log('❌ Your template failed:', error.message)
      throw error
    }
  }

  // Test different EmailJS templates
  static async testDifferentTemplates() {
    const templates = [
      'template_s1pvkof', // Your current template
      'template_contact_form', // Common default template
      'template_generic', // Another common template
      'template_default' // Default template name
    ]
    
    const testData = {
      to_name: 'Test Customer',
      to_email: 'test@example.com',
      message: 'This is a test email from Fevas',
      from_name: 'Fevas Team'
    }
    
    for (const templateId of templates) {
      try {
        console.log(`🧪 Testing template: ${templateId}`)
        const result = await this.sendEmail(testData, templateId)
        console.log(`✅ Template ${templateId} works!`, result)
        return { success: true, templateId, result }
      } catch (error) {
        console.log(`❌ Template ${templateId} failed:`, error.message)
      }
    }
    
    throw new Error('No working templates found')
  }
}

export default EmailService 