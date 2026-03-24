import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TodoList from "@/components/TodoList"
import { NavBar } from "@/components/NavBar"
import { getTodosByUser } from "@/lib/sanity-utils"

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const todos = await getTodosByUser(session.user.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar title="TaskFlow Dashboard" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium text-sky-700">Pozdravljen, {session.user.name}</p>
          <h1 className="text-4xl font-semibold text-slate-950">Tvoje dnevne naloge</h1>
          <p className="max-w-2xl text-slate-600">
            Dodajaj, urejaj in spremljaj napredek. Dashboard je zasciten in prikazuje samo tvoje podatke.
          </p>
        </div>

        <TodoList initialTodos={todos} />
      </main>
    </div>
  )
}
