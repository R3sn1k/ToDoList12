import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { respondToTaskInvitation } from "@/lib/sanity-utils"

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
      return NextResponse.json({ error: "Invalid invitation status" }, { status: 400 })
    }

    const invitation = await respondToTaskInvitation({
      invitationId: id,
      userId: session.user.id,
      status,
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Error responding to invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
