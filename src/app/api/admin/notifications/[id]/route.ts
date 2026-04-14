import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client } from "@/lib/sanity"
import { deleteNotification } from "@/lib/sanity-utils"

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

    const existingNotification = await client.fetch(
      `*[_type == "notification" && _id == $id][0]`,
      { id }
    )

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await deleteNotification(id)

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
