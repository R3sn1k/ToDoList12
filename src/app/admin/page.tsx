import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminTodoList from "@/components/AdminTodoList"
import { NavBar } from "@/components/NavBar"
import { getAllNotifications, getTodos, getUsers } from "@/lib/sanity-utils"

export default async function Admin() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const allTodos = await getTodos()
  const users = await getUsers()
  const notifications = await getAllNotifications()

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar title="Admin Nadzor" session={session} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-rose-700">Dostop samo za admin uporabnike</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Administracija podatkov</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Urejaj pregled vseh nalog, nadzoruj zakljucevanje in spremljaj registrirane uporabnike.
          </p>
        </div>

        <AdminTodoList
          initialTodos={allTodos}
          users={users}
          initialNotifications={notifications}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  )
}
