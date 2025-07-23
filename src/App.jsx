// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import ShopPage from './components/ShopPage'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import AdminPage from './components/AdminPage'
import Toast from './components/Toast'
import { CartProvider, useCart } from './context/CartContext'
import { ShippingProvider } from './context/ShippingContext'
import { AdminProvider } from './context/AdminContext'

const App = () => {
  return (
    <Router>
      <CartProvider>
        <ShippingProvider>
          <AdminProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <ToastWrapper />
          </AdminProvider>
        </ShippingProvider>
      </CartProvider>
    </Router>
  )
}

// Toast wrapper component to access cart context
const ToastWrapper = () => {
  const { toast, setToast } = useCart()
  
  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.show}
      onClose={() => setToast({ ...toast, show: false })}
    />
  )
}

export default App