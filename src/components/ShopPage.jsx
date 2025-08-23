import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Product from './Product'
import ProductDetail from './ProductDetail'
import Cart from './Cart'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import { useCart } from '../context/CartContext'
import { useAdmin } from '../context/AdminContext'
import { client } from '../lib/sanity'

const ShopPage = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(36)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [cartAnimation, setCartAnimation] = useState(false)
  const { getTotalItems } = useCart()
  const { isAuthenticated, showLogin, toggleLogin } = useAdmin()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...')
        
        const categoriesQuery = `*[_type == "product"]{
          category
        }`
        
        const productsQuery = `*[_type == "product"]{
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
        
        console.log('Sanity client:', client)
        console.log('Environment check:', {
          hasToken: !!import.meta.env.VITE_SANITY_TOKEN,
          projectId: client.config().projectId,
          dataset: client.config().dataset
        })
        
        const [categoriesResult, productsResult] = await Promise.all([
          client.fetch(categoriesQuery),
          client.fetch(productsQuery)
        ])
        
        console.log('Fetched products:', productsResult)
        console.log('Products length:', productsResult?.length)
        console.log('First product:', productsResult?.[0])
        
        // Check if any products have color options
        const productsWithColors = productsResult.filter(product => product.colorOptions && product.colorOptions.length > 0)
        console.log('Products with color options:', productsWithColors)
        
        const uniqueCategories = [...new Set(categoriesResult.map(item => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
        setProducts(productsResult || [])
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle product parameter from URL
  useEffect(() => {
    const productId = searchParams.get('product')
    if (productId && products.length > 0) {
      const product = products.find(p => p._id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [searchParams, products])

  // Cart animation effect
  useEffect(() => {
    if (getTotalItems() > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 600)
      return () => clearTimeout(timer)
    }
  }, [getTotalItems()])

  // Get all unique tags from products
  const allTags = [...new Set(products.flatMap(product => product.tags || []))].sort()
  
  // Get price range for products
  const productPrices = products.map(product => {
    const price = product.pricing?.retailPrice || product.price || 0
    return price
  })
  const minPrice = Math.min(...productPrices, 0)
  const maxPrice = Math.max(...productPrices, 1000)

  const filteredProducts = products.filter(product => {
    try {
      // Validate product structure
      if (!product || typeof product !== 'object') {
        return false
      }
      
      const matchesSearch = (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.tags && Array.isArray(product.tags) && product.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesCategory = selectedCategory === 'all' || 
        (product.category && product.category === selectedCategory)
      
      const productPrice = product.pricing?.retailPrice || product.price || 0
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1]
      
      const matchesTags = selectedTags.length === 0 || 
        (product.tags && Array.isArray(product.tags) && selectedTags.some(tag => product.tags.includes(tag)))
      
      const matchesStock = product.inStock !== false // Show in-stock and undefined stock status
      
      return matchesSearch && matchesCategory && matchesPrice && matchesTags && matchesStock
    } catch (error) {
      console.warn('Error filtering product:', error, product)
      return false
    }
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    try {
      // Validate parameters
      if (!a || !b) {
        return 0
      }
      
      let aValue, bValue
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricing?.retailPrice || a.price || 0
          bValue = b.pricing?.retailPrice || b.price || 0
          break
        case 'name':
        default:
          aValue = (a.title || '').toLowerCase()
          bValue = (b.title || '').toLowerCase()
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    } catch (error) {
      console.warn('Error sorting products:', error, { a, b })
      return 0
    }
  })

  const groupProductsByTag = (products) => {
    // Add comprehensive error handling
    if (!products || !Array.isArray(products)) {
      console.warn('groupProductsByTag: products is not a valid array:', products)
      return { 'Other': [] }
    }
    
    const groups = {}
    const ungroupedProducts = []
    
    products.forEach((product, index) => {
      // Validate product structure
      if (!product || typeof product !== 'object') {
        console.warn(`groupProductsByTag: Invalid product at index ${index}:`, product)
        return
      }
      
      let primaryTag = null
      
      if (product.tags && Array.isArray(product.tags) && product.tags.length > 0) {
        primaryTag = product.tags[0]
      } else if (product.category) {
        primaryTag = product.category
      }
      
      if (!primaryTag) {
        ungroupedProducts.push(product)
        return
      }
      
      if (!groups[primaryTag]) {
        groups[primaryTag] = []
      }
      groups[primaryTag].push(product)
    })
    
    Object.keys(groups).forEach(tag => {
      try {
        groups[tag].sort((a, b) => {
          // Validate parameters
          if (!a || !b) {
            return 0
          }
          
          // Add null checks for title
          if (!a.title || !b.title) {
            return (a.title || '').localeCompare(b.title || '')
          }
          
          try {
            const aMatch = a.title.match(/^(\d+)/)
            const bMatch = b.title.match(/^(\d+)/)
            
            if (aMatch && bMatch) {
              const aNum = parseInt(aMatch[1])
              const bNum = parseInt(bMatch[1])
              if (aNum !== bNum) {
                return aNum - bNum
              }
            }
            
            if (aMatch && !bMatch) return -1
            if (!aMatch && bMatch) return 1
            
            return a.title.localeCompare(b.title)
          } catch (error) {
            console.warn('Error in product sorting:', error, { a, b })
            return 0
          }
        })
      } catch (error) {
        console.error('Error sorting group:', tag, error)
      }
    })
    
    try {
      ungroupedProducts.sort((a, b) => {
        // Validate parameters
        if (!a || !b) {
          return 0
        }
        
        // Add null checks for title
        if (!a.title || !b.title) {
          return (a.title || '').localeCompare(b.title || '')
        }
        
        try {
          const aMatch = a.title.match(/^(\d+)/)
          const bMatch = b.title.match(/^(\d+)/)
          
          if (aMatch && bMatch) {
            const aNum = parseInt(aMatch[1])
            const bNum = parseInt(bMatch[1])
            if (aNum !== bNum) {
              return aNum - bNum
            }
          }
          
          if (aMatch && !bMatch) return -1
          if (!aMatch && bMatch) return 1
          
          return a.title.localeCompare(b.title)
        } catch (error) {
          console.warn('Error in ungrouped products sorting:', error, { a, b })
          return 0
        }
      })
    } catch (error) {
      console.error('Error sorting ungrouped products:', error)
    }
    
    const sortedGroups = Object.keys(groups).sort().reduce((result, tag) => {
      result[tag] = groups[tag]
      return result
    }, {})
    
    if (ungroupedProducts.length > 0) {
      sortedGroups['Other'] = ungroupedProducts
    }
    
    return sortedGroups
  }

  const groupedProducts = groupProductsByTag(sortedProducts)
  
  const flattenedProducts = Object.values(groupedProducts).flat()
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = flattenedProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(flattenedProducts.length / productsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseProductDetail = () => {
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-sm border-b border-amber-800/30 sticky top-0 z-50">
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
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-amber-800/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-amber-400 hover:text-amber-300 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className={`relative flex items-center gap-2 px-3 py-2 text-amber-400 hover:text-amber-300 transition-colors rounded-lg hover:bg-gray-800/50 ${
                  cartAnimation ? 'animate-bounce' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="font-medium">Cart</span>
                {getTotalItems() > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${
                    cartAnimation ? 'animate-pulse' : ''
                  }`}>
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-amber-800/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
                    className="block py-3 px-4 text-lg font-semibold text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
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

      {/* Enhanced Filtering System */}
      <div className="bg-black/40 border-b border-amber-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 rounded-lg border border-amber-800/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
              <span className="bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                {selectedCategory !== 'all' ? 1 : 0 + selectedTags.length + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0)}
              </span>
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">Categories:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-amber-800/30'
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 8).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-amber-800/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {categories.length > 8 && (
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-amber-800/30 transition-colors"
                  >
                    +{categories.length - 8} more
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-')
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                }}
                className="bg-gray-800/50 border border-amber-800/30 text-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Categories Navbar */}
      <div className="md:hidden bg-gray-900/80 border-b border-amber-800/30 sticky top-0 z-40 backdrop-blur-sm relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900/80 to-transparent pointer-events-none z-10"></div>
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900/80 to-transparent pointer-events-none z-10"></div>
        
        <div className="px-4 py-3 relative">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide categories-scroll px-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-amber-800/30 hover:border-amber-600/50'
              }`}
            >
              All
            </button>
            {categories.map(category => {
              const categoryProductCount = products.filter(product => product.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-amber-600 text-white shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-amber-800/30 hover:border-amber-600/50'
                  }`}
                >
                  {category}
                  {categoryProductCount > 0 && (
                    <span className="ml-1 text-xs opacity-75">({categoryProductCount})</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute top-0 left-0 w-80 h-full bg-gray-800 shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 text-amber-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Tags</h4>
                  <div className="space-y-2">
                    {allTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag])
                            } else {
                              setSelectedTags(selectedTags.filter(t => t !== tag))
                            }
                          }}
                          className="rounded border-gray-600 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-gray-300 text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedTags([])
                  setPriceRange([0, 1000])
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2 sm:gap-0">
          <h3 className="text-lg md:text-xl font-bold text-white">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
          </h3>
          <div className="text-right">
            <p className="text-sm md:text-base text-gray-300">
              {flattenedProducts.length} product{flattenedProducts.length !== 1 ? 's' : ''} found
            </p>
            {totalPages > 1 && (
              <p className="text-xs md:text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        </div>

        {currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 p-8 rounded-xl border border-amber-800/30 max-w-md mx-auto">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-4">
                {searchTerm ? 'No products found' : 'No products available'}
              </h2>
              <p className="text-gray-300">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back soon for new products!'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Products Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-10 mb-8">
                {currentProducts.map(product => (
                  <Product 
                    key={product._id} 
                    product={product} 
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {currentProducts.map(product => (
                  <div 
                    key={product._id}
                    className="bg-gray-800/50 rounded-xl border border-amber-800/30 p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img
                          src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/80x80?text=No+Image'}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                        {!product.inStock && (
                          <span className="absolute top-1 right-1 bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                            Out
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-lg mb-1 truncate">
                          {product.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-amber-400 font-semibold">
                            ${product.pricing?.retailPrice || product.price || 0}
                          </span>
                          {product.sku && (
                            <span className="text-gray-400">SKU: {product.sku}</span>
                          )}
                          {product.category && (
                            <span className="text-gray-400">Category: {product.category}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-1 md:space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-2 rounded-lg bg-gray-800/50 border border-amber-800/30 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs md:text-sm"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">←</span>
                </button>
                
                <div className="flex space-x-1 md:space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(number => {
                      if (totalPages <= 7) return true
                      if (number === 1 || number === totalPages) return true
                      if (number >= currentPage - 1 && number <= currentPage + 1) return true
                      return false
                    })
                    .map((number, index, array) => {
                      const prevNumber = array[index - 1]
                      const showEllipsis = prevNumber && number - prevNumber > 1
                      
                      return (
                        <React.Fragment key={number}>
                          {showEllipsis && (
                            <span className="px-2 py-2 text-gray-400 text-xs md:text-sm">...</span>
                          )}
                          <button
                            onClick={() => paginate(number)}
                            className={`px-2 md:px-3 py-2 rounded-lg transition-colors text-xs md:text-sm ${
                              currentPage === number
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-800/50 border border-amber-800/30 text-gray-300 hover:bg-gray-700/50'
                            }`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      )
                    })}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-2 rounded-lg bg-gray-800/50 border border-amber-800/30 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs md:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseProductDetail}
        />
      )}

      {/* Cart Modal */}
      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}

      {/* Admin Login Modal */}
      {showLogin && (
        <AdminLogin onClose={toggleLogin} />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && isAuthenticated && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  )
}

export default ShopPage 