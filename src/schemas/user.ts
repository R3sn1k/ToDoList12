import { defineField, defineType } from "sanity"

export const user = defineType({
  name: "user",
  title: "Uporabnik",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "E-posta",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "username",
      title: "Uporabniško ime",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "passwordHash",
      title: "Zgoščeno geslo",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "recoveryCodeHash",
      title: "Zgoscena recovery koda",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Vloga",
      type: "string",
      options: {
        list: [
          { title: "Uporabnik", value: "user" },
          { title: "Skrbnik", value: "admin" },
        ],
      },
      initialValue: "user",
    }),
    defineField({
      name: "createdAt",
      title: "Ustvarjeno",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
