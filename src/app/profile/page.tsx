import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/ProfileForm"
import { NavBar } from "@/components/NavBar"

export default async function Profile() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar title="Uporabniski Profil" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-950">Moj profil</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Posodobi osnovne podatke racuna. Stran je dostopna samo prijavljenim uporabnikom.
          </p>
        </div>

        <ProfileForm user={session.user} />
      </main>
    </div>
  )
}
