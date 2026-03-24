import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { createUser, getUserByEmail } from "@/lib/sanity-utils"

const signupSchema = z.object({
  email: z.email("Neveljaven e-naslov").trim(),
  username: z.string().trim().min(3, "Uporabnisko ime mora imeti vsaj 3 znake"),
  password: z
    .string()
    .min(8, "Geslo mora biti dolgo vsaj 8 znakov")
    .regex(/[A-Za-z]/, "Geslo mora vsebovati vsaj eno crko")
    .regex(/[0-9]/, "Geslo mora vsebovati vsaj eno stevilko"),
})

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const result = signupSchema.safeParse(payload)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Neveljavni podatki" },
        { status: 400 }
      )
    }

    const { email, username, password } = result.data
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: "Uporabnik s tem e-postnim naslovom ze obstaja" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createUser({
      email,
      username,
      passwordHash,
      role: "user",
    })

    return NextResponse.json(
      { message: "Uporabnik uspesno ustvarjen", userId: user._id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)

    const message =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      error.statusCode === 403
        ? "Sanity API token nima pravice za ustvarjanje uporabnikov."
        : "Prislo je do napake pri registraciji"

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
