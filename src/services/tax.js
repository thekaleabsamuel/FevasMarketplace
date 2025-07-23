// Tax calculation service for region-specific tax rates
// This service calculates taxes based on customer address and order details

// US State Tax Rates (as of 2024) - you should verify and update these rates
const US_STATE_TAX_RATES = {
  'AL': 0.04, // Alabama
  'AK': 0.00, // Alaska (no state sales tax)
  'AZ': 0.056, // Arizona
  'AR': 0.065, // Arkansas
  'CA': 0.0725, // California
  'CO': 0.029, // Colorado
  'CT': 0.0635, // Connecticut
  'DE': 0.00, // Delaware (no state sales tax)
  'FL': 0.06, // Florida
  'GA': 0.04, // Georgia
  'HI': 0.04, // Hawaii
  'ID': 0.06, // Idaho
  'IL': 0.0625, // Illinois
  'IN': 0.07, // Indiana
  'IA': 0.06, // Iowa
  'KS': 0.065, // Kansas
  'KY': 0.06, // Kentucky
  'LA': 0.0445, // Louisiana
  'ME': 0.055, // Maine
  'MD': 0.06, // Maryland
  'MA': 0.0625, // Massachusetts
  'MI': 0.06, // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07, // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00, // Montana (no state sales tax)
  'NE': 0.055, // Nebraska
  'NV': 0.0685, // Nevada
  'NH': 0.00, // New Hampshire (no state sales tax)
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.04, // New York
  'NC': 0.0475, // North Carolina
  'ND': 0.05, // North Dakota
  'OH': 0.0575, // Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00, // Oregon (no state sales tax)
  'PA': 0.06, // Pennsylvania
  'RI': 0.07, // Rhode Island
  'SC': 0.06, // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07, // Tennessee
  'TX': 0.0625, // Texas
  'UT': 0.061, // Utah
  'VT': 0.06, // Vermont
  'VA': 0.053, // Virginia
  'WA': 0.065, // Washington
  'WV': 0.06, // West Virginia
  'WI': 0.05, // Wisconsin
  'WY': 0.04, // Wyoming
}

// Major city tax rates (additional to state tax)
const CITY_TAX_RATES = {
  'CA': {
    'Los Angeles': 0.01, // 1% additional city tax
    'San Francisco': 0.0085, // 0.85% additional city tax
    'San Diego': 0.008, // 0.8% additional city tax
  },
  'NY': {
    'New York': 0.045, // 4.5% additional city tax
  },
  'TX': {
    'Houston': 0.0125, // 1.25% additional city tax
    'Dallas': 0.02, // 2% additional city tax
    'Austin': 0.00825, // 0.825% additional city tax
  },
  'IL': {
    'Chicago': 0.0125, // 1.25% additional city tax
  },
  'FL': {
    'Miami': 0.01, // 1% additional city tax
    'Orlando': 0.005, // 0.5% additional city tax
  }
}

// Tax-exempt categories (for wholesale business considerations)
const TAX_EXEMPT_CATEGORIES = [
  'wholesale',
  'resale',
  'business',
  'commercial'
]

export class TaxService {
  /**
   * Calculate tax for an order based on customer address
   * @param {Object} address - Customer address object
   * @param {number} subtotal - Order subtotal
   * @param {Array} items - Order items (for category-based exemptions)
   * @returns {Object} Tax calculation result
   */
  static calculateTax(address, subtotal, items = []) {
    const { state, city, country = 'US' } = address
    
    // Handle international orders
    if (country !== 'US') {
      return this.calculateInternationalTax(address, subtotal, items)
    }
    
    // Get state tax rate
    const stateRate = US_STATE_TAX_RATES[state?.toUpperCase()] || 0
    
    // Get city tax rate
    const cityRate = this.getCityTaxRate(state, city)
    
    // Calculate total tax rate
    const totalTaxRate = stateRate + cityRate
    
    // Calculate tax amount
    const taxAmount = subtotal * totalTaxRate
    
    // Check for tax exemptions
    const exemptions = this.checkTaxExemptions(items, address)
    
    return {
      subtotal,
      stateRate,
      cityRate,
      totalTaxRate,
      taxAmount: exemptions.isExempt ? 0 : taxAmount,
      exemptions,
      breakdown: {
        state: {
          rate: stateRate,
          amount: exemptions.isExempt ? 0 : (subtotal * stateRate)
        },
        city: {
          rate: cityRate,
          amount: exemptions.isExempt ? 0 : (subtotal * cityRate)
        }
      }
    }
  }
  
