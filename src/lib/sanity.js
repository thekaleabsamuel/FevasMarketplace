import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'gxd460pf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: import.meta.env.VITE_SANITY_TOKEN,
  perspective: 'published',
}) 