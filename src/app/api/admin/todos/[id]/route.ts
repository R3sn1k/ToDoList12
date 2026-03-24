import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/sanity"
import { updateTodo, deleteTodo } from "@/lib/sanity-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { completed } = await request.json()

    // Check if todo exists
    const existingTodo = await client.fetch(`*[_type == "todo" && _id == $id][0]`, { id })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    await updateTodo(id, { completed })

    // Fetch the updated todo with user info
    const todoWithUser = await client.fetch(`*[_type == "todo" && _id == $id][0] {
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
    }`, { id })

    return NextResponse.json(todoWithUser)
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

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if todo exists
    const existingTodo = await client.fetch(`*[_type == "todo" && _id == $id][0]`, { id })

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
