import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getUserByEmail, getUserByUsername, updateUser } from "@/lib/sanity-utils"

const profileSchema = z.object({
  username: z.string().trim().min(3, "Uporabnisko ime mora imeti vsaj 3 znake"),
  email: z.email("Neveljaven e-naslov").trim(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const result = profileSchema.safeParse(payload)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Neveljavni podatki" },
        { status: 400 }
      )
    }

    const { username, email } = result.data
    const existingUsername = await getUserByUsername(username)

    if (session.user.authProvider === "clerk" && email !== session.user.email) {
      return NextResponse.json(
        { error: "E-posta se pri Clerk uporabnikih ureja v Clerk nastavitvah." },
        { status: 400 }
      )
    }

    if (email !== session.user.email) {
      const existingUser = await getUserByEmail(email)

      if (existingUser && existingUser._id !== session.user.id) {
        return NextResponse.json(
          { error: "E-postni naslov je ze v uporabi" },
          { status: 400 }
        )
      }
    }

    if (existingUsername && existingUsername._id !== session.user.id) {
      return NextResponse.json(
        { error: "Uporabnisko ime je ze v uporabi" },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(session.user.id, { username, email })

    return NextResponse.json({
      message: "Profil uspesno posodobljen",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.username,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Prislo je do napake pri posodabljanju profila" },
      { status: 500 }
    )
  }
}
