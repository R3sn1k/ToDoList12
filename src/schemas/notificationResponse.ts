import { defineField, defineType } from "sanity"

export const notificationResponse = defineType({
  name: "notificationResponse",
  title: "Odziv na obvestilo",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Sprejeto", value: "accepted" },
          { title: "Zavrnjeno", value: "declined" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "notification",
      title: "Obvestilo",
      type: "reference",
      to: [{ type: "notification" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "user",
      title: "Uporabnik",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdTodo",
      title: "Ustvarjena naloga",
      type: "reference",
      to: [{ type: "todo" }],
    }),
    defineField({
      name: "respondedAt",
      title: "Odgovorjeno",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
