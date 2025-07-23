export default {
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Product Title',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Product Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      type: 'text',
      title: 'Product Description'
    },
    {
      name: 'price',
      type: 'number',
      title: 'Price',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      title: 'Compare at Price (for sales)'
    },
    {
      name: 'images',
      type: 'array',
      title: 'Product Images',
      of: [{ type: 'image' }],
      options: {
        hotspot: true,
      }
    },
    {
      name: 'category',
      type: 'reference',
      title: 'Category',
      to: [{ type: 'category' }]
    },
    {
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'inStock',
      type: 'boolean',
      title: 'In Stock',
      initialValue: true
    },
    {
      name: 'sku',
      type: 'string',
      title: 'SKU'
    },
    {
      name: 'weight',
      type: 'number',
      title: 'Weight (in grams)'
    },
    {
      name: 'dimensions',
      type: 'object',
      title: 'Dimensions',
      fields: [
        { name: 'length', type: 'number', title: 'Length (cm)' },
        { name: 'width', type: 'number', title: 'Width (cm)' },
        { name: 'height', type: 'number', title: 'Height (cm)' }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0',
      price: 'price'
    },
    prepare(selection) {
      const { title, media, price } = selection
      return {
        title: title,
        subtitle: `$${price}`,
        media: media
      }
    }
  }
}