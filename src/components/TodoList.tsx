"use client"

import { useMemo, useState } from "react"
import type {
  SanityNotification,
  SanitySubtask,
  SanityTaskInvitation,
  SanityTodo,
} from "@/lib/sanity-utils"

interface TodoListProps {
  initialTodos: SanityTodo[]
  initialInvitations: SanityTaskInvitation[]
  initialNotifications: SanityNotification[]
}

interface DraftTask {
  title: string
  description: string
  dueDate: string
  priority: boolean
  inviteEmail: string
  subtasks: SanitySubtask[]
}

function emptyTask(): DraftTask {
  return { title: "", description: "", dueDate: "", priority: false, inviteEmail: "", subtasks: [] }
}

function toLocalDateTime(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  const pad = (input: number) => input.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
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

function getDeadlineState(todo: SanityTodo) {
  if (!todo.dueDate || todo.completed) return { expired: false, urgent: false, label: "Brez roka" }
  const diffHours = (new Date(todo.dueDate).getTime() - Date.now()) / (1000 * 60 * 60)
  if (diffHours < 0) return { expired: true, urgent: false, label: "Zapadlo" }
  if (diffHours <= 48) return { expired: false, urgent: true, label: diffHours < 24 ? "Nujno danes" : "Nujno kmalu" }
  return { expired: false, urgent: false, label: "Načrtovano" }
}

function sortActive(a: SanityTodo, b: SanityTodo) {
  const deadlineA = getDeadlineState(a)
  const deadlineB = getDeadlineState(b)
  if (a.priority !== b.priority) return a.priority ? -1 : 1
  if (deadlineA.urgent !== deadlineB.urgent) return deadlineA.urgent ? -1 : 1
  if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank
  if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  if (a.dueDate && !b.dueDate) return -1
  if (!a.dueDate && b.dueDate) return 1
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export default function TodoList({
  initialTodos,
  initialInvitations,
  initialNotifications,
}: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [draftTask, setDraftTask] = useState<DraftTask>(emptyTask())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<DraftTask>(emptyTask())
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const view = useMemo(() => {
    const active = todos.filter((todo) => !todo.completed && !getDeadlineState(todo).expired).sort(sortActive)
    const priority = active.filter((todo) => todo.priority)
    const urgent = active.filter((todo) => getDeadlineState(todo).urgent)
    const history = todos
      .filter((todo) => todo.completed || getDeadlineState(todo).expired)
      .sort((a, b) => {
        const aTime = new Date(a.completedAt ?? a.dueDate ?? a.createdAt).getTime()
        const bTime = new Date(b.completedAt ?? b.dueDate ?? b.createdAt).getTime()
        return bTime - aTime
      })

    return {
      active,
      priority,
      urgent,
      history,
      invitations: invitations.filter((item) => item.status === "pending"),
      notifications,
    }
  }, [invitations, notifications, todos])

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length
    const expired = todos.filter((todo) => !todo.completed && getDeadlineState(todo).expired).length
    return {
      active: todos.length - completed - expired,
      priority: view.priority.length,
      urgent: view.urgent.length,
      history: completed + expired,
    }
  }, [todos, view.priority.length, view.urgent.length])

  const refreshTodos = async () => {
    const response = await fetch("/api/todos")
    const data = await response.json()
    if (response.ok) setTodos(data)
  }

  const patchTodo = async (id: string, payload: Record<string, unknown>) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const updated = await response.json()
    if (!response.ok) throw new Error(updated.error ?? "Posodobitev ni uspela")
    setTodos((current) => current.map((todo) => (todo._id === id ? updated : todo)))
    return updated as SanityTodo
  }

  const updateSubtasks = (
    mode: "draft" | "edit",
    updater: (items: SanitySubtask[]) => SanitySubtask[]
  ) => {
    if (mode === "draft") {
      setDraftTask((current) => ({ ...current, subtasks: updater(current.subtasks) }))
      return
    }
    setEditingTask((current) => ({ ...current, subtasks: updater(current.subtasks) }))
  }

  const createTask = async () => {
    if (!draftTask.title.trim()) {
      setError("Naloga potrebuje naslov.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTask.title,
          description: draftTask.description,
          dueDate: toIso(draftTask.dueDate),
          priority: draftTask.priority,
          subtasks: draftTask.subtasks,
        }),
      })

      const created = await response.json()
      if (!response.ok) {
        setError(created.error ?? "Naloge ni bilo mogoce ustvariti.")
        return
      }

      if (draftTask.inviteEmail.trim()) {
        await fetch("/api/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todoId: created._id, email: draftTask.inviteEmail.trim() }),
        })
      }

      setTodos((current) => [created, ...current])
      setDraftTask(emptyTask())
    } catch (err) {
      console.error(err)
      setError("Naloge ni bilo mogoce ustvariti.")
    } finally {
      setSaving(false)
    }
  }

  const toggleTodo = async (todo: SanityTodo) => {
    try {
      setError("")
      await patchTodo(todo._id, { completed: !todo.completed })
    } catch (err) {
      console.error(err)
      setError("Status naloge ni bil posodobljen.")
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      setError("")
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Delete failed")
      setTodos((current) => current.filter((todo) => todo._id !== id))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Naloge ni bilo mogoce izbrisati.")
    }
  }

  const startEditing = (todo: SanityTodo) => {
    setEditingId(todo._id)
    setEditingTask({
      title: todo.title,
      description: todo.description ?? "",
      dueDate: toLocalDateTime(todo.dueDate),
      priority: todo.priority,
      inviteEmail: "",
      subtasks: todo.subtasks,
    })
  }

  const saveEdit = async (id: string) => {
    if (!editingTask.title.trim()) {
      setError("Naloga potrebuje naslov.")
      return
    }

    try {
      setError("")
      await patchTodo(id, {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: toIso(editingTask.dueDate),
        priority: editingTask.priority,
        subtasks: editingTask.subtasks,
      })

      if (editingTask.inviteEmail.trim()) {
        await fetch("/api/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todoId: id, email: editingTask.inviteEmail.trim() }),
        })
      }

      setEditingId(null)
      setEditingTask(emptyTask())
    } catch (err) {
      console.error(err)
      setError("Naloge ni bilo mogoce posodobiti.")
    }
  }

  const toggleSubtask = async (todo: SanityTodo, key?: string, index?: number) => {
    try {
      setError("")
      await patchTodo(todo._id, {
        subtasks: todo.subtasks.map((subtask, currentIndex) =>
          subtask._key === key || (key === undefined && currentIndex === index)
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        ),
      })
    } catch (err) {
      console.error(err)
      setError("Podnaloge ni bilo mogoce posodobiti.")
    }
  }

  const respondToInvitation = async (id: string, status: "accepted" | "declined") => {
    try {
      setError("")
      const response = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Invitation failed")
      setInvitations((current) => current.filter((item) => item._id !== id))
      await refreshTodos()
    } catch (err) {
      console.error(err)
      setError("Povabila ni bilo mogoce obdelati.")
    }
  }

  const respondToNotification = async (id: string, status: "accepted" | "declined") => {
    try {
      setError("")
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Notification failed")
      setNotifications((current) => current.filter((item) => item._id !== id))
      if (status === "accepted") await refreshTodos()
    } catch (err) {
      console.error(err)
      setError("Obvestila ni bilo mogoce obdelati.")
    }
  }

  const dropPriority = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const items = [...view.priority]
    const from = items.findIndex((todo) => todo._id === draggedId)
    const to = items.findIndex((todo) => todo._id === targetId)
    if (from === -1 || to === -1) return

    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    const ids = items.map((todo) => todo._id)

    setTodos((current) =>
      current.map((todo) => {
        const index = ids.indexOf(todo._id)
        return index === -1 ? todo : { ...todo, priority: true, priorityRank: index + 1 }
      })
    )

    try {
      const response = await fetch("/api/todos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedTodoIds: ids }),
      })
      if (!response.ok) throw new Error("Priority failed")
    } catch (err) {
      console.error(err)
      setError("Prednostnega vrstnega reda ni bilo mogoce shraniti.")
    }
  }

  const renderTodo = (todo: SanityTodo) => {
    const deadline = getDeadlineState(todo)
    const isEditing = editingId === todo._id

    return (
      <article key={todo._id} className={`rounded-[2rem] border p-5 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.7)] ${todo.completed ? "border-emerald-200 bg-emerald-50/80" : deadline.expired ? "border-rose-200 bg-rose-50/80" : deadline.urgent ? "border-amber-200 bg-amber-50/80" : "border-slate-200 bg-white/90"}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo)} className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input value={editingTask.title} onChange={(event) => setEditingTask((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
                <textarea value={editingTask.description} onChange={(event) => setEditingTask((current) => ({ ...current, description: event.target.value }))} rows={4} className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
                <div className="grid gap-3 md:grid-cols-2">
                  <input type="datetime-local" value={editingTask.dueDate} onChange={(event) => setEditingTask((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
                  <input type="email" value={editingTask.inviteEmail} onChange={(event) => setEditingTask((current) => ({ ...current, inviteEmail: event.target.value }))} placeholder="Delegiraj uporabniku po e-pošti" className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={editingTask.priority} onChange={(event) => setEditingTask((current) => ({ ...current, priority: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
                  Dodaj med prednostne
                </label>
                <div className="space-y-2 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Podnaloge</p>
                    <button type="button" onClick={() => updateSubtasks("edit", (items) => [...items, { title: "", completed: false }])} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Dodaj</button>
                  </div>
                  {editingTask.subtasks.map((subtask, index) => (
                    <div key={`${todo._id}-${index}`} className="flex gap-2">
                      <input value={subtask.title} onChange={(event) => updateSubtasks("edit", (items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} className="flex-1 rounded-[1rem] border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-slate-400" />
                      <button type="button" onClick={() => updateSubtasks("edit", (items) => items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">X</button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => saveEdit(todo._id)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Shrani spremembe</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Prekliči</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className={`text-2xl font-semibold tracking-tight ${todo.completed ? "text-emerald-900 line-through" : "text-slate-950"}`}>{todo.title}</h3>
                      {todo.priority ? <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">prednostno</span> : null}
                      {deadline.urgent ? <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">nujno</span> : null}
                      {deadline.expired ? <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">zapadlo</span> : null}
                    </div>
                    {todo.description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{todo.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <span>rok: {formatDate(todo.dueDate)}</span>
                      <span>nosilec: {todo.user.username}</span>
                      <span>ustvaril: {todo.createdBy.username}</span>
                    </div>
                    {todo.isNotificationTask ? (
                      <p className="mt-3 text-sm text-slate-500">
                        Ta naloga je bila sprejeta iz admin obvestila, zato je ni mogoce izbrisati.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEditing(todo)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Uredi</button>
                    {todo.isNotificationTask ? null : <button type="button" onClick={() => deleteTodo(todo._id)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Izbriši</button>}
                  </div>
                </div>
                {todo.subtasks.length > 0 ? (
                  <div className="mt-5 space-y-2 rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Podnaloge</p>
                    {todo.subtasks.map((subtask, index) => (
                      <label key={subtask._key ?? `${todo._id}-${index}`} className="flex items-center gap-3">
                        <input type="checkbox" checked={subtask.completed} onChange={() => toggleSubtask(todo, subtask._key, index)} className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
                        <span className={`text-sm ${subtask.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{subtask.title}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2.2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Obvestila</p><h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Naloge za vse uporabnike</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{view.notifications.length}</span></div>
          <div className="mt-5 space-y-3">
            {view.notifications.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">Trenutno ni novih obvestil.</p> : view.notifications.map((notification) => <div key={notification._id} className="rounded-[1.5rem] bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">objavil {notification.createdBy.username}</p><p className="mt-2 text-lg font-semibold text-slate-950">{notification.title}</p>{notification.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{notification.description}</p> : null}<p className="mt-2 text-sm text-slate-600">Rok: {formatDate(notification.dueDate)}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => respondToNotification(notification._id, "accepted")} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Sprejmi</button><button type="button" onClick={() => respondToNotification(notification._id, "declined")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Zavrni</button></div></div>)}
          </div>
        </div>

        <div className="rounded-[2.2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Povabila</p><h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Delegirane naloge</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{view.invitations.length}</span></div>
          <div className="mt-5 space-y-3">
            {view.invitations.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">Trenutno ni odprtih povabil za prevzem nalog.</p> : view.invitations.map((invitation) => <div key={invitation._id} className="rounded-[1.5rem] bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">od {invitation.sender.username}</p><p className="mt-2 text-lg font-semibold text-slate-950">{invitation.todo.title}</p><p className="mt-2 text-sm text-slate-600">Rok: {formatDate(invitation.todo.dueDate)}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => respondToInvitation(invitation._id, "accepted")} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Sprejmi</button><button type="button" onClick={() => respondToInvitation(invitation._id, "declined")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Zavrni</button></div></div>)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <div className="rounded-[2.2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-[0_30px_110px_-48px_rgba(15,23,42,0.78)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Pregled sistema</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5"><p className="text-sm text-slate-400">Aktivne naloge</p><p className="mt-2 text-4xl font-semibold">{stats.active}</p></article>
              <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5"><p className="text-sm text-slate-400">Prednostne naloge</p><p className="mt-2 text-4xl font-semibold">{stats.priority}</p></article>
              <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5"><p className="text-sm text-slate-400">Nujne naloge</p><p className="mt-2 text-4xl font-semibold">{stats.urgent}</p></article>
              <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5"><p className="text-sm text-slate-400">Zgodovina</p><p className="mt-2 text-4xl font-semibold">{stats.history}</p></article>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Nova naloga</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Ustvari nalogo</h2>
            <div className="mt-5 space-y-3">
              <input value={draftTask.title} onChange={(event) => setDraftTask((current) => ({ ...current, title: event.target.value }))} placeholder="Naslov naloge" className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
              <textarea value={draftTask.description} onChange={(event) => setDraftTask((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Opis, opomba ali navodilo" className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
              <div className="grid gap-3 md:grid-cols-2">
                <input type="datetime-local" value={draftTask.dueDate} onChange={(event) => setDraftTask((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
                <input type="email" value={draftTask.inviteEmail} onChange={(event) => setDraftTask((current) => ({ ...current, inviteEmail: event.target.value }))} placeholder="Delegiraj uporabniku po e-pošti" className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400" />
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={draftTask.priority} onChange={(event) => setDraftTask((current) => ({ ...current, priority: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />Dodaj med prednostne</label>
              <div className="space-y-2 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-900">Podnaloge</p><button type="button" onClick={() => updateSubtasks("draft", (items) => [...items, { title: "", completed: false }])} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Dodaj</button></div>
                {draftTask.subtasks.map((subtask, index) => <div key={`draft-${index}`} className="flex gap-2"><input value={subtask.title} onChange={(event) => updateSubtasks("draft", (items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} className="flex-1 rounded-[1rem] border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-slate-400" /><button type="button" onClick={() => updateSubtasks("draft", (items) => items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">X</button></div>)}
              </div>
              <button type="button" onClick={createTask} disabled={saving} className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Shranjujem..." : "Ustvari nalogo"}</button>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="rounded-[2.4rem] border border-white/50 bg-white/78 p-6 shadow-[0_26px_90px_-46px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Prednostni pas</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Najpomembnejše naloge</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">Naloge lahko razporejaš z vlečenjem po pomembnosti.</p></div>
            <div className="mt-6 space-y-3">
              {view.priority.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">Označi nalogo kot prednostno in se bo pojavila tukaj.</p> : view.priority.map((todo, index) => <div key={todo._id} draggable onDragStart={() => setDraggedId(todo._id)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropPriority(todo._id)} className="flex items-center justify-between rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-4"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">{index + 1}</div><div><p className="font-medium text-slate-950">{todo.title}</p><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{getDeadlineState(todo).label} • {formatDate(todo.dueDate)}</p></div></div><div className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">povleci</div></div>)}
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-white/50 bg-white/78 p-6 shadow-[0_26px_90px_-46px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Aktivne naloge</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Operativne naloge</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">Naloga z bližnjim rokom postane nujna. Po preteku roka se nedokončana premakne v zgodovino.</p></div>
            <div className="mt-6 space-y-4">{view.active.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Ni aktivnih nalog. Ustvari novo ali sprejmi delegirano nalogo.</p> : view.active.map(renderTodo)}</div>
          </div>

          <div className="rounded-[2.4rem] border border-white/50 bg-white/78 p-6 shadow-[0_26px_90px_-46px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Zgodovina</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Zaključene in zapadle naloge</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">Tukaj so naloge, ki so dokončane ali so jim roki že potekli.</p></div>
            <div className="mt-6 space-y-4">{view.history.length === 0 ? <p className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Zgodovina je še prazna.</p> : view.history.map(renderTodo)}</div>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  )
}

