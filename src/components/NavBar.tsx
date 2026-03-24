"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

interface NavBarProps {
  title?: string
}

export function NavBar({ title = "TaskFlow" }: NavBarProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profil" },
    ...(session.user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <nav className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">ToDo App</p>
          <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
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
              className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <span className="text-sm text-slate-500">Prijavljen: {session.user.name}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Odjava
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <p className="px-4 py-2 text-sm text-slate-500">{session.user.name}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-medium text-white"
            >
              Odjava
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
