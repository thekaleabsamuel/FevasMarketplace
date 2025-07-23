import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const AboutPage = () => {
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
                  src="/Fevas Logo.png" 
                  alt="Fevas" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-300 hover:text-amber-400 transition-colors">Home</Link>
              <Link to="/shop" className="text-gray-300 hover:text-amber-400 transition-colors">Shop</Link>
              <Link to="/about" className="text-amber-400 hover:text-amber-300 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">Contact</Link>
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
                    className="block py-3 px-4 text-lg font-semibold text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="block py-3 px-4 text-lg font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Freedom to
              <span className="text-amber-400 block">Shop Wholesale</span>
            </h1>
            
            {/* Animated Icon */}
            <div className="flex justify-center mb-12">
              <div className="relative group">
                {/* Main Icon Container */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-amber-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  {/* Freedom/Liberty Icon */}
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                
                {/* Animated Rings */}
                <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-2 border-amber-400/30 rounded-full animate-ping group-hover:animate-none"></div>
                <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-2 border-amber-400/20 rounded-full animate-ping animation-delay-1000 group-hover:animate-none"></div>
                
                {/* Floating Elements - Freedom themed */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse group-hover:animate-bounce">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-amber-300 rounded-full animate-pulse animation-delay-500 group-hover:animate-bounce">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-amber-500 rounded-full animate-pulse animation-delay-1000 group-hover:animate-bounce">
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -left-4 w-2 h-2 bg-amber-300 rounded-full animate-pulse animation-delay-1500 group-hover:animate-bounce">
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              We believe everyone deserves access to quality products at wholesale prices. No registration, no licenses, no barriers.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                At Fevas, we're breaking down the traditional barriers of wholesale shopping. We believe that quality products at wholesale prices shouldn't be restricted to businesses with licenses or complex registration processes.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Whether you're a small business owner, a reseller, or simply someone who wants to buy in bulk for personal use, we provide you with the freedom to access premium products without the usual wholesale restrictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/shop" 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl text-center"
                >
                  Start Shopping
                </Link>
                <a 
                  href="#how-it-works" 
                  className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600/20 to-amber-400/10 p-8 rounded-2xl border border-amber-800/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">No Registration</h3>
                    <p className="text-gray-300 text-sm">Shop immediately without creating an account</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">No License Required</h3>
                    <p className="text-gray-300 text-sm">Access wholesale prices without business credentials</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Quality Products</h3>
                    <p className="text-gray-300 text-sm">Premium goods at competitive wholesale prices</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Fast Delivery</h3>
                    <p className="text-gray-300 text-sm">Quick shipping to get your products to you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Getting wholesale prices has never been easier. Here's how our simple process works:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Browse & Select</h3>
              <p className="text-gray-300">
                Explore our extensive catalog of quality products. No account creation required - just browse and find what you need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Add to Cart</h3>
              <p className="text-gray-300">
                Select your quantities and add items to your cart. Our tiered pricing means the more you buy, the more you save.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Checkout & Enjoy</h3>
              <p className="text-gray-300">
                Complete your purchase with our streamlined checkout process. Your wholesale products will be shipped directly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Fevas?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We're not just another wholesale supplier. We're your partner in accessible, quality wholesale shopping.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-amber-800/30 text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">For Everyone</h3>
              <p className="text-gray-300 text-sm">
                Whether you're a business owner, reseller, or individual buyer, our wholesale prices are available to all.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-amber-800/30 text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Best Prices</h3>
              <p className="text-gray-300 text-sm">
                Our tiered pricing structure ensures you get the best possible prices based on quantity.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-amber-800/30 text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quality Assured</h3>
              <p className="text-gray-300 text-sm">
                Every product in our catalog meets our strict quality standards and comes with our guarantee.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-amber-800/30 text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast & Reliable</h3>
              <p className="text-gray-300 text-sm">
                Quick processing and reliable shipping ensure your products arrive when you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-8 md:p-12 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience Wholesale Freedom?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered the freedom of accessible wholesale shopping.
            </p>
            <Link 
              to="/shop" 
              className="bg-white text-amber-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl inline-block"
            >
              Start Shopping Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-amber-800/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-amber-400 mb-2">Fevas</h3>
              <p className="text-gray-400 text-sm">Quality products at the best prices. Your trusted wholesale partner.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-center">
              <Link to="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
              <Link to="/shop" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Shop</Link>
              <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">About</Link>
              <a href="#contact" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Contact</a>
            </div>
            <div className="text-gray-500 text-xs text-center md:text-right">
              &copy; {new Date().getFullYear()} Fevas. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage 