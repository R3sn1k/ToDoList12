import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/sanity"
import { updateTodo, deleteTodo } from "@/lib/sanity-utils"

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

    const todo = await client.fetch(`*[_type == "todo" && _id == $id && user._ref == $userId][0] {
      _id,
      title,
      description,
      completed,
      createdAt,
      user->{
        _id,
        username,
        email
      }
    }`, { id, userId: session.user.id })

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
    const { title, description, completed } = await request.json()

    // Check if todo exists and belongs to user
    const existingTodo = await client.fetch(`*[_type == "todo" && _id == $id && user._ref == $userId][0]`, {
      id,
      userId: session.user.id
    })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const updates: Record<string, string | boolean> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (completed !== undefined) updates.completed = completed

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

    // Check if todo exists and belongs to user
    const existingTodo = await client.fetch(`*[_type == "todo" && _id == $id && user._ref == $userId][0]`, {
      id,
      userId: session.user.id
    })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    await deleteTodo(id)

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
