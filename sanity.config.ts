import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./src/schemas"
import { sanityDataset, sanityProjectId } from "./src/lib/sanity"

export default defineConfig({
  name: "default",
  title: "ToDo App",
  basePath: "/studio",

  projectId: sanityProjectId,
  dataset: sanityDataset,

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
