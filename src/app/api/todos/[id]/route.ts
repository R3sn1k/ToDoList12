import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteTodo, getTodoByIdForUser, updateTodo } from "@/lib/sanity-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const todo = await getTodoByIdForUser(id, session.user.id)

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Error fetching todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const {
      title,
      description,
      completed,
      dueDate,
      priority,
      priorityRank,
      reminderEnabled,
      subtasks,
    } = await request.json()

    const existingTodo = await getTodoByIdForUser(id, session.user.id)

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const updates: {
      title?: string
      description?: string
      completed?: boolean
      dueDate?: string | null
      priority?: boolean
      priorityRank?: number
      reminderEnabled?: boolean
      subtasks?: { _key?: string; title: string; completed: boolean }[]
    } = {}

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (completed !== undefined) updates.completed = completed
    if (dueDate !== undefined) updates.dueDate = dueDate
    if (priority !== undefined) updates.priority = priority
    if (priorityRank !== undefined) updates.priorityRank = priorityRank
    if (reminderEnabled !== undefined) updates.reminderEnabled = reminderEnabled
    if (subtasks !== undefined) updates.subtasks = subtasks

    const updatedTodo = await updateTodo(id, updates)

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingTodo = await getTodoByIdForUser(id, session.user.id)

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    if (existingTodo.isNotificationTask) {
      return NextResponse.json(
        { error: "Naloge, sprejete iz obvestil, ni mogoce izbrisati." },
        { status: 403 }
      )
    }

    if (
      existingTodo.user._id === session.user.id &&
      existingTodo.createdBy._id !== session.user.id
    ) {
      await updateTodo(id, {
        userId: existingTodo.createdBy._id,
        priority: false,
        priorityRank: 999,
      })

      return NextResponse.json({ message: "Todo removed from user profile" })
    }

    await deleteTodo(id)

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
