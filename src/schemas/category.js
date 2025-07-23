export default {
  name: 'category',
  type: 'document',
  title: 'Category',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Category Title',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Category Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      type: 'text',
      title: 'Category Description'
    },
    {
      name: 'image',
      type: 'image',
      title: 'Category Image',
      options: {
        hotspot: true,
      }
    },
    {
      name: 'parent',
      type: 'reference',
      title: 'Parent Category',
      to: [{ type: 'category' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
} 