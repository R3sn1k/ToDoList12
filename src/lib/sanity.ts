import { createClient } from "@sanity/client"
import { createImageUrlBuilder } from "@sanity/image-url"

function getRequiredEnv(
  publicName: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET",
  serverName: "SANITY_PROJECT_ID" | "SANITY_DATASET"
) {
  const value = process.env[publicName] ?? process.env[serverName]

  if (!value) {
    throw new Error(`Missing Sanity environment variable: ${publicName} or ${serverName}`)
  }

  return value
}

export const sanityProjectId = getRequiredEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_PROJECT_ID")
export const sanityDataset = getRequiredEnv("NEXT_PUBLIC_SANITY_DATASET", "SANITY_DATASET")

export const client = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: unknown) {
  return builder.image(source as never)
}
