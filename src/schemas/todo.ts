import { defineArrayMember, defineField, defineType } from "sanity"

export const todo = defineType({
  name: "todo",
  title: "Task",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "completed",
      title: "Completed",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "priorityRank",
      title: "Priority Rank",
      type: "number",
      initialValue: 999,
    }),
    defineField({
      name: "dueDate",
      title: "Due Date",
      type: "datetime",
    }),
    defineField({
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    }),
    defineField({
      name: "subtasks",
      title: "Subtasks",
      type: "array",
      of: [
        defineArrayMember({
          name: "subtask",
          title: "Subtask",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "completed",
              title: "Completed",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "title",
              completed: "completed",
            },
            prepare({ title, completed }) {
              return {
                title,
                subtitle: completed ? "Completed" : "Active",
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: "user",
      title: "Active Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdBy",
      title: "Created By",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
