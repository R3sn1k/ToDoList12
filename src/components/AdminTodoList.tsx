"use client"

import { useMemo, useState } from "react"
import type { SanityNotification, SanityTodo, SanityUser } from "@/lib/sanity-utils"

interface AdminTodoListProps {
  initialTodos: SanityTodo[]
  users: SanityUser[]
  initialNotifications: SanityNotification[]
  currentUserId: string
}

interface DraftNotification {
  title: string
  description: string
  dueDate: string
}

function emptyNotification(): DraftNotification {
  return { title: "", description: "", dueDate: "" }
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null
}

function formatDate(value?: string) {
  if (!value) return "Brez roka"
  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function AdminTodoList({
  initialTodos,
  users: initialUsers,
  initialNotifications,
  currentUserId,
}: AdminTodoListProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [users, setUsers] = useState(initialUsers)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [draftNotification, setDraftNotification] = useState<DraftNotification>(emptyNotification())
  const [selectedUser, setSelectedUser] = useState("all")
  const [error, setError] = useState("")

  const filteredTodos = useMemo(() => {
    if (selectedUser === "all") {
      return todos
    }

    return todos.filter((todo) => todo.user._id === selectedUser)
  }, [selectedUser, todos])

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setTodos((current) => current.filter((todo) => todo._id !== id))
    } catch (err) {
      console.error("Error deleting todo:", err)
      setError("Naloge ni bilo mogoce izbrisati.")
    }
  }

  const deleteUser = async (id: string) => {
    try {
      setError("")

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Delete failed")
      }

      setUsers((current) => current.filter((user) => user._id !== id))
      setTodos((current) =>
        current.filter((todo) => todo.user._id !== id && todo.createdBy._id !== id)
      )
      setNotifications((current) =>
        current.filter((notification) => notification.createdBy._id !== id)
      )

      if (selectedUser === id) {
        setSelectedUser("all")
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "Uporabnika ni bilo mogoce izbrisati.")
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      setError("")

      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Delete failed")
      }

      setNotifications((current) => current.filter((notification) => notification._id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
      setError(err instanceof Error ? err.message : "Obvestila ni bilo mogoce izbrisati.")
    }
  }

  const createNotification = async () => {
    if (!draftNotification.title.trim()) {
      setError("Obvestilo potrebuje naslov.")
      return
    }

    try {
      setError("")

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftNotification.title,
          description: draftNotification.description,
          dueDate: toIso(draftNotification.dueDate),
        }),
      })

      const created = await response.json()

      if (!response.ok) {
        throw new Error(created.error ?? "Obvestila ni bilo mogoce ustvariti.")
      }

      setNotifications((current) => [created, ...current])
      setDraftNotification(emptyNotification())
    } catch (err) {
      console.error("Error creating notification:", err)
      setError(err instanceof Error ? err.message : "Obvestila ni bilo mogoce ustvariti.")
    }
  }

  const toggleTodo = async (id: string) => {
    const currentTodo = todos.find((todo) => todo._id === id)
    if (!currentTodo) return

    try {
      const response = await fetch(`/api/admin/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !currentTodo.completed }),
      })

      if (!response.ok) {
        throw new Error("Update failed")
      }

      const updatedTodo = await response.json()
      setTodos((current) =>
        current.map((todo) => (todo._id === id ? updatedTodo : todo))
      )
    } catch (err) {
      console.error("Error toggling todo:", err)
      setError("Naloge ni bilo mogoce posodobiti.")
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="rounded-[2.2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Skrbniško obvestilo
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Objavi obvestilo za vse
            </h2>
            <div className="mt-5 space-y-3">
              <input
                value={draftNotification.title}
                onChange={(event) =>
                  setDraftNotification((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Naslov dogodka ali naloge"
                className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
              <textarea
                value={draftNotification.description}
                onChange={(event) =>
                  setDraftNotification((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Na primer: V nedeljo so volitve. Obvezno pojdite volit."
                className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
              <input
                type="datetime-local"
                value={draftNotification.dueDate}
                onChange={(event) =>
                  setDraftNotification((current) => ({ ...current, dueDate: event.target.value }))
                }
                className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
              <button
                type="button"
                onClick={createNotification}
                className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
              >
                Objavi obvestilo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Filtri</h2>
          <p className="mt-1 text-sm text-slate-500">Omeji pregled po posameznem uporabniku.</p>
          <select
            value={selectedUser}
            onChange={(event) => setSelectedUser(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
          >
            <option value="all">Vsi uporabniki</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Povzetek</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Skupaj uporabnikov</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{users.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Skupaj nalog</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{todos.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Skupaj obvestil</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{notifications.length}</p>
            </div>
          </div>
        </article>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-950">Vsa opravila</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Naloga
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Uporabnik
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTodos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Ni podatkov za izbran filter.
                  </td>
                </tr>
              ) : (
                filteredTodos.map((todo) => (
                  <tr key={todo._id}>
                    <td className="px-6 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo._id)}
                        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{todo.title}</p>
                        {todo.description ? (
                          <p className="text-sm text-slate-500">{todo.description}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-600">
                      <p className="font-medium text-slate-900">{todo.user.username}</p>
                      <p>{todo.user.email}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-500">
                      {new Date(todo.createdAt).toLocaleDateString("sl-SI")}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => deleteTodo(todo._id)}
                        className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                      >
                        Izbrisi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-950">Uporabniki</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Uporabnisko ime
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vloga
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registracija
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("sl-SI")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user._id === currentUserId ? (
                      <span className="text-slate-400">Trenutni racun</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => deleteUser(user._id)}
                        className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                      >
                        Izbrisi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-950">Admin obvestila</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Naslov
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ustvaril
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rok
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Trenutno ni objavljenih obvestil.
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification._id}>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{notification.title}</p>
                        {notification.description ? (
                          <p className="text-sm text-slate-500">{notification.description}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-600">
                      <p className="font-medium text-slate-900">
                        {notification.createdBy.username}
                      </p>
                      <p>{notification.createdBy.email}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-500">
                      {formatDate(notification.dueDate)}
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-500">
                      {formatDate(notification.createdAt)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => deleteNotification(notification._id)}
                        className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                      >
                        Izbrisi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