  /**
   * Get city tax rate for a given state and city
   * @param {string} state - State code
   * @param {string} city - City name
   * @returns {number} City tax rate
   */
  static getCityTaxRate(state, city) {
    if (!state || !city) return 0
    
    const stateCities = CITY_TAX_RATES[state?.toUpperCase()]
    if (!stateCities) return 0
    
    // Try exact match first
    if (stateCities[city]) {
      return stateCities[city]
    }
    
    // Try case-insensitive match
    const cityKey = Object.keys(stateCities).find(
      key => key.toLowerCase() === city.toLowerCase()
    )
    
    return cityKey ? stateCities[cityKey] : 0
  }
  
  /**
   * Check for tax exemptions based on order items and customer info
   * @param {Array} items - Order items
   * @param {Object} address - Customer address
   * @returns {Object} Exemption information
   */
  static checkTaxExemptions(items, address) {
    // Check if customer has tax exemption certificate
    const hasExemptionCertificate = address.taxExempt || false
    
    // Check if items are for resale/wholesale
    const isWholesaleOrder = items.some(item => {
      const category = item.category?.toLowerCase() || ''
      const tags = (item.tags || []).map(tag => tag.toLowerCase())
      return TAX_EXEMPT_CATEGORIES.some(exempt => 
        category.includes(exempt) || tags.includes(exempt)
      )
    })
    
    // Check if order is large enough for wholesale consideration
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const isBulkOrder = totalQuantity >= 10 // Consider orders of 10+ items as bulk
    
    return {
      isExempt: hasExemptionCertificate || isWholesaleOrder || isBulkOrder,
      reasons: {
        hasExemptionCertificate,
        isWholesaleOrder,
        isBulkOrder
      }
    }
  }
  
  /**
   * Calculate international tax (simplified)
   * @param {Object} address - Customer address
   * @param {number} subtotal - Order subtotal
   * @param {Array} items - Order items
   * @returns {Object} Tax calculation result
   */
  static calculateInternationalTax(address, subtotal, items) {
    const { country } = address
    
    // Simplified international tax rates (you should implement proper international tax calculation)
    const internationalRates = {
      'CA': 0.05, // Canada GST
      'GB': 0.20, // UK VAT
      'DE': 0.19, // Germany VAT
      'FR': 0.20, // France VAT
      'AU': 0.10, // Australia GST
      'JP': 0.10, // Japan Consumption Tax
    }
    
    const taxRate = internationalRates[country] || 0
    const taxAmount = subtotal * taxRate
    
    return {
      subtotal,
      stateRate: 0,
      cityRate: 0,
      totalTaxRate: taxRate,
      taxAmount,
      exemptions: { isExempt: false, reasons: {} },
      breakdown: {
        international: {
          rate: taxRate,
          amount: taxAmount,
          country
        }
      }
    }
  }
  
  /**
   * Get tax rate for a specific location
   * @param {string} state - State code
   * @param {string} city - City name (optional)
   * @param {string} country - Country code (default: US)
   * @returns {number} Total tax rate
   */
  static getTaxRate(state, city = '', country = 'US') {
    if (country !== 'US') {
      const internationalRates = {
        'CA': 0.05, 'GB': 0.20, 'DE': 0.19, 'FR': 0.20, 'AU': 0.10, 'JP': 0.10
      }
      return internationalRates[country] || 0
    }
    
    const stateRate = US_STATE_TAX_RATES[state?.toUpperCase()] || 0
    const cityRate = this.getCityTaxRate(state, city)
    
    return stateRate + cityRate
  }
  
  /**
   * Format tax breakdown for display
   * @param {Object} taxCalculation - Tax calculation result
   * @returns {Array} Formatted tax breakdown
   */
  static formatTaxBreakdown(taxCalculation) {
    const breakdown = []
    
    if (taxCalculation.breakdown.state && taxCalculation.breakdown.state.rate > 0) {
      breakdown.push({
        label: 'State Tax',
        rate: taxCalculation.breakdown.state.rate,
        amount: taxCalculation.breakdown.state.amount
      })
    }
    
    if (taxCalculation.breakdown.city && taxCalculation.breakdown.city.rate > 0) {
      breakdown.push({
        label: 'City Tax',
        rate: taxCalculation.breakdown.city.rate,
        amount: taxCalculation.breakdown.city.amount
      })
    }
    
    if (taxCalculation.breakdown.international) {
      breakdown.push({
        label: `${taxCalculation.breakdown.international.country} Tax`,
        rate: taxCalculation.breakdown.international.rate,
        amount: taxCalculation.breakdown.international.amount
      })
    }
    
    return breakdown
  }
}

// Export default tax rates for reference
export const TAX_RATES = {
  US_STATE_TAX_RATES,
  CITY_TAX_RATES
} 