import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { passwordSchema } from "@/lib/password"
import { getUserByEmail, updateUserPassword } from "@/lib/sanity-utils"

const recoveryResetSchema = z
  .object({
    email: z.email("Vnesi veljaven e-naslov").trim(),
    recoveryCode: z.string().trim().min(1, "Vnesi recovery kodo"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Potrdi novo geslo"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Gesli se ne ujemata",
    path: ["confirmPassword"],
  })

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const result = recoveryResetSchema.safeParse(payload)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Neveljavni podatki" },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(result.data.email)

    if (!user?.recoveryCodeHash) {
      return NextResponse.json(
        { error: "Uporabnik ali recovery koda nista pravilna." },
        { status: 400 }
      )
    }

    const recoveryCodeMatches = await bcrypt.compare(
      result.data.recoveryCode,
      user.recoveryCodeHash
    )

    if (!recoveryCodeMatches) {
      return NextResponse.json(
        { error: "Uporabnik ali recovery koda nista pravilna." },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(result.data.newPassword, 12)
    await updateUserPassword(user._id, passwordHash)

    return NextResponse.json({ message: "Geslo je bilo uspesno ponastavljeno." })
  } catch (error) {
    console.error("Recovery reset error:", error)
    return NextResponse.json(
      { error: "Ponastavitev gesla z recovery kodo ni uspela." },
      { status: 500 }
    )
  }
}
