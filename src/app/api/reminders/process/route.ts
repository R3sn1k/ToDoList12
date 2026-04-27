import { NextRequest, NextResponse } from "next/server"
import { processReminderEmails } from "@/lib/reminders"

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

  try {
    const result = await processReminderEmails()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Reminder processing error:", error)
    return NextResponse.json({ error: "Reminder processing failed." }, { status: 500 })
  }
}
