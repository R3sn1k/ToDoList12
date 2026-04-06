import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { passwordSchema } from "@/lib/password"
import { getUserById, updateUserPassword } from "@/lib/sanity-utils"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vnesi trenutno geslo"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Potrdi novo geslo"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Novi gesli se ne ujemata",
    path: ["confirmPassword"],
  })

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const result = changePasswordSchema.safeParse(payload)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Neveljavni podatki" },
        { status: 400 }
      )
    }

    const user = await getUserById(session.user.id)

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Uporabnika ni bilo mogoce preveriti." },
        { status: 400 }
      )
    }

    const passwordMatches = await bcrypt.compare(
      result.data.currentPassword,
      user.passwordHash
    )

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Trenutno geslo ni pravilno." },
        { status: 400 }
      )
    }

    if (result.data.currentPassword === result.data.newPassword) {
      return NextResponse.json(
        { error: "Novo geslo mora biti drugacno od trenutnega." },
        { status: 400 }
      )
    }

    const nextPasswordHash = await bcrypt.hash(result.data.newPassword, 12)
    await updateUserPassword(session.user.id, nextPasswordHash)

    return NextResponse.json({ message: "Geslo je bilo uspesno zamenjano." })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Pri menjavi gesla je prislo do napake." },
      { status: 500 }
    )
  }
}
