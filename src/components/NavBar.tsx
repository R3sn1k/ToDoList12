"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useClerk } from "@clerk/nextjs"
import type { AppSession } from "@/lib/auth"

interface NavBarProps {
  title?: string
  session: AppSession
}

export function NavBar({ title = "TaskFlow", session }: NavBarProps) {
  const [open, setOpen] = useState(false)
  const { signOut } = useClerk()

  if (!session?.user) {
    return null
  }

  const links = [
    { href: "/dashboard", label: "Pregled" },
    { href: "/profile", label: "Profil" },
    ...(session.user.role === "admin" ? [{ href: "/admin", label: "Skrbnik" }] : []),
  ]

  return (
    <nav className="sticky top-0 z-30 border-b border-white/30 bg-[rgba(244,239,229,0.76)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">TaskFlow</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h1>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 md:hidden"
          aria-expanded={open}
          aria-label="Odpri navigacijo"
        >
          Meni
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 rounded-full border border-white/50 bg-white/60 px-3 py-2 text-sm text-slate-600">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Uporabnik"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                {(session.user.name ?? "U").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className="font-medium text-slate-800">{session.user.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Clerk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Odjava
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/40 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-3xl bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <p className="px-4 py-2 text-sm text-slate-500">{session.user.name}</p>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="rounded-3xl bg-slate-950 px-4 py-3 text-left text-sm font-medium text-white"
            >
              Odjava
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
