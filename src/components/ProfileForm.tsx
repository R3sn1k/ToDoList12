"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: user.name ?? "",
    email: user.email ?? "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError("")
    setProfileSuccess("")
    setProfileLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error ?? "Napaka pri posodobitvi profila.")
        return
      }

      setProfileSuccess(data.message ?? "Profil uspesno posodobljen.")
      router.refresh()
    } catch (err) {
      console.error("Profile update error:", err)
      setProfileError("Napaka pri posodobitvi profila.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    setPasswordLoading(true)

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error ?? "Napaka pri menjavi gesla.")
        return
      }

      setPasswordSuccess(data.message ?? "Geslo je bilo uspesno zamenjano.")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Password update error:", err)
      setPasswordError("Napaka pri menjavi gesla.")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Uporabnisko ime</span>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={(event) =>
                setFormData((current) => ({ ...current, username: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">E-posta</span>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Vloga</p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {user.role === "admin" ? "Administrator" : "Uporabnik"}
          </p>
        </div>

        {profileError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {profileError}
          </p>
        ) : null}

        {profileSuccess ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {profileSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={profileLoading}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profileLoading ? "Shranjujem..." : "Shrani spremembe"}
        </button>
      </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Menjava gesla</h2>
            <p className="mt-1 text-sm text-slate-500">
              Za varnost racuna vnesi trenutno geslo in izberi novo.
            </p>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Trenutno geslo</span>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(event) =>
                setPasswordData((current) => ({ ...current, currentPassword: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Novo geslo</span>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  setPasswordData((current) => ({ ...current, newPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Potrdi novo geslo</span>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  setPasswordData((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              />
            </label>
          </div>

          {passwordError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {passwordError}
            </p>
          ) : null}

          {passwordSuccess ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {passwordSuccess}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-2xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordLoading ? "Menjam geslo..." : "Zamenjaj geslo"}
          </button>
        </form>
      </div>
    </div>
  )
}
