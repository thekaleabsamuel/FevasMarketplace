import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '../lib/sanity'
import { getCurrentPrice, getCompareAtPrice, getSizeOptions, getLowestPrice, getHighestPrice, getPriceRangeDisplay, getPriceRangeDisplayWithOptions, getColorOptions, getPriceRangeDisplayWithColors } from '../lib/pricing'
import { useCart } from '../context/CartContext'
import SEO from './SEO'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const { getTotalItems } = useCart()

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const productsQuery = `*[_type == "product"] | order(_createdAt desc)[0...6]{
          _id,
          title,
          description,
          price,
          compareAtPrice,
          pricing,
          "images": images[]{
            "url": asset->url
          },
          tags,
          inStock,
          unitsAvailable,
          minOrderQuantity,
          sku,
          slug,
          category,
          size,
          color,
          weight,
          dimensions,
          sizeOptions
        }`
        
        const productsResult = await client.fetch(productsQuery)
        setFeaturedProducts(productsResult || [])
        setLoading(false)
      } catch (err) {
        console.error('Error fetching featured products:', err)
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Cart animation effect
  useEffect(() => {
    if (getTotalItems() > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 600)
      return () => clearTimeout(timer)
    }
  }, [getTotalItems()])
  return (
    <>
      <SEO 
        title="Wholesale E-commerce Marketplace"
        description="Discover premium wholesale products at competitive prices. Fevas offers a curated selection of high-quality items for businesses and resellers. Fast shipping, secure payments, and excellent customer service."
        keywords="wholesale, e-commerce, marketplace, business supplies, reseller, bulk orders, wholesale prices"
        url="https://fevasmarketplace.com"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Fevas",
          "url": "https://fevasmarketplace.com",
          "description": "Wholesale e-commerce marketplace offering quality products at competitive prices",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://fevasmarketplace.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
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
              <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors">Home</Link>
              <Link to="/shop" className="text-gray-300 hover:text-amber-400 transition-colors">Shop</Link>
              <Link to="/about" className="text-gray-300 hover:text-amber-400 transition-colors">About</Link>
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
                    className="block py-3 px-4 text-lg font-semibold text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
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
              Premium Wholesale
              <span className="text-amber-400 block">Products</span>
            </h1>
            
            {/* Fevas Logo with Glittery Animation */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                {/* Fevas Logo */}
                <Link to="/about">
                  <img 
                    src="/Fevas logo 2.png" 
                    alt="Fevas Logo" 
                    className="w-36 h-36 md:w-48 md:h-48 object-contain relative z-10 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                  />
                </Link>
                
                {/* Animated Rings */}
                <div className="absolute inset-0 w-36 h-36 md:w-48 md:h-48 border-2 border-amber-400/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-36 h-36 md:w-48 md:h-48 border-2 border-amber-400/20 rounded-full animate-ping animation-delay-1000"></div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-amber-300 rounded-full animate-pulse animation-delay-500"></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-amber-500 rounded-full animate-pulse animation-delay-1000"></div>
                <div className="absolute top-1/2 -left-4 w-2 h-2 bg-amber-300 rounded-full animate-pulse animation-delay-1500"></div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your trusted partner for quality wholesale products. Competitive pricing, reliable service, and exceptional value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Browse Products
              </Link>
              <a 
                href="#about" 
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Products</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover our latest and most popular wholesale products
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {featuredProducts.map((product) => {
                  // Get the first image from the images array, or use a placeholder
                  const imageUrl = product.images && product.images[0]
                    ? product.images[0].url || product.images[0].asset?.url
                    : 'https://via.placeholder.com/300x200?text=No+Image'

                  // Get size options
                  const sizeOptions = getSizeOptions(product)
                  const hasSizeOptions = sizeOptions.length > 0
                  
                  // Get option items
                  const optionItems = getSizeOptions(product)
                  const hasOptions = optionItems.length > 0

                  // Get color items
                  const colorItems = getColorOptions(product)
                  const hasColors = colorItems.length > 0
                  
                  // Get pricing information
                  const currentPrice = getCurrentPrice(product)
                  const compareAtPrice = getCompareAtPrice(product)
                  
                  // For products with options, show price range with wholesale pricing
                  const lowestPrice = hasOptions ? getLowestPrice(product) : currentPrice
                  const highestPrice = hasOptions ? getHighestPrice(product) : currentPrice
                  const showPriceRange = hasOptions && lowestPrice !== highestPrice
                  
                  // For products without options, show single unit + case pricing
                  const priceRangeInfo = (!hasOptions && !hasColors) ? getPriceRangeDisplay(product) : null
                  
                  // For products with options, show lowest price to wholesale price
                  const optionsPriceRangeInfo = hasOptions ? getPriceRangeDisplayWithOptions(product) : null
                  
                  // For products with colors, show price range with wholesale pricing
                  const colorsPriceRangeInfo = hasColors ? getPriceRangeDisplayWithColors(product) : null

                  // Calculate discount if compareAtPrice exists
                  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice
                  const discountPercentage = hasDiscount 
                    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
                    : 0

                  // Determine if product requires selection before adding to cart
                  const requiresSelection = hasOptions || hasColors
                  const buttonText = !product.inStock 
                    ? 'Out of Stock' 
                    : requiresSelection 
                    ? 'Select Options' 
                    : 'Add to Cart'

                  return (
                    <div
                      key={product._id}
                      className="flex-shrink-0 w-80 bg-gray-800/50 rounded-xl border border-amber-800/30 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-700">
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={e => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'
                          }}
                        />
                        {/* Discount badge */}
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow">
                            -{discountPercentage}%
                          </span>
                        )}
                        {/* Out of stock badge */}
                        {!product.inStock && (
                          <span className="absolute top-3 right-3 bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold shadow">
                            Out
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Name */}
                        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        
                        {/* Price */}
                        <div className="mb-3">
                          {showPriceRange ? (
                            <div>
                              <span className="text-xl font-bold text-amber-400">
                                {optionsPriceRangeInfo.priceRange}
                              </span>
                              <div className="text-sm text-gray-300">Select option</div>
                            </div>
                          ) : colorsPriceRangeInfo && colorsPriceRangeInfo.hasRange ? (
                            <div>
                              <span className="text-xl font-bold text-amber-400">
                                {colorsPriceRangeInfo.priceRange}
                              </span>
                              <div className="text-sm text-gray-300">Per unit - Case of {colorsPriceRangeInfo.caseQuantity}</div>
                            </div>
                          ) : priceRangeInfo && priceRangeInfo.hasRange ? (
                            <div>
                              <span className="text-xl font-bold text-amber-400">
                                {priceRangeInfo.priceRange}
                              </span>
                              <div className="text-sm text-gray-300">Per unit - Case of {priceRangeInfo.caseQuantity}</div>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-amber-400">${currentPrice}</span>
                          )}
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through block">${compareAtPrice}</span>
                          )}
                        </div>
                        
                        {/* SKU */}
                        {product.sku && (
                          <span className="text-xs text-gray-400 block mb-3">SKU: {product.sku}</span>
                        )}
                        
                        {/* View Details Button */}
                        <Link 
                          to={`/shop?product=${product._id}`}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-center block"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Scroll Indicators */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {featuredProducts.map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-amber-400/50"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* View All Products Button */}
          <div className="text-center mt-8">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-transparent border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Fevas?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We provide the best wholesale experience with competitive pricing and exceptional service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gray-800/50 p-8 rounded-xl border border-amber-800/30 hover:bg-gray-700/60 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">Competitive Pricing</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                Get the best wholesale prices with our tiered pricing structure. The more you buy, the more you save.
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-xs text-amber-400 mt-2">Save up to 40% on bulk orders</p>
              </div>
            </div>
            
            <div className="group bg-gray-800/50 p-8 rounded-xl border border-amber-800/30 hover:bg-gray-700/60 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">Quality Assured</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                Every product meets our strict quality standards. We only offer products we believe in.
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-amber-400">Premium Quality</span>
                </div>
              </div>
            </div>
            
            <div className="group bg-gray-800/50 p-8 rounded-xl border border-amber-800/30 hover:bg-gray-700/60 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">Fast Shipping</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                Quick and reliable shipping to get your products to you when you need them.
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-amber-400">Same day processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-8 md:p-12 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Wholesale Journey?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Fevas for their wholesale needs.
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
    </>
  )
}

export default HomePage 