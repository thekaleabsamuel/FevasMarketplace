/**
 * Get the appropriate price for a given quantity and option
 * @param {Object} product - The product object with pricing structure
 * @param {number} quantity - The quantity being purchased
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {Object} - Object containing price, tier info, and savings
 */
export function getPriceForQuantity(product, quantity, selectedOption = null, selectedColor = null) {
  // If color is selected, use color-specific pricing
  if (selectedColor && product.colorOptions) {
    const colorItem = product.colorOptions.find(color => color.color === selectedColor)
    if (colorItem) {
      return getPriceForQuantityByColor(colorItem, quantity)
    }
  }

  // If option is selected, use option-specific pricing
  if (selectedOption && product.sizeOptions) {
    const optionItem = product.sizeOptions.find(option => option.size === selectedOption)
    if (optionItem) {
      return getPriceForQuantityByOption(optionItem, quantity)
    }
  }

  // Default to retail price if no pricing structure exists
  if (!product.pricing || !product.pricing.retailPrice) {
    return {
      price: product.price || 0,
      tierName: 'Retail',
      savings: 0,
      originalPrice: product.price || 0
    }
  }

  const retailPrice = product.pricing.retailPrice
  const wholesaleTiers = product.pricing.wholesaleTiers || []

  // If quantity is 1, return retail price
  if (quantity === 1) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Find the best wholesale tier for this quantity
  let bestTier = null
  let bestPrice = retailPrice

  for (const tier of wholesaleTiers) {
    if (quantity >= tier.minQuantity && 
        (!tier.maxQuantity || quantity <= tier.maxQuantity)) {
      if (tier.price < bestPrice) {
        bestTier = tier
        bestPrice = tier.price
      }
    }
  }

  // If no wholesale tier applies, use retail price
  if (!bestTier) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Calculate savings
  const savings = retailPrice - bestPrice

  return {
    price: bestPrice,
    tierName: bestTier.tierName || `Wholesale (${bestTier.minQuantity}+)`,
    savings: savings,
    originalPrice: retailPrice
  }
}

/**
 * Get the appropriate price for a given quantity for a specific color
 * @param {Object} colorItem - The color object with pricing structure
 * @param {number} quantity - The quantity being purchased
 * @returns {Object} - Object containing price, tier info, and savings
 */
export function getPriceForQuantityByColor(colorItem, quantity) {
  const retailPrice = colorItem.retailPrice || 0
  const wholesaleTiers = colorItem.wholesaleTiers || []

  // If quantity is 1, return retail price
  if (quantity === 1) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Find the best wholesale tier for this quantity
  let bestTier = null
  let bestPrice = retailPrice

  for (const tier of wholesaleTiers) {
    if (quantity >= tier.minQuantity && 
        (!tier.maxQuantity || quantity <= tier.maxQuantity)) {
      if (tier.price < bestPrice) {
        bestTier = tier
        bestPrice = tier.price
      }
    }
  }

  // If no wholesale tier applies, use retail price
  if (!bestTier) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Calculate savings
  const savings = retailPrice - bestPrice

  return {
    price: bestPrice,
    tierName: bestTier.tierName || `Wholesale (${bestTier.minQuantity}+)`,
    savings: savings,
    originalPrice: retailPrice
  }
}

/**
 * Get the appropriate price for a given quantity for a specific option
 * @param {Object} optionItem - The option object with pricing structure
 * @param {number} quantity - The quantity being purchased
 * @returns {Object} - Object containing price, tier info, and savings
 */
