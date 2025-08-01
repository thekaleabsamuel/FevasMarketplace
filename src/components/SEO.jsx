import { useEffect } from 'react'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  structuredData 
}) => {
  const defaultTitle = 'Fevas - Wholesale E-commerce Marketplace'
  const defaultDescription = 'Discover premium wholesale products at competitive prices. Fevas offers a curated selection of high-quality items for businesses and resellers.'
  const defaultImage = 'https://fevasmarketplace.com/Fevas%20Logo.png'
  const defaultUrl = 'https://fevasmarketplace.com'

  const finalTitle = title ? `${title} | Fevas` : defaultTitle
  const finalDescription = description || defaultDescription
  const finalImage = image || defaultImage
  const finalUrl = url || defaultUrl

  useEffect(() => {
    // Update document title
    document.title = finalTitle
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', finalDescription)
    
    // Update Open Graph tags
    const updateMetaTag = (property, content) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`)
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('property', property)
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', content)
    }
    
    // Update Twitter tags
    const updateTwitterTag = (name, content) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`)
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', name)
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', content)
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = finalUrl
    
    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle)
    updateMetaTag('og:description', finalDescription)
    updateMetaTag('og:image', finalImage)
    updateMetaTag('og:url', finalUrl)
    updateMetaTag('og:type', type)
    
    // Update Twitter tags
    updateTwitterTag('twitter:card', 'summary_large_image')
    updateTwitterTag('twitter:title', finalTitle)
    updateTwitterTag('twitter:description', finalDescription)
    updateTwitterTag('twitter:image', finalImage)
    updateTwitterTag('twitter:url', finalUrl)
    
    // Add structured data if provided
    if (structuredData) {
      // Remove existing structured data
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
      existingScripts.forEach(script => {
        if (script.textContent.includes('"@type":"WebSite"')) {
          script.remove()
        }
      })
      
      // Add new structured data
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }
  }, [finalTitle, finalDescription, finalImage, finalUrl, type, structuredData])

  // This component doesn't render anything visible
  return null
}

export default SEO 