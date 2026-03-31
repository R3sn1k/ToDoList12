import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  createTaskInvitation,
  getTaskInvitationsForUser,
  getTodoByIdForUser,
} from "@/lib/sanity-utils"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invitations = await getTaskInvitationsForUser(session.user.email, session.user.id)
    return NextResponse.json(invitations)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { todoId, email } = await request.json()

    if (!todoId || !email) {
      return NextResponse.json({ error: "Todo and email are required" }, { status: 400 })
    }

    const todo = await getTodoByIdForUser(todoId, session.user.id)

    if (!todo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const invitation = await createTaskInvitation({
      todoId,
      senderId: session.user.id,
      email,
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
