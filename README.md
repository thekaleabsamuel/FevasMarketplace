# 🛍️ Fevas - Wholesale E-commerce Platform

A modern, full-stack e-commerce platform built for wholesale businesses. Features real-time order management, integrated payment processing, and automated email confirmations.

![Fevas Logo](public/Fevas%20Logo.png)

## ✨ Features

### 🛒 **E-commerce**
- **Product Catalog** - Dynamic product listings with images and descriptions
- **Shopping Cart** - Persistent cart with real-time updates
- **Checkout System** - Streamlined 3-step checkout process
- **Payment Processing** - Secure Stripe integration with live payments
- **Order Management** - Centralized order storage and tracking

### 📧 **Communication**
- **Email Confirmations** - Automated order receipts via EmailJS
- **Professional Templates** - Branded HTML email templates
- **Dual Delivery** - Customer receipt + company CC for tracking

### 🎛️ **Admin Panel**
- **Order Dashboard** - Real-time order monitoring
- **Centralized Storage** - Backend API for multi-device access
- **Shipping Labels** - Integrated Shippo shipping label creation
- **Mobile Responsive** - Works seamlessly on all devices

### 🛡️ **Security & Performance**
- **SSL Secured** - HTTPS encryption throughout
- **API Protection** - CORS and security headers
- **Environment Variables** - Secure credential management
- **Vercel Deployment** - Global CDN and edge functions

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

### **Backend**
- **Vercel Serverless Functions** - API endpoints
- **Stripe API** - Payment processing
- **EmailJS** - Email service integration
- **Shippo API** - Shipping label generation

### **Data & Storage**
- **Sanity CMS** - Headless content management
- **localStorage** - Client-side caching
- **Backend API** - Centralized order storage

### **Deployment**
- **Vercel** - Hosting and serverless functions
- **Custom Domain** - fevasmarketplace.com

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Vercel CLI
- Stripe account
- EmailJS account
- Sanity account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fevas.git
   cd fevas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   VITE_SHIPPO_API_KEY=your_shippo_key
   VITE_SANITY_TOKEN=your_sanity_token
   VITE_EMAILJS_SERVICE_ID=service_tk8ieoz
   VITE_EMAILJS_TEMPLATE_ID=template_s1pvkof
   VITE_EMAILJS_USER_ID=6YO2Gqezvy5o5-IlL
   ```

4. **Sanity Setup**
   ```bash
   cd fevas
   npm install
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 🏗️ Project Structure

```
fevas/
├── api/                    # Vercel serverless functions
│   ├── create-payment-intent.js
│   └── orders.js
├── src/
│   ├── components/         # React components
│   │   ├── Checkout.jsx
│   │   ├── AdminPage.jsx
│   │   └── ...
│   ├── context/           # React context providers
│   ├── services/          # API services
│   │   ├── stripe.js
│   │   ├── email.js
│   │   └── orders.js
│   └── lib/               # Utility libraries
├── fevas/                 # Sanity CMS
├── public/                # Static assets
└── vercel.json           # Vercel configuration
```

## 🔧 Configuration

### **Stripe Setup**
1. Create Stripe account
2. Get live API keys
3. Add to environment variables
4. Configure webhook endpoints

### **EmailJS Setup**
1. Create EmailJS account
2. Connect Gmail service
3. Create email template
4. Add credentials to environment

### **Sanity CMS**
1. Create Sanity project
2. Configure schema types
3. Add products and categories
4. Set up API tokens

## 📱 Usage

### **Customer Flow**
1. Browse products on homepage
2. Add items to cart
3. Complete checkout with shipping info
4. Process payment via Stripe
5. Receive order confirmation email

### **Admin Flow**
1. Access admin panel at `/admin`
2. View all orders in real-time
3. Create shipping labels
4. Track order status
5. Manage inventory via Sanity

## 🔌 API Endpoints

### **Payment Processing**
- `POST /api/create-payment-intent` - Create Stripe payment intent

### **Order Management**
- `GET /api/orders` - Retrieve all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders?id={id}` - Update order
- `DELETE /api/orders?id={id}` - Delete order

## 🎨 Customization

### **Styling**
- Modify `tailwind.config.js` for theme changes
- Update component styles in `src/components/`
- Customize email templates in EmailJS dashboard

### **Features**
- Add new payment methods in `src/services/stripe.js`
- Extend order management in `src/services/orders.js`
- Modify email templates in EmailJS dashboard

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
vercel --prod
```

### **Environment Variables**
Set these in Vercel dashboard:
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_SHIPPO_API_KEY`
- `VITE_SANITY_TOKEN`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_USER_ID`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: Fevasasamn@gmail.com
- **Website**: [fevasmarketplace.com](https://fevasmarketplace.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/fevas/issues)

## 🙏 Acknowledgments

- **Stripe** - Payment processing
- **EmailJS** - Email service
- **Vercel** - Hosting and deployment
- **Sanity** - Content management
- **Tailwind CSS** - Styling framework

---

**Built with ❤️ for wholesale businesses**