export function getPriceForQuantityByOption(optionItem, quantity) {
  const retailPrice = optionItem.retailPrice || 0
  const wholesaleTiers = optionItem.wholesaleTiers || []

  // If quantity is 1, return retail price
  if (quantity === 1) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Find the best wholesale tier for this quantity
  let bestTier = null
  let bestPrice = retailPrice

  for (const tier of wholesaleTiers) {
    if (quantity >= tier.minQuantity && 
        (!tier.maxQuantity || quantity <= tier.maxQuantity)) {
      if (tier.price < bestPrice) {
        bestTier = tier
        bestPrice = tier.price
      }
    }
  }

  // If no wholesale tier applies, use retail price
  if (!bestTier) {
    return {
      price: retailPrice,
      tierName: 'Retail',
      savings: 0,
      originalPrice: retailPrice
    }
  }

  // Calculate savings
  const savings = retailPrice - bestPrice

  return {
    price: bestPrice,
    tierName: bestTier.tierName || `Wholesale (${bestTier.minQuantity}+)`,
    savings: savings,
    originalPrice: retailPrice
  }
}

/**
 * Get all available pricing tiers for display
 * @param {Object} product - The product object with pricing structure
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {Array} - Array of pricing tiers
 */
export function getPricingTiers(product, selectedOption = null, selectedColor = null) {
  // If color is selected, use color-specific pricing
  if (selectedColor && product.colorOptions) {
    const colorItem = product.colorOptions.find(color => color.color === selectedColor)
    if (colorItem) {
      return getPricingTiersByColor(colorItem)
    }
  }

  // If option is selected, use option-specific pricing
  if (selectedOption && product.sizeOptions) {
    const optionItem = product.sizeOptions.find(option => option.size === selectedOption)
    if (optionItem) {
      return getPricingTiersByOption(optionItem)
    }
  }

  if (!product.pricing || !product.pricing.retailPrice) {
    return [{
      minQuantity: 1,
      maxQuantity: null,
      price: product.price || 0,
      tierName: 'Retail'
    }]
  }

  const tiers = [{
    minQuantity: 1,
    maxQuantity: null,
    price: product.pricing.retailPrice,
    tierName: 'Retail'
  }]

  if (product.pricing.wholesaleTiers) {
    tiers.push(...product.pricing.wholesaleTiers.map(tier => ({
      ...tier,
      tierName: tier.tierName || `Wholesale (${tier.minQuantity}+)`
    })))
  }

  return tiers.sort((a, b) => a.minQuantity - b.minQuantity)
}

/**
 * Get all available pricing tiers for a specific color
 * @param {Object} colorItem - The color object with pricing structure
 * @returns {Array} - Array of pricing tiers
 */
export function getPricingTiersByColor(colorItem) {
  const retailPrice = colorItem.retailPrice || 0

  const tiers = [{
    minQuantity: 1,
    maxQuantity: null,
    price: retailPrice,
    tierName: 'Retail'
  }]

  if (colorItem.wholesaleTiers) {
    tiers.push(...colorItem.wholesaleTiers.map(tier => ({
      ...tier,
      tierName: tier.tierName || `Wholesale (${tier.minQuantity}+)`
    })))
  }

  return tiers.sort((a, b) => a.minQuantity - b.minQuantity)
}

/**
 * Get all available pricing tiers for a specific option
 * @param {Object} optionItem - The option object with pricing structure
 * @returns {Array} - Array of pricing tiers
 */
export function getPricingTiersByOption(optionItem) {
  const retailPrice = optionItem.retailPrice || 0

  const tiers = [{
    minQuantity: 1,
    maxQuantity: null,
    price: retailPrice,
    tierName: 'Retail'
  }]

  if (optionItem.wholesaleTiers) {
    tiers.push(...optionItem.wholesaleTiers.map(tier => ({
      ...tier,
      tierName: tier.tierName || `Wholesale (${tier.minQuantity}+)`
    })))
  }

  return tiers.sort((a, b) => a.minQuantity - b.minQuantity)
}

/**
 * Get the current price for display (retail price)
 * @param {Object} product - The product object
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {number} - The retail price
 */
