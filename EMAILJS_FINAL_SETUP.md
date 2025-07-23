# EmailJS Final Setup - Service ID: service_tk8ieoz

## ✅ Step 1: Service ID (COMPLETED)
- **Service ID**: `service_tk8ieoz` ✅

## 🔄 Step 2: Create Email Template

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click "Email Templates" in the left sidebar
3. Click "Create New Template"
4. Name it: `Order Confirmation`
5. Use this template:

**Subject:**
```
Order Confirmation - {{order_id}}
```

**HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - {{order_id}}</title>
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
            <p><strong>Order ID:</strong> <span class="order-id">{{order_id}}</span></p>
            <p><strong>Date:</strong> {{order_date}}</p>
            <p><strong>Customer:</strong> {{customer_name}}</p>
            <p><strong>Email:</strong> {{to_email}}</p>
            
            <h3>Order Summary</h3>
            <div class="total">
                <div style="font-size: 24px; margin-top: 10px;">Total: {{order_total}}</div>
            </div>
            
            <div class="contact">
                <h3>Need Help?</h3>
                <p>If you have any questions about your order, please contact us at:</p>
                <p><strong>Email:</strong> <a href="mailto:Fevasasamn@gmail.com">Fevasasamn@gmail.com</a></p>
                <p>Please include your order ID: <strong>{{order_id}}</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing Fevas!</p>
            <p>Your trusted partner for quality wholesale products.</p>
        </div>
    </div>
</body>
</html>
```

6. **Save the template** and note down the **Template ID** (e.g., `template_abc123`)

## 🔑 Step 3: Get User ID (Public Key)

1. In EmailJS dashboard, go to "Account" → "API Keys"
2. Copy your **Public Key** (User ID) (e.g., `user_def456`)

## ⚙️ Step 4: Add Environment Variables

Add these to your Vercel environment variables:

```
VITE_EMAILJS_SERVICE_ID=service_tk8ieoz
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_USER_ID=your_user_id_here
```

## 🧪 Step 5: Test

1. Place a test order
2. Check that email is sent to customer
3. Check that you receive CC copy at Fevasasamn@gmail.com

## 📋 Current Status:
- ✅ Service ID: `service_tk8ieoz`
- ⏳ Template ID: Waiting for you to create template
- ⏳ User ID: Waiting for you to get from API Keys
- ⏳ Environment Variables: Waiting for you to add to Vercel 