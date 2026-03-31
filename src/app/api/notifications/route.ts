import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createNotification, getNotificationsForUser } from "@/lib/sanity-utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await getNotificationsForUser(session.user.id)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, dueDate } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Naslov je obvezen." }, { status: 400 })
    }

    const notification = await createNotification({
      title,
      description,
      dueDate: dueDate || undefined,
      createdById: session.user.id,
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
