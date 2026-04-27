import { getTodosDueForReminder, updateTodo } from "@/lib/sanity-utils"
import { isReminderEmailConfigured, sendTaskReminderEmail } from "@/lib/mail"

export async function processReminderEmails() {
  if (!isReminderEmailConfigured()) {
    return {
      sent: 0,
      failed: 0,
      scanned: 0,
      configured: false,
      message: "Gmail SMTP email configuration is not set.",
    }
  }

  const todos = await getTodosDueForReminder()
  let sent = 0
  let failed = 0

  for (const todo of todos) {
    try {
      await sendTaskReminderEmail(todo)
      await updateTodo(todo._id, { reminderSentAt: new Date().toISOString() })
      sent += 1
    } catch (error) {
      failed += 1
      console.error(`Reminder processing failed for todo ${todo._id}:`, error)
    }
  }

  return {
    sent,
    failed,
    scanned: todos.length,
    configured: true,
  }
}
