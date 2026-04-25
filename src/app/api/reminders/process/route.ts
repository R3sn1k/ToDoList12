import { NextRequest, NextResponse } from "next/server"
import { getTodosDueForReminder, updateTodo } from "@/lib/sanity-utils"
import { isReminderEmailConfigured, sendTaskReminderEmail } from "@/lib/mail"

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }

  return request.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isReminderEmailConfigured()) {
    return NextResponse.json(
      {
        sent: 0,
        skipped: 0,
        message: "RESEND_API_KEY or REMINDER_FROM_EMAIL is not configured.",
      },
      { status: 200 }
    )
  }

  try {
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

    return NextResponse.json({ sent, failed, scanned: todos.length })
  } catch (error) {
    console.error("Reminder processing error:", error)
    return NextResponse.json({ error: "Reminder processing failed." }, { status: 500 })
  }
}
