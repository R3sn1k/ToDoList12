import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { reorderPriorityTodos } from "@/lib/sanity-utils"

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const orderedTodoIds = Array.isArray(payload.orderedTodoIds) ? payload.orderedTodoIds : []

    await reorderPriorityTodos(session.user.id, orderedTodoIds)

    return NextResponse.json({ message: "Priority order updated" })
  } catch (error) {
    console.error("Error reordering priorities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
