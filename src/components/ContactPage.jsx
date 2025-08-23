import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ContactPage = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const { getTotalItems } = useCart()

  // Cart animation effect
  useEffect(() => {
    if (getTotalItems() > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 600)
      return () => clearTimeout(timer)
    }
  }, [getTotalItems()])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-sm border-b border-amber-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/Fevas logo 2.png" 
                  alt="Fevas" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-300 hover:text-amber-400 transition-colors">Home</Link>
              <Link to="/shop" className="text-gray-300 hover:text-amber-400 transition-colors">Shop</Link>
              <Link to="/about" className="text-gray-300 hover:text-amber-400 transition-colors">About</Link>
              <Link to="/contact" className="text-amber-400 hover:text-amber-300 transition-colors">Contact</Link>
            </div>
            <div className="md:hidden">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 left-0 w-64 h-full bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out border-r border-amber-800/30">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-amber-800/30">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 text-amber-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 p-4">
                <div className="space-y-4">
                  <Link 
                    to="/" 
                    className="block py-3 px-4 text-lg font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/shop" 
                    className="block py-3 px-4 text-lg font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Shop
                  </Link>
                  <Link 
                    to="/about" 
                    className="block py-3 px-4 text-lg font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="block py-3 px-4 text-lg font-semibold text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Contact
                  </Link>
                </div>
              </nav>
              
              {/* Footer */}
              <div className="p-4 border-t border-amber-800/30">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Quality products at the best prices</p>
                  <p className="text-amber-400 text-xs">Your trusted wholesale partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in
              <span className="text-amber-400 block">Touch</span>
            </h1>
            
            {/* Animated Contact Icon */}
            <div className="flex justify-center mb-12">
              <div className="relative group">
                {/* Main Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                {/* Pulsing Rings */}
                <div className="absolute inset-0 w-24 h-24 border-2 border-amber-400/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-24 h-24 border-2 border-amber-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 w-24 h-24 border-2 border-amber-400/10 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                
                {/* Floating Dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}>
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}>
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
                
                {/* Communication Lines */}
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-amber-400/60 animate-pulse"></div>
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-amber-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-0.5 h-6 bg-amber-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-0.5 h-6 bg-amber-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              We're here to help with any questions, issues, or concerns you may have about your orders.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 md:py-24 bg-black/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 rounded-2xl border border-amber-800/30 p-8 md:p-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Customer Support</h2>
              <p className="text-lg text-gray-300">
                Need help with your order or have questions? We're here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Order Issues</h3>
                <p className="text-gray-300 mb-4">
                  Experiencing problems with your order? Whether it's a shipping delay, missing items, or any other issue, we want to help resolve it quickly.
                </p>
                <a 
                  href="mailto:Fevasasamn@gmail.com" 
                  className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Fevasasamn@gmail.com
                </a>
              </div>

              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Returns & Refunds</h3>
                <p className="text-gray-300 mb-4">
                  Need to return an item or request a refund? We understand that sometimes products don't meet expectations, and we're here to help.
                </p>
                <a 
                  href="mailto:Fevasasamn@gmail.com" 
                  className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Fevasasamn@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-6 border border-amber-800/30">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">How to Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Email Us</h4>
                    <p className="text-gray-300 text-sm">Send us an email at <span className="text-amber-400">Fevasasamn@gmail.com</span></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Include Order Details</h4>
                    <p className="text-gray-300 text-sm">Please include your order number and a detailed description of the issue</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Quick Response</h4>
                    <p className="text-gray-300 text-sm">We typically respond within 24-48 hours during business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Shop?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Browse our extensive catalog of quality products at wholesale prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </Link>
            <Link 
              to="/about" 
              className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-amber-800/30 py-8 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Fevas</h3>
            <p className="text-gray-400 text-sm">Quality products at the best prices. Your trusted wholesale partner.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
            <Link to="/shop" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Shop</Link>
            <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">About</Link>
            <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Contact</Link>
          </div>
          <div className="text-gray-500 text-xs text-center md:text-right">
            &copy; {new Date().getFullYear()} Fevas. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ContactPage 