export function getCurrentPrice(product, selectedOption = null, selectedColor = null) {
  // If color is selected, use color-specific pricing
  if (selectedColor && product.colorOptions) {
    const colorItem = product.colorOptions.find(color => color.color === selectedColor)
    if (colorItem && colorItem.retailPrice) {
      return colorItem.retailPrice
    }
  }

  // If option is selected, use option-specific pricing
  if (selectedOption && product.sizeOptions) {
    const optionItem = product.sizeOptions.find(option => option.size === selectedOption)
    if (optionItem && optionItem.retailPrice) {
      return optionItem.retailPrice
    }
  }

  if (product.pricing && product.pricing.retailPrice) {
    return product.pricing.retailPrice
  }
  return product.price || 0
}

/**
 * Get the compare at price
 * @param {Object} product - The product object
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {number|null} - The compare at price
 */
export function getCompareAtPrice(product, selectedOption = null, selectedColor = null) {
  // If color is selected, use color-specific pricing
  if (selectedColor && product.colorOptions) {
    const colorItem = product.colorOptions.find(color => color.color === selectedColor)
    if (colorItem && colorItem.compareAtPrice) {
      return colorItem.compareAtPrice
    }
  }

  // If option is selected, use option-specific pricing
  if (selectedOption && product.sizeOptions) {
    const optionItem = product.sizeOptions.find(option => option.size === selectedOption)
    if (optionItem && optionItem.compareAtPrice) {
      return optionItem.compareAtPrice
    }
  }

  if (product.pricing && product.pricing.compareAtPrice) {
    return product.pricing.compareAtPrice
  }
  return product.compareAtPrice || null
}

/**
 * Get available color items for a product
 * @param {Object} product - The product object
 * @returns {Array} - Array of color strings
 */
export function getColorOptions(product) {
  // Handle both old string format and new array format
  if (Array.isArray(product.color)) {
    return product.color
  } else if (typeof product.color === 'string' && product.color.trim()) {
    // Convert comma-separated string to array
    return product.color.split(',').map(color => color.trim()).filter(color => color.length > 0)
  }
  return []
}

/**
 * Get available option items for a product
 * @param {Object} product - The product object
 * @returns {Array} - Array of option items
 */
export function getSizeOptions(product) {
  return product.sizeOptions || []
}

/**
 * Get the lowest price among all option items
 * @param {Object} product - The product object
 * @returns {number} - The lowest price
 */
export function getLowestPrice(product) {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return getCurrentPrice(product)
  }

  const prices = product.sizeOptions.map(option => option.retailPrice).filter(price => price > 0)
  return prices.length > 0 ? Math.min(...prices) : getCurrentPrice(product)
}

/**
 * Get the highest price among all option items
 * @param {Object} product - The product object
 * @returns {number} - The highest price
 */
export function getHighestPrice(product) {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return getCurrentPrice(product)
  }

  const prices = product.sizeOptions.map(option => option.retailPrice).filter(price => price > 0)
  return prices.length > 0 ? Math.max(...prices) : getCurrentPrice(product)
}

/**
 * Get the lowest-priced option item
 * @param {Object} product - The product object
 * @returns {Object|null} - The lowest-priced option item
 */
export function getLowestPricedOption(product) {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return null
  }

  const validOptions = product.sizeOptions.filter(option => option.retailPrice > 0)
  if (validOptions.length === 0) {
    return null
  }

  return validOptions.reduce((lowest, current) => 
    current.retailPrice < lowest.retailPrice ? current : lowest
  )
}

/**
 * Get the appropriate case quantity from wholesale tiers
 * @param {Object} product - The product object with pricing structure
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {number} - The case quantity (default: 24 if no wholesale tiers)
 */
