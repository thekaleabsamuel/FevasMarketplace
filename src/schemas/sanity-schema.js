import { createSchema } from 'sanity'
import product from './product'
import category from './category'

const schemaTypes = [product, category]

export default createSchema({
  name: 'default',
  types: schemaTypes,
})

