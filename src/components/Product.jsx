import React, { useState } from 'react'
import { getCurrentPrice, getCompareAtPrice, getSizeOptions, getLowestPrice, getHighestPrice, getPriceRangeDisplay, getPriceRangeDisplayWithOptions, getColorOptions, getPriceRangeDisplayWithColors } from '../lib/pricing'
import { useCart } from '../context/CartContext'

const Product = ({ product, onProductClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Get all images from the product
  const images = product.images || []
  const hasMultipleImages = images.length > 1
  
  // Get the current image or use a placeholder
  const currentImage = images[currentImageIndex] 
    ? images[currentImageIndex].url || images[currentImageIndex].asset?.url
    : 'https://via.placeholder.com/180x120?text=No+Image'

  const { addToCart } = useCart()

  // Get option items
  const optionItems = getSizeOptions(product)
  const hasOptions = optionItems.length > 0

  // Get color items
  const colorItems = getColorOptions(product)
  const hasColors = Array.isArray(colorItems) && colorItems.length > 0

  // Debug logging
  if (hasOptions) {
    console.log(`Product "${product.title}" has ${optionItems.length} option items:`, optionItems)
  }
  if (hasColors) {
    console.log(`Product "${product.title}" has ${colorItems.length} color items:`, colorItems)
  } else {
    console.log(`Product "${product.title}" has no color options. colorOptions:`, product.colorOptions)
  }

  // Get pricing information
  const currentPrice = getCurrentPrice(product)
  const compareAtPrice = getCompareAtPrice(product)
  
  // For products with options, show price range with wholesale pricing
  const lowestPrice = hasOptions ? getLowestPrice(product) : currentPrice
  const highestPrice = hasOptions ? getHighestPrice(product) : currentPrice
  const showPriceRange = hasOptions && lowestPrice !== highestPrice
  
  // For products without options or colors, show single unit + case pricing
  const priceRangeInfo = (!hasOptions && !hasColors) ? getPriceRangeDisplay(product) : null
  
  // For products with options, show lowest price to wholesale price
  const optionsPriceRangeInfo = hasOptions ? getPriceRangeDisplayWithOptions(product) : null
  
  // For products with colors, show single unit + case pricing
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

  // Navigation functions
  const nextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (e, index) => {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  return (
    <div 
      className="bg-gray-800/50 rounded-lg shadow border border-amber-800/30 flex flex-col w-full h-48 sm:h-56 md:h-64 lg:h-72 hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
      onClick={() => onProductClick(product)}
    >
      {/* Image area with slideshow */}
      <div className="relative w-full h-28 sm:h-32 md:h-36 lg:h-40 flex items-center justify-center bg-gray-700 rounded-t-lg overflow-hidden">
        <img
          src={currentImage}
          alt={`${product.title} - Image ${currentImageIndex + 1}`}
          className="object-contain w-full h-full transition-opacity duration-300"
          loading="lazy"
          onError={e => {
            e.target.src = 'https://via.placeholder.com/180x120?text=Image+Error'
          }}
        />
        
        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            {/* Previous arrow */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Next arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(e, index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
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
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow">
            -{discountPercentage}%
          </span>
        )}
        
        {/* Out of stock badge */}
        {!product.inStock && (
          <span className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold shadow">
            Out
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between px-3 sm:px-4 py-1 sm:py-2">
        {/* Name */}
        <div className="h-6 sm:h-8 md:h-10 flex items-center justify-center text-center mb-1">
          <h2 className="text-xs sm:text-sm md:text-base font-semibold text-white leading-tight line-clamp-2">
            {product.title}
          </h2>
        </div>
        
        {/* Price */}
        <div className="text-center mb-1">
          {showPriceRange ? (
            <div>
              <span className="text-sm sm:text-lg md:text-xl font-bold text-amber-400">
                {optionsPriceRangeInfo.priceRange}
              </span>
              <div className="text-xs text-gray-300">Select option</div>
            </div>
          ) : colorsPriceRangeInfo && colorsPriceRangeInfo.hasRange ? (
            <div>
              <span className="text-sm sm:text-lg md:text-xl font-bold text-amber-400">
                {colorsPriceRangeInfo.priceRange}
              </span>
              <div className="text-xs text-gray-300">Per unit - Case of {colorsPriceRangeInfo.caseQuantity}</div>
            </div>
          ) : priceRangeInfo && priceRangeInfo.hasRange ? (
            <div>
              <span className="text-sm sm:text-lg md:text-xl font-bold text-amber-400">
                {priceRangeInfo.priceRange}
              </span>
              <div className="text-xs text-gray-300">Per unit - Case of {priceRangeInfo.caseQuantity}</div>
            </div>
          ) : (
            <span className="text-sm sm:text-lg md:text-xl font-bold text-amber-400">${currentPrice}</span>
          )}
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-gray-400 line-through block">${compareAtPrice}</span>
          )}
        </div>
        
        {/* SKU */}
        {product.sku && (
          <span className="hidden sm:block text-xs text-gray-400 mb-1">SKU: {product.sku}</span>
        )}
        
        {/* Add to Cart button */}
        <button
          className={`w-full py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-colors mt-auto ${
            !product.inStock || requiresSelection
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
          disabled={!product.inStock || requiresSelection}
          onClick={e => {
            e.stopPropagation()
            if (!requiresSelection) {
              addToCart(product, 1)
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default Product 