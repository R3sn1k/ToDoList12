import { defineField, defineType } from "sanity"

export const notification = defineType({
  name: "notification",
  title: "Obvestilo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Naslov",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
    }),
    defineField({
      name: "dueDate",
      title: "Rok",
      type: "datetime",
    }),
    defineField({
      name: "createdBy",
      title: "Ustvaril",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Ustvarjeno",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
