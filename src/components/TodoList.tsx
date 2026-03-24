"use client"

import { useMemo, useState } from "react"
import type { SanityTodo } from "@/lib/sanity-utils"

interface TodoListProps {
  initialTodos: SanityTodo[]
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const pending = total - completed

    return { total, completed, pending }
  }, [todos])

  const addTodo = async () => {
    if (!title.trim()) {
      setError("Naslov opravila je obvezen.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Napaka pri shranjevanju opravila.")
        return
      }

      setTodos((current) => [data, ...current])
      setTitle("")
      setDescription("")
    } catch (err) {
      console.error("Error adding todo:", err)
      setError("Napaka pri shranjevanju opravila.")
    } finally {
      setSaving(false)
    }
  }

  const toggleTodo = async (id: string) => {
    const currentTodo = todos.find((todo) => todo._id === id)
    if (!currentTodo) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !currentTodo.completed }),
      })

      if (!response.ok) {
        throw new Error("Toggle failed")
      }

      const updatedTodo = await response.json()
      setTodos((current) =>
        current.map((todo) => (todo._id === id ? updatedTodo : todo))
      )
    } catch (err) {
      console.error("Error toggling todo:", err)
      setError("Status opravila ni bil posodobljen.")
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setTodos((current) => current.filter((todo) => todo._id !== id))
    } catch (err) {
      console.error("Error deleting todo:", err)
      setError("Opravila ni bilo mogoce izbrisati.")
    }
  }

  const startEditing = (todo: SanityTodo) => {
    setEditingId(todo._id)
    setEditingTitle(todo.title)
    setEditingDescription(todo.description ?? "")
  }

  const saveEdit = async () => {
    if (!editingId || !editingTitle.trim()) {
      setError("Naslov opravila je obvezen.")
      return
    }

    try {
      const response = await fetch(`/api/todos/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
          description: editingDescription.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Update failed")
      }

      const updatedTodo = await response.json()
      setTodos((current) =>
        current.map((todo) => (todo._id === editingId ? updatedTodo : todo))
      )
      cancelEdit()
    } catch (err) {
      console.error("Error updating todo:", err)
      setError("Opravila ni bilo mogoce posodobiti.")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
    setEditingDescription("")
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Skupaj nalog</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.total}</p>
        </article>
        <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Zakljucene</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">{stats.completed}</p>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Aktivne</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{stats.pending}</p>
        </article>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Dodaj novo opravilo</h2>
            <p className="text-sm text-slate-500">Hitro zajemi delo za danes ali naslednji teden.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Naslov opravila"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kratek opis"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
            <button
              type="button"
              onClick={addTodo}
              disabled={saving}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Shranjujem..." : "Dodaj"}
            </button>
          </div>
          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
            Se ni opravila. Dodaj prvega in zacni z delom.
          </div>
        ) : (
          todos.map((todo) => (
            <article key={todo._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <label className="mt-1 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id)}
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="sr-only">Oznaci opravilo kot zakljuceno</span>
                </label>

                <div className="flex-1">
                  {editingId === todo._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                      />
                      <textarea
                        value={editingDescription}
                        onChange={(event) => setEditingDescription(event.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Shrani
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Preklici
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          className={`text-lg font-semibold ${
                            todo.completed ? "text-slate-400 line-through" : "text-slate-950"
                          }`}
                        >
                          {todo.title}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            todo.completed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {todo.completed ? "Zakljuceno" : "V teku"}
                        </span>
                      </div>
                      {todo.description ? (
                        <p className="text-sm text-slate-600">{todo.description}</p>
                      ) : null}
                      <p className="text-xs text-slate-400">
                        Ustvarjeno {new Date(todo.createdAt).toLocaleDateString("sl-SI")}
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== todo._id ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(todo)}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTodo(todo._id)}
                      className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                    >
                      Izbrisi
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
