import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TodoList from "@/components/TodoList"
import { NavBar } from "@/components/NavBar"
import {
  getNotificationsForUser,
  getTaskInvitationsForUser,
  getTodosByUser,
} from "@/lib/sanity-utils"

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const [todos, invitations, notifications] = await Promise.all([
    getTodosByUser(session.user.id),
    session.user.email
      ? getTaskInvitationsForUser(session.user.email, session.user.id)
      : Promise.resolve([]),
    getNotificationsForUser(session.user.id),
  ])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3efe6_0%,#ecf2f4_46%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_36%)]" />
      <NavBar title="TaskFlow" session={session} />
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TodoList
          initialTodos={todos}
          initialInvitations={invitations}
          initialNotifications={notifications}
        />
      </main>
    </div>
  )
}
