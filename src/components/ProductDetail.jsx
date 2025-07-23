import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { getPriceForQuantity, getPricingTiers, getCurrentPrice, getCompareAtPrice, getSizeOptions, getPriceRangeDisplay, getColorOptions, getPricingTiersWithCasePrices } from '../lib/pricing'

const ProductDetail = ({ product, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')
  const [imageZoomed, setImageZoomed] = useState(false)
  const [showFullscreenImage, setShowFullscreenImage] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [magnifierActive, setMagnifierActive] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get all images from the product
  const images = product.images || []
  const hasMultipleImages = images.length > 1
  
  // Get the current image or use a placeholder
  const currentImage = images[currentImageIndex] 
    ? images[currentImageIndex].url || images[currentImageIndex].asset?.url
    : 'https://via.placeholder.com/400x300?text=No+Image'

  // Get option items
  const optionItems = getSizeOptions(product)
  const hasOptions = optionItems.length > 0

  // Get color items
  const colorItems = getColorOptions(product)
  const hasColors = Array.isArray(colorItems) && colorItems.length > 0

  // Debug logging
  console.log('ProductDetail - Product:', product.title)
  console.log('ProductDetail - Full product data:', product)
  console.log('ProductDetail - Color options raw:', product.color)
  console.log('ProductDetail - Color options processed:', colorItems)
  console.log('ProductDetail - Has colors:', hasColors)
  console.log('ProductDetail - getColorOptions result:', getColorOptions(product))

  // Get pricing information based on selected option and color
  const currentPrice = getCurrentPrice(product, selectedOption, selectedColor)
  const compareAtPrice = getCompareAtPrice(product, selectedOption, selectedColor)
  const pricingTiers = getPricingTiersWithCasePrices(product, selectedOption, selectedColor)
  
  // For products without options or colors, get price range display
  const priceRangeInfo = (!hasOptions && !hasColors) ? getPriceRangeDisplay(product, selectedOption, selectedColor) : null
  
  // Calculate discount if compareAtPrice exists
  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
    : 0

  // Get price for current quantity and selected option/color
  const currentPricing = getPriceForQuantity(product, quantity, selectedOption, selectedColor)

  // Get legacy color from product data
  const productColor = product.color

  const { addToCart } = useCart()

  // Navigation functions for slideshow
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  const handleAddToCart = () => {
    // Require option selection if product has options
    if (hasOptions && !selectedOption) {
      alert('Please select an option before adding to cart')
      return
    }
    // Require color selection if product has colors
    if (hasColors && !selectedColor) {
      alert('Please select a color before adding to cart')
      return
    }
    addToCart(product, quantity, selectedColor, selectedOption)
    onClose()
  }

  const handleBuyNow = () => {
    // Require option selection if product has options
    if (hasOptions && !selectedOption) {
      alert('Please select an option before adding to cart')
      return
    }
    // Require color selection if product has colors
    if (hasColors && !selectedColor) {
      alert('Please select a color before adding to cart')
      return
    }
    addToCart(product, quantity, selectedColor, selectedOption)
    // This would typically redirect to checkout immediately
    // For now, we'll just close the modal and let user go to cart
    onClose()
  }

  const toggleImageZoom = () => {
    setImageZoomed(!imageZoomed)
  }

  const openFullscreenImage = () => {
    setShowFullscreenImage(true)
  }

  const closeFullscreenImage = () => {
    setShowFullscreenImage(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // Swipe to close functionality
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isSwipeUp = distance > 50
    const isSwipeDown = distance < -50

    if (isSwipeUp || isSwipeDown) {
      closeFullscreenImage()
    }
  }

  // Magnifier functionality
  const handleImageClick = (e) => {
    // Check if it's a mobile device
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      // Use the old zoom behavior on mobile
      toggleImageZoom()
    } else {
      // Use magnifier behavior on desktop
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      if (magnifierActive) {
        // If magnifier is active, deactivate it
        setMagnifierActive(false)
      } else {
        // Activate magnifier at click position
        setMagnifierActive(true)
        setMagnifierPosition({ x, y })
        setMousePosition({ x, y })
      }
    }
  }

  const handleImageMouseMove = (e) => {
    // Only work on desktop and when magnifier is active
    if (!magnifierActive || window.innerWidth < 768) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePosition({ x, y })
  }

  const handleImageMouseLeave = () => {
    // Only deactivate magnifier on desktop
    if (window.innerWidth >= 768) {
      setMagnifierActive(false)
    }
  }

  // Calculate magnifier position and zoom
  const getMagnifierStyle = () => {
    if (!magnifierActive) return {}
    
    // Responsive magnifier size
    const magnifierSize = window.innerWidth >= 1024 ? 200 : 150
    const zoomLevel = 2.5
    
    return {
      width: magnifierSize,
      height: magnifierSize,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${zoomLevel * 100}%`,
      backgroundPosition: `${-mousePosition.x * zoomLevel + magnifierSize / 2}px ${-mousePosition.y * zoomLevel + magnifierSize / 2}px`,
      left: mousePosition.x - magnifierSize / 2,
      top: mousePosition.y - magnifierSize / 2,
    }
  }

  return (
    <>
      {/* Fullscreen Image Viewer */}
      {showFullscreenImage && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center" onClick={closeFullscreenImage}>
          <div 
            className="relative w-full h-full flex items-center justify-center p-4" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={imageUrl}
              alt={product.title}
              className="max-w-full max-h-full object-contain fullscreen-image"
            />
            <button
              onClick={closeFullscreenImage}
              className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
              Tap outside to close
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-amber-800/30">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-amber-800/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white pr-2">{product.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-amber-400 text-xl sm:text-2xl font-bold flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* Product Image */}
              <div className="relative w-full h-64 sm:h-80 bg-gray-700 rounded-lg overflow-hidden mb-6">
                <img
                  src={currentImage}
                  alt={`${product.title} - Image ${currentImageIndex + 1}`}
                  className={`w-full h-full transition-opacity duration-300 ${
                    imageZoomed ? 'object-contain' : 'object-cover'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onClick={toggleImageZoom}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={handleImageMouseLeave}
                />
                
                {/* Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    {/* Previous arrow */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next arrow */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image indicators */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-amber-400' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Image counter */}
                {hasMultipleImages && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
                
                {/* Loading state */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                  </div>
                )}
                
                {/* Error state */}
                {imageError && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Image failed to load</p>
                    </div>
                  </div>
                )}
                
                {/* Magnifier */}
                {magnifierActive && !imageZoomed && (
                  <div
                    className="absolute w-32 h-32 border-2 border-amber-400 rounded-full pointer-events-none z-20"
                    style={getMagnifierStyle()}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={currentImage}
                        alt="Magnified view"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(2) translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px)`
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Zoom indicator */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {imageZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-amber-400">${currentPricing.price}</span>
                    {hasDiscount && (
                      <span className="text-lg sm:text-xl text-gray-400 line-through">${compareAtPrice}</span>
                    )}
                  </div>
                  {/* Show price range for products without options */}
                  {priceRangeInfo && priceRangeInfo.hasRange && (
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">{priceRangeInfo.priceRange}</span>
                      <div className="text-xs text-gray-400">Per unit - Case of {priceRangeInfo.caseQuantity}</div>
                    </div>
                  )}
                  {currentPricing.savings > 0 && (
                    <div className="text-sm text-green-400 font-medium">
                      Save ${currentPricing.savings.toFixed(2)} per unit ({currentPricing.tierName})
                    </div>
                  )}
                  {product.sku && (
                    <p className="text-xs sm:text-sm text-gray-400">SKU: {product.sku}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                </div>

                {/* Color Selection */}
                {hasColors && Array.isArray(colorItems) && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Select Color</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {colorItems.map((color) => {
                        const isSelected = selectedColor === color
                        
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`p-3 rounded-lg border-2 text-left transition-colors ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/20'
                                : 'border-gray-600 hover:border-amber-400 bg-gray-700'
                            }`}
                          >
                            <div className="font-medium text-white">{color}</div>
                          </button>
                        )
                      })}
                    </div>
                    {!selectedColor && hasColors && (
                      <p className="text-sm text-orange-400 mt-2">Please select a color to continue</p>
                    )}
                  </div>
                )}

                {/* Option Selection */}
                {hasOptions && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Select Option</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {optionItems.map((optionItem) => {
                        const isSelected = selectedOption === optionItem.size
                        const isInStock = optionItem.unitsAvailable > 0
                        
                        return (
                          <button
                            key={optionItem.size}
                            onClick={() => setSelectedOption(optionItem.size)}
                            disabled={!isInStock}
                            className={`p-3 rounded-lg border-2 text-left transition-colors ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/20'
                                : isInStock
                                ? 'border-gray-600 hover:border-amber-400 bg-gray-700'
                                : 'border-gray-600 bg-gray-800 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-medium text-white">{optionItem.size}</div>
                            <div className="text-sm font-bold text-amber-400">${optionItem.retailPrice}</div>
                            <div className={`text-xs ${
                              isInStock ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {isInStock ? `${optionItem.unitsAvailable} in stock` : 'Out of stock'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {!selectedOption && hasOptions && (
                      <p className="text-sm text-orange-400 mt-2">Please select an option to continue</p>
                    )}
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-3">
                  {/* Show selected color info */}
                  {selectedColor && hasColors && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Color</h3>
                      <p className="text-gray-600">{selectedColor}</p>
                    </div>
                  )}

                  {/* Show legacy color if no color options */}
                  {!hasColors && productColor && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Color</h3>
                      <p className="text-gray-600">{productColor}</p>
                    </div>
                  )}

                  {/* Show selected option info */}
                  {selectedOption && hasOptions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Option</h3>
                      <p className="text-gray-600">{selectedOption}</p>
                    </div>
                  )}

                  {/* Show stock info for selected option/color or general product */}
                  {(selectedOption && hasOptions) || (selectedColor && hasColors) ? (
                    (() => {
                      if (selectedColor && hasColors) {
                        return (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Selected Color</h3>
                            <p className="text-gray-600">{selectedColor}</p>
                          </div>
                        )
                      } else if (selectedOption && hasOptions) {
                        const selectedOptionItem = optionItems.find(option => option.size === selectedOption)
                        return selectedOptionItem ? (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Stock</h3>
                            <p className={`font-medium ${selectedOptionItem.unitsAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedOptionItem.unitsAvailable > 0 ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        ) : null
                      }
                      return null
                    })()
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Stock</h3>
                      <p className={`font-medium ${product.unitsAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.unitsAvailable > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  )}

                  {product.minOrderQuantity && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Minimum Order</h3>
                      <p className="text-gray-600">{product.minOrderQuantity} units minimum</p>
                    </div>
                  )}
                </div>

                {/* Pricing Tiers */}
                {pricingTiers.length > 1 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Pricing Tiers</h3>
                    <p className="text-sm text-gray-300 mb-3">Click on a pricing tier to automatically set the quantity</p>
                    <div className="space-y-2">
                      {pricingTiers.map((tier, index) => (
                        <button
                          key={index}
                          onClick={() => setQuantity(tier.minQuantity)}
                          className={`w-full flex justify-between items-center p-3 rounded-lg transition-colors ${
                            quantity === tier.minQuantity
                              ? 'bg-amber-600 border-2 border-amber-400'
                              : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-white">{tier.tierName}</div>
                            <div className="text-sm text-gray-300">
                              {tier.minQuantity} {tier.minQuantity === 1 ? 'unit' : 'units'}
                              {tier.maxQuantity && ` - ${tier.maxQuantity} units`}
                            </div>
                            <div className="text-xs text-gray-400">
                              {tier.priceFormatted} per unit
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-400 text-lg">
                              {tier.totalPriceFormatted}
                            </div>
                            {tier.minQuantity > 1 && (
                              <div className="text-xs text-gray-400">
                                Total for {tier.minQuantity} units
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-600 bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-12 text-center text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-600 bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || (hasOptions && !selectedOption) || (hasColors && !selectedColor)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-colors ${
                      product.inStock && (!hasOptions || selectedOption) && (!hasColors || selectedColor)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? (
                      (hasOptions && !selectedOption) || (hasColors && !selectedColor) ? (
                        'Select Option/Color to Add to Cart'
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                          </svg>
                          Add to Cart - ${(currentPricing.price * quantity).toFixed(2)}
                        </span>
                      )
                    ) : (
                      'Out of Stock'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail 