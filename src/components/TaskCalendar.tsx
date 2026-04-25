"use client"

import { useMemo, useState } from "react"
import type { SanityTodo } from "@/lib/sanity-utils"

interface TaskCalendarProps {
  todos: SanityTodo[]
}

type DayState = "empty" | "planned" | "mixed" | "completed" | "overdue"

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function getDayState(todos: SanityTodo[]) {
  if (todos.length === 0) return "empty"

  const hasOverdue = todos.some((todo) => !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date())
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

export function TaskCalendar({ todos }: TaskCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  const calendarData = useMemo(() => {
    const firstDay = startOfMonth(monthCursor)
    const gridStart = new Date(firstDay)
    const offset = (firstDay.getDay() + 6) % 7
    gridStart.setDate(firstDay.getDate() - offset)

    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      const key = toDateKey(date)
      const dayTodos = todos.filter((todo) => {
        if (!todo.dueDate) return false
        return isSameDay(new Date(todo.dueDate), date)
      })

      return {
        key,
        date,
        todos: dayTodos,
        state: getDayState(dayTodos) as DayState,
        outsideMonth: date.getMonth() !== monthCursor.getMonth(),
      }
    })

    return days
  }, [monthCursor, todos])

  const selectedKey = selectedDay ? toDateKey(selectedDay) : null
  const selectedTodos =
    selectedKey ? calendarData.find((day) => day.key === selectedKey)?.todos ?? [] : []

  return (
    <section className="rounded-[2.4rem] border border-white/50 bg-white/78 p-6 shadow-[0_26px_90px_-46px_rgba(15,23,42,0.5)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Mesecni koledar
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Pregled taskov po dnevih
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Krogci se obarvajo glede na stanje taskov v dnevu: planirano, v teku, zakljuceno
            ali zapadlo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setMonthCursor(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
              )
            }
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Prejsnji
          </button>
          <div className="min-w-40 rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white">
            {new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(
              monthCursor
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setMonthCursor(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
              )
            }
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Naslednji
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {["Pon", "Tor", "Sre", "Cet", "Pet", "Sob", "Ned"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-3">
        {calendarData.map((day) => {
          const isSelected = selectedKey === day.key

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day.date)}
              className={`flex min-h-24 flex-col items-center justify-center rounded-[1.7rem] border transition ${dayStyles[day.state]} ${day.outsideMonth ? "opacity-45" : ""} ${isSelected ? "ring-2 ring-slate-950/70 ring-offset-2 ring-offset-white" : ""}`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                {day.date.getDate()}
              </span>
              <span className="mt-3 flex h-10 w-10 items-center justify-center rounded-full border border-current/20 bg-white/70 text-sm font-semibold">
                {day.todos.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">brez taskov</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">planirano</span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">mesano</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">zakljuceno</span>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">zapadlo</span>
      </div>

      <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Izbran dan
          </p>
          <h3 className="text-xl font-semibold text-slate-950">
            {selectedDay ? formatLongDate(selectedDay) : "Izberi dan"}
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          {selectedTodos.length === 0 ? (
            <p className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
              Za ta dan ni planiranih taskov.
            </p>
          ) : (
            selectedTodos.map((todo) => (
              <article
                key={todo._id}
                className="rounded-[1.4rem] border border-white bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-950">{todo.title}</p>
                  {todo.completed ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      opravljeno
                    </span>
                  ) : null}
                  {!todo.completed && todo.priority ? (
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      prioriteta
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-500">Rok: {formatDueDate(todo.dueDate)}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
