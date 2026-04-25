import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server"
import {
  createUser,
  getUserByClerkId,
  getUserByEmail,
  getUserByUsername,
  updateUser,
} from "@/lib/sanity-utils"

export interface AppSession {
  user: {
    id: string
    clerkUserId: string
    email: string
    name: string
    role: string
    authProvider: "clerk"
    hasPassword: boolean
    image?: string | null
  }
}

function slugifyUsername(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 24)
}

async function createUniqueUsername(input: string) {
  const base = slugifyUsername(input) || `user-${crypto.randomUUID().slice(0, 8)}`

  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`
    const existing = await getUserByUsername(candidate)
    if (!existing) {
      return candidate
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}

function getDisplayName(input: {
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string
}) {
  if (input.username?.trim()) return input.username.trim()

  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim()
  if (fullName) return fullName

  if (input.email) return input.email.split("@")[0] ?? "user"

  return "user"
}

export async function auth(): Promise<AppSession | null> {
  const { userId } = await clerkAuth()

  if (!userId) {
    return null
  }

  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ??
    clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ??
    ""

  if (!email) {
    return null
  }

  const avatarUrl = clerkUser.imageUrl ?? undefined
  let user = await getUserByClerkId(userId)

  if (!user) {
    user = await getUserByEmail(email)
  }

  if (!user) {
    const username = await createUniqueUsername(
      getDisplayName({
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email,
      })
    )

    user = await createUser({
      email,
      username,
      passwordHash: "",
      recoveryCodeHash: "",
      role: "user",
      authProvider: "clerk",
      clerkUserId: userId,
      avatarUrl,
    })
  } else {
    const updates: {
      email?: string
      authProvider?: "clerk"
      clerkUserId?: string
      avatarUrl?: string
    } = {}

    if (user.email !== email) updates.email = email
    if (user.authProvider !== "clerk") updates.authProvider = "clerk"
    if (user.clerkUserId !== userId) updates.clerkUserId = userId
    if (avatarUrl && user.avatarUrl !== avatarUrl) updates.avatarUrl = avatarUrl

    if (Object.keys(updates).length > 0) {
      user = await updateUser(user._id, updates)
    }
  }

  return {
    user: {
      id: user._id,
      clerkUserId: userId,
      email: user.email,
      name: user.username,
      role: user.role,
      authProvider: "clerk",
      hasPassword: false,
      image: user.avatarUrl ?? null,
    },
  }
}
