"use client"

import { useMemo, useState } from "react"
import type { SanityTodo } from "@/lib/sanity-utils"

interface TaskCalendarProps {
  todos: SanityTodo[]
}

type DayState = "empty" | "planned" | "mixed" | "completed" | "overdue"
type CalendarView = "month" | "week"

interface CalendarDay {
  key: string
  date: Date
  todos: SanityTodo[]
  state: DayState
  outsideRange: boolean
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfWeek(date: Date) {
  const start = new Date(date)
  const offset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - offset)
  start.setHours(0, 0, 0, 0)
  return start
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isWithinRange(date: Date, from: string, to: string) {
  const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  if (from) {
    const fromDate = new Date(from)
    fromDate.setHours(0, 0, 0, 0)
    if (time < fromDate.getTime()) return false
  }

  if (to) {
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    if (time > toDate.getTime()) return false
  }

  return true
}

function getDayState(todos: SanityTodo[]) {
  if (todos.length === 0) return "empty"

  const now = Date.now()
  const hasOverdue = todos.some(
    (todo) => !todo.completed && todo.dueDate && new Date(todo.dueDate).getTime() < now
  )
  if (hasOverdue) return "overdue"

  const completedCount = todos.filter((todo) => todo.completed).length
  if (completedCount === todos.length) return "completed"
  if (completedCount > 0) return "mixed"
  return "planned"
}

const dayStyles: Record<DayState, string> = {
  empty: "border-slate-200 bg-white text-slate-400",
  planned: "border-amber-200 bg-amber-50 text-amber-700",
  mixed: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  overdue: "border-rose-200 bg-rose-50 text-rose-700",
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("sl-SI", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatDueDate(value?: string) {
  if (!value) return "Brez roka"

  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function buildMonthDays(anchor: Date, todos: SanityTodo[], from: string, to: string): CalendarDay[] {
  const firstDay = startOfMonth(anchor)
  const gridStart = startOfWeek(firstDay)

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    const dayTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false
      return isSameDay(new Date(todo.dueDate), date)
    })

    return {
      key: toDateKey(date),
      date,
      todos: dayTodos,
      state: getDayState(dayTodos),
      outsideRange:
        date.getMonth() !== anchor.getMonth() || !isWithinRange(date, from, to),
    }
  })
}

function buildWeekDays(anchor: Date, todos: SanityTodo[], from: string, to: string): CalendarDay[] {
  const start = startOfWeek(anchor)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const dayTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false
      return isSameDay(new Date(todo.dueDate), date)
    })

    return {
      key: toDateKey(date),
      date,
      todos: dayTodos,
      state: getDayState(dayTodos),
      outsideRange: !isWithinRange(date, from, to),
    }
  })
}

function getVisibleTodos(todos: SanityTodo[], from: string, to: string) {
  return todos.filter((todo) => {
    if (!todo.dueDate) return false
    return isWithinRange(new Date(todo.dueDate), from, to)
  })
}

export function TaskCalendar({ todos }: TaskCalendarProps) {
  const today = new Date()
  const [view, setView] = useState<CalendarView>("month")
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const visibleTodos = useMemo(() => getVisibleTodos(todos, dateFrom, dateTo), [todos, dateFrom, dateTo])

  const calendarDays = useMemo(() => {
    return view === "month"
      ? buildMonthDays(cursor, visibleTodos, dateFrom, dateTo)
      : buildWeekDays(cursor, visibleTodos, dateFrom, dateTo)
  }, [cursor, dateFrom, dateTo, view, visibleTodos])

  const effectiveSelectedDay =
    selectedDay && isWithinRange(selectedDay, dateFrom, dateTo)
      ? selectedDay
      : calendarDays.find((day) => !day.outsideRange)?.date ?? null

  const selectedKey = effectiveSelectedDay ? toDateKey(effectiveSelectedDay) : null
  const selectedTodos =
    selectedKey ? calendarDays.find((day) => day.key === selectedKey)?.todos ?? [] : []

  const periodLabel =
    view === "month"
      ? new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(cursor)
      : `${new Intl.DateTimeFormat("sl-SI", { day: "2-digit", month: "short" }).format(calendarDays[0]?.date ?? cursor)} - ${new Intl.DateTimeFormat("sl-SI", { day: "2-digit", month: "short", year: "numeric" }).format(calendarDays[calendarDays.length - 1]?.date ?? cursor)}`

  return (
    <section className="rounded-[2rem] border border-white/50 bg-white/78 p-4 shadow-[0_18px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
              Koledar taskov
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Mesecni ali tedenski pregled
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`rounded-full px-3 py-2 text-sm font-medium ${view === "month" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              Mesec
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`rounded-full px-3 py-2 text-sm font-medium ${view === "week" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              Teden
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCursor((current) =>
                  view === "month"
                    ? new Date(current.getFullYear(), current.getMonth() - 1, 1)
                    : addDays(current, -7)
                )
              }
              className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Prejsnji
            </button>
            <button
              type="button"
              onClick={() =>
                setCursor((current) =>
                  view === "month"
                    ? new Date(current.getFullYear(), current.getMonth() + 1, 1)
                    : addDays(current, 7)
                )
              }
              className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Naslednji
            </button>
          </div>

          <div className="rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white">
            {periodLabel}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {["Pon", "Tor", "Sre", "Cet", "Pet", "Sob", "Ned"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className={`mt-3 grid ${view === "month" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
        {calendarDays.map((day) => {
          const isSelected = selectedKey === day.key

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day.date)}
              className={`rounded-[1.2rem] border px-1 py-2 transition ${dayStyles[day.state]} ${day.outsideRange ? "opacity-35" : ""} ${isSelected ? "ring-2 ring-slate-950/70 ring-offset-1 ring-offset-white" : ""}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-semibold">{day.date.getDate()}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 bg-white/70 text-xs font-semibold">
                  {day.todos.length}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">brez taskov</span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">planirano</span>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">mesano</span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">zakljuceno</span>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">zapadlo</span>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Izbran dan
          </p>
          <h3 className="text-lg font-semibold text-slate-950">
            {effectiveSelectedDay ? formatLongDate(effectiveSelectedDay) : "Izberi dan"}
          </h3>
        </div>

        <div className="mt-3 space-y-2">
          {selectedTodos.length === 0 ? (
            <p className="rounded-[1.1rem] border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
              Za ta dan ni planiranih taskov.
            </p>
          ) : (
            selectedTodos.map((todo) => (
              <article
                key={todo._id}
                className="rounded-[1.1rem] border border-white bg-white px-3 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">{todo.title}</p>
                  {todo.completed ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      opravljeno
                    </span>
                  ) : null}
                  {!todo.completed && todo.priority ? (
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      prioriteta
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500">Rok: {formatDueDate(todo.dueDate)}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
