"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [recoveryReset, setRecoveryReset] = useState({
    email: "",
    recoveryCode: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  useEffect(() => {
    const message = new URLSearchParams(window.location.search).get("message") ?? ""
    setSuccessMessage(message)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Izpolni e-posto in geslo.")
      return
    }

    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Napacna e-posta, geslo ali recovery koda.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError("Prijava ni uspela.")
    } finally {
      setLoading(false)
    }
  }

  const handleRecoveryReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccessMessage("")
    setRecoveryLoading(true)

    try {
      const response = await fetch("/api/auth/recovery-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recoveryReset),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Ponastavitev gesla ni uspela.")
        return
      }

      setSuccessMessage(data.message ?? "Geslo je bilo uspesno ponastavljeno.")
      setRecoveryReset({
        email: "",
        recoveryCode: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Recovery reset error:", err)
      setError("Ponastavitev gesla ni uspela.")
    } finally {
      setRecoveryLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Prijava</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Dobrodosel nazaj</h1>
          <p className="mt-2 text-sm text-slate-500">Vstopi v dashboard in nadaljuj z nalogami.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="ime@domena.si"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Geslo ali recovery code</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
              placeholder="Vnesi geslo ali recovery code"
            />
          </label>

          {successMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Prijavljam..." : "Prijava"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Se nimas racuna?{" "}
          <Link href="/signup" className="font-medium text-sky-700 hover:text-sky-800">
            Registracija
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <details className="group rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
              <span>Ponastavi geslo z recovery kodo</span>
              <span className="text-slate-500 transition group-open:rotate-180">⌄</span>
            </summary>

            <p className="mt-3 text-sm text-slate-500">
              Ce poznas pravilno recovery kodo, si lahko tukaj nastavis novo geslo.
            </p>

            <form onSubmit={handleRecoveryReset} className="mt-4 space-y-3">
              <input
                type="email"
                value={recoveryReset.email}
                onChange={(event) =>
                  setRecoveryReset((current) => ({ ...current, email: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="E-posta"
              />
              <input
                type="text"
                value={recoveryReset.recoveryCode}
                onChange={(event) =>
                  setRecoveryReset((current) => ({ ...current, recoveryCode: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 uppercase outline-none transition focus:border-sky-500"
                placeholder="Recovery code"
              />
              <input
                type="password"
                value={recoveryReset.newPassword}
                onChange={(event) =>
                  setRecoveryReset((current) => ({ ...current, newPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Novo geslo"
              />
              <input
                type="password"
                value={recoveryReset.confirmPassword}
                onChange={(event) =>
                  setRecoveryReset((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Potrdi novo geslo"
              />
              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {recoveryLoading ? "Nastavljam novo geslo..." : "Nastavi novo geslo"}
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  )
}