export function getCaseQuantity(product, selectedOption = null, selectedColor = null) {
  // If color is selected, use color-specific pricing
  if (selectedColor && product.colorOptions) {
    const colorItem = product.colorOptions.find(color => color.color === selectedColor)
    if (colorItem && colorItem.wholesaleTiers && colorItem.wholesaleTiers.length > 0) {
      // Sort tiers by minQuantity and return the first (smallest case size)
      const sortedTiers = colorItem.wholesaleTiers.sort((a, b) => a.minQuantity - b.minQuantity)
      const caseQty = sortedTiers[0].minQuantity || 24
      console.log(`Case quantity for color ${selectedColor}: ${caseQty} (from wholesale tiers)`)
      return caseQty
    }
  }

  // If option is selected, use option-specific pricing
  if (selectedOption && product.sizeOptions) {
    const optionItem = product.sizeOptions.find(option => option.size === selectedOption)
    if (optionItem && optionItem.wholesaleTiers && optionItem.wholesaleTiers.length > 0) {
      // Sort tiers by minQuantity and return the first (smallest case size)
      const sortedTiers = optionItem.wholesaleTiers.sort((a, b) => a.minQuantity - b.minQuantity)
      const caseQty = sortedTiers[0].minQuantity || 24
      console.log(`Case quantity for option ${selectedOption}: ${caseQty} (from wholesale tiers)`)
      return caseQty
    }
  }

  // Check main product pricing
  if (product.pricing && product.pricing.wholesaleTiers && product.pricing.wholesaleTiers.length > 0) {
    // Sort tiers by minQuantity and return the first (smallest case size)
    const sortedTiers = product.pricing.wholesaleTiers.sort((a, b) => a.minQuantity - b.minQuantity)
    const caseQty = sortedTiers[0].minQuantity || 24
    console.log(`Case quantity for product ${product.title}: ${caseQty} (from wholesale tiers)`)
    return caseQty
  }

  // Default fallback
  console.log(`Case quantity for product ${product.title}: 24 (default fallback)`)
  return 24
}

/**
 * Get a price range display showing single unit price and case/wholesale price
 * @param {Object} product - The product object with pricing structure
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @param {number} caseQuantity - The quantity for case pricing (optional, will auto-detect if not provided)
 * @returns {Object} - Object containing formatted price range and individual prices
 */
export function getPriceRangeDisplay(product, selectedOption = null, selectedColor = null, caseQuantity = null) {
  // Get single unit price
  const singleUnitPrice = getCurrentPrice(product, selectedOption, selectedColor)
  
  // Auto-detect case quantity if not provided
  const actualCaseQuantity = caseQuantity || getCaseQuantity(product, selectedOption, selectedColor)
  
  // Get case price (price for the specified quantity)
  const casePriceInfo = getPriceForQuantity(product, actualCaseQuantity, selectedOption, selectedColor)
  const casePrice = casePriceInfo.price * actualCaseQuantity
  
  // Format the price range
  const formatPrice = (price) => `$${price.toFixed(2)}`
  
  let priceRange = formatPrice(singleUnitPrice)
  
  // Only show range if case price is different from single unit price
  if (casePrice !== singleUnitPrice) {
    priceRange += ` - ${formatPrice(casePrice)}`
  }
  
  return {
    priceRange,
    singleUnitPrice,
    casePrice,
    caseQuantity: actualCaseQuantity,
    hasRange: casePrice !== singleUnitPrice,
    singleUnitFormatted: formatPrice(singleUnitPrice),
    casePriceFormatted: formatPrice(casePrice)
  }
}

/**
 * Get a price range display for a specific color item
 * @param {Object} colorItem - The color object with pricing structure
 * @param {number} caseQuantity - The quantity for case pricing (optional, will auto-detect if not provided)
 * @returns {Object} - Object containing formatted price range and individual prices
 */
