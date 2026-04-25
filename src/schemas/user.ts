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
      title: "Uporabnisko ime",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "passwordHash",
      title: "Zgosceno geslo",
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
      name: "authProvider",
      title: "Nacin prijave",
      type: "string",
      options: {
        list: [
          { title: "Clerk", value: "clerk" },
          { title: "E-posta in geslo", value: "credentials" },
          { title: "Google", value: "google" },
        ],
      },
      initialValue: "clerk",
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "googleId",
      title: "Google ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "avatarUrl",
      title: "Avatar URL",
      type: "url",
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
