import { defineField, defineType } from "sanity"

export const taskInvitation = defineType({
  name: "taskInvitation",
  title: "Task Invitation",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Recipient Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: ["pending", "accepted", "declined"],
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "todo",
      title: "Task",
      type: "reference",
      to: [{ type: "todo" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "recipient",
      title: "Recipient User",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "respondedAt",
      title: "Responded At",
      type: "datetime",
    }),
  ],
})