export function getPriceRangeDisplayByColor(colorItem, caseQuantity = null) {
  // Get single unit price
  const singleUnitPrice = colorItem.retailPrice || 0
  
  // Auto-detect case quantity if not provided
  const actualCaseQuantity = caseQuantity || (colorItem.wholesaleTiers && colorItem.wholesaleTiers.length > 0 
    ? colorItem.wholesaleTiers.sort((a, b) => a.minQuantity - b.minQuantity)[0].minQuantity 
    : 24)
  
  // Get case price (price for the specified quantity)
  const casePriceInfo = getPriceForQuantityByColor(colorItem, actualCaseQuantity)
  const casePrice = casePriceInfo.price * actualCaseQuantity
  
  // Format the price range
  const formatPrice = (price) => `$${price.toFixed(2)}`
  
  let priceRange = formatPrice(singleUnitPrice)
  
  // Only show range if case price is different from single unit price
  if (casePrice !== singleUnitPrice) {
    priceRange += ` - ${formatPrice(casePrice)}`
  }
  
  return {
    priceRange,
    singleUnitPrice,
    casePrice,
    caseQuantity: actualCaseQuantity,
    hasRange: casePrice !== singleUnitPrice,
    singleUnitFormatted: formatPrice(singleUnitPrice),
    casePriceFormatted: formatPrice(casePrice)
  }
}

/**
 * Get price range display for products with options, showing lowest price to wholesale price
 * @param {Object} product - The product object with options
 * @returns {Object} - Object containing formatted price range and individual prices
 */
export function getPriceRangeDisplayWithOptions(product) {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return getPriceRangeDisplay(product)
  }

  // Get the lowest-priced option
  const lowestOption = getLowestPricedOption(product)
  if (!lowestOption) {
    return getPriceRangeDisplay(product)
  }

  // Get case quantity from the lowest-priced option
  const caseQuantity = getCaseQuantity(product, lowestOption.size)
  
  // Get wholesale price for the case quantity
  const casePriceInfo = getPriceForQuantityByOption(lowestOption, caseQuantity)
  const casePrice = casePriceInfo.price * caseQuantity

  // Format the price range
  const formatPrice = (price) => `$${price.toFixed(2)}`
  
  const priceRange = `${formatPrice(lowestOption.retailPrice)} - ${formatPrice(casePrice)}`
  
  return {
    priceRange,
    singleUnitPrice: lowestOption.retailPrice,
    casePrice,
    caseQuantity,
    hasRange: true,
    singleUnitFormatted: formatPrice(lowestOption.retailPrice),
    casePriceFormatted: formatPrice(casePrice),
    lowestOption
  }
} 

/**
 * Get pricing tiers with total case prices for display
 * @param {Object} product - The product object with pricing structure
 * @param {string} selectedOption - The selected option (optional)
 * @param {string} selectedColor - The selected color (optional)
 * @returns {Array} - Array of pricing tiers with total case prices
 */
export function getPricingTiersWithCasePrices(product, selectedOption = null, selectedColor = null) {
  const tiers = getPricingTiers(product, selectedOption, selectedColor)
  
  return tiers.map(tier => {
    const totalPrice = tier.price * tier.minQuantity
    return {
      ...tier,
      totalPrice,
      totalPriceFormatted: `$${totalPrice.toFixed(2)}`,
      priceFormatted: `$${tier.price.toFixed(2)}`
    }
  })
} 

/**
 * Get price range display for products with colors, showing lowest price to wholesale price
 * @param {Object} product - The product object with colors
 * @returns {Object} - Object containing formatted price range and individual prices
 */
export function getPriceRangeDisplayWithColors(product) {
  if (!product.color || (Array.isArray(product.color) && product.color.length === 0)) {
    return getPriceRangeDisplay(product)
  }

  // Get the current price (single unit)
  const singleUnitPrice = getCurrentPrice(product)
  
  // Get case quantity from the product
  const caseQuantity = getCaseQuantity(product)
  
  // Get wholesale price for the case quantity
  const casePriceInfo = getPriceForQuantity(product, caseQuantity)
  const casePrice = casePriceInfo.price * caseQuantity

  // Format the price range
  const formatPrice = (price) => `$${price.toFixed(2)}`
  
  const priceRange = `${formatPrice(singleUnitPrice)} - ${formatPrice(casePrice)}`
  
  return {
    priceRange,
    singleUnitPrice,
    casePrice,
    caseQuantity,
    hasRange: true,
    singleUnitFormatted: formatPrice(singleUnitPrice),
    casePriceFormatted: formatPrice(casePrice)
  }
} 