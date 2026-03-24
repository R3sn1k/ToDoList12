import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const config = {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
}

export const client = createClient(config)

const builder = createImageUrlBuilder(client)

export function urlFor(source: unknown) {
  return builder.image(source as never)
}
