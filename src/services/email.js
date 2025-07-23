import emailjs from '@emailjs/browser'

// Email service for sending order confirmations and receipts
class EmailService {
  static async sendOrderConfirmation(order, customerEmail) {
    try {
      const emailData = {
        to_email: customerEmail,
        cc_email: 'Fevasasamn@gmail.com', // Company email gets CC'd
        subject: `Order Confirmation - ${order.id}`,
        message_html: this.generateOrderEmailHTML(order),
        message_text: this.generateOrderEmailText(order),
        order_id: order.id,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        order_total: `$${(order.totals.total / 100).toFixed(2)}`,
        order_date: new Date(order.date).toLocaleDateString()
      }

      // Send email using EmailJS
      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Error sending order confirmation email:', error)
      throw error
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

  static generateOrderEmailText(order) {
    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`
    
    return `
ORDER CONFIRMATION - ${order.id}

Thank you for your order! Your order has been successfully placed and is being processed.

ORDER DETAILS:
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Customer: ${order.customer}
Email: ${order.email}

SHIPPING ADDRESS:
${order.shippingAddress.name}
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
${order.shippingAddress.country}

ORDER ITEMS:
${order.items.map(item => `
- ${item.title}
  Quantity: ${item.quantity}
  Price: ${formatCurrency(item.price)}
  ${item.selectedOption ? `Option: ${item.selectedOption}` : ''}
  ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
  Subtotal: ${formatCurrency(item.price * item.quantity)}
`).join('')}

TOTALS:
Subtotal: ${formatCurrency(order.totals.subtotal)}
Shipping: ${formatCurrency(order.shipping.cost)}
Tax: ${formatCurrency(order.totals.tax)}
Total: ${formatCurrency(order.totals.total)}

${order.coupon ? `
COUPON APPLIED:
${order.coupon.code} - ${order.coupon.description}
` : ''}

NEED HELP?
If you have any questions about your order, please contact us at:
Email: Fevasasamn@gmail.com
Please include your order ID: ${order.id}

Thank you for choosing Fevas!
Your trusted partner for quality wholesale products.
    `.trim()
  }

  static async sendEmail(emailData) {
    try {
      console.log('📧 Sending email via EmailJS...')
      console.log('Email data:', emailData)
      
      // EmailJS configuration
      const serviceId = process.env.VITE_EMAILJS_SERVICE_ID || 'service_tk8ieoz'
      const templateId = process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_s1pvkof'
      const userId = process.env.VITE_EMAILJS_USER_ID || '6YO2Gqezvy5o5-IlL'
      
      console.log('EmailJS Config:', { serviceId, templateId, userId })
      
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
      throw error
    }
  }
}

export default EmailService 