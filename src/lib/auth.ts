import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/sanity-utils"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        if (!email || !password) {
          return null
        }

        const user = await getUserByEmail(email)

        if (!user?.passwordHash || !user.recoveryCodeHash) {
          return null
        }

        const [isValidPassword, isValidRecoveryCode] = await Promise.all([
          bcrypt.compare(password, user.passwordHash),
          bcrypt.compare(password, user.recoveryCodeHash),
        ])

        if (!isValidPassword && !isValidRecoveryCode) {
          return null
        }

        return {
          id: user._id,
          email: user.email,
          name: user.username,
          role: user.role ?? "user",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = typeof token.role === "string" ? token.role : "user"
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export function auth() {
  return getServerSession(authOptions)
}

const handler = NextAuth(authOptions)

export { handler }
