"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return (
    <SessionProvider baseUrl={baseUrl}>
      {children}
    </SessionProvider>
  )
}