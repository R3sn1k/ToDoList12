import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { respondToNotification } from "@/lib/sanity-utils"

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
    const { status } = await request.json()

    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json({ error: "Neveljaven odgovor." }, { status: 400 })
    }

    const response = await respondToNotification({
      notificationId: id,
      userId: session.user.id,
      status,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error responding to notification:", error)

    if (error instanceof Error && error.message === "Notification expired") {
      return NextResponse.json({ error: "To obvestilo je ze poteklo." }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
