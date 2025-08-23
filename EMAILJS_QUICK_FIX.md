# EmailJS Quick Fix Guide

## Issue Found
- Environment variables not set in Vercel
- EmailJS template `template_s1pvkof` doesn't exist or has wrong configuration

## Step 1: Set Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: `fevas3`
3. Settings → Environment Variables
4. Add these variables:

```
VITE_EMAILJS_SERVICE_ID = service_tk8ieoz
VITE_EMAILJS_TEMPLATE_ID = template_s1pvkof
VITE_EMAILJS_USER_ID = 6YO2Gqezvy5o5-IlL
```

## Step 2: Create New EmailJS Template

1. Go to: https://dashboard.emailjs.com/
2. Click "Email Templates"
3. Click "Create New Template"
4. Use this template:

**Template Name:** Order Confirmation
**Template ID:** Should auto-generate (copy this for later)

**Subject Line:**
```
Order Confirmation - {{order_id}}
```

**HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <p><strong>Order ID:</strong> {{order_id}}</p>
            <p><strong>Customer:</strong> {{customer_name}}</p>
            <p><strong>Email:</strong> {{to_email}}</p>
            <p><strong>Date:</strong> {{order_date}}</p>
            <p><strong>Total:</strong> {{order_total}}</p>
            
            <h3>Thank you for your order!</h3>
            <p>Your order has been received and is being processed.</p>
        </div>
        <div class="footer">
            <p>Fevas - Your trusted wholesale partner</p>
            <p>Contact: Fevasasamn@gmail.com</p>
        </div>
    </div>
</body>
</html>
```

**Plain Text Content:**
```
Order Confirmation - {{order_id}}

Thank you for your order!

Order Details:
- Order ID: {{order_id}}
- Customer: {{customer_name}}
- Email: {{to_email}}
- Date: {{order_date}}
- Total: {{order_total}}

Your order has been received and is being processed.

Fevas - Your trusted wholesale partner
Contact: Fevasasamn@gmail.com
```

## Step 3: Update Template ID

After creating the template:
1. Copy the new Template ID (e.g., `template_abc123`)
2. Update Vercel environment variable:
   `VITE_EMAILJS_TEMPLATE_ID = [your_new_template_id]`

## Step 4: Test Again

1. Redeploy your site (Vercel will pick up new env vars)
2. Run the EmailJS diagnostic again
3. Check if emails are now working

## Alternative: Use EmailJS Contact Form Template

If creating a custom template fails, try using a standard contact form:

1. In EmailJS dashboard, create a template with ID: `template_contact_form`
2. Use these standard variables:
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{from_name}}`
   - `{{message}}`

## Verification Steps

1. Environment variables set in Vercel ✅
2. EmailJS template created ✅
3. Template ID updated in Vercel ✅
4. Site redeployed ✅
5. EmailJS diagnostic passes ✅
6. Test email sent successfully ✅

