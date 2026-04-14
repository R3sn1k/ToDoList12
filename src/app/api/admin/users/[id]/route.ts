import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserById, getUsers, deleteUser } from "@/lib/sanity-utils"

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

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Trenutno prijavljenega administratorja ni mogoce izbrisati." },
        { status: 400 }
      )
    }

    const existingUser = await getUserById(id)

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (existingUser.role === "admin") {
      const users = await getUsers()
      const adminCount = users.filter((user) => user.role === "admin").length

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Zadnjega administratorja ni mogoce izbrisati." },
          { status: 400 }
        )
      }
    }

    await deleteUser(id)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
