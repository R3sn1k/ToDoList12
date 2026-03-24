import Link from "next/link"

const features = [
  {
    title: "Jasen dashboard",
    description: "Kartice s statistiko, seznam aktivnih opravil in hiter vnos novih nalog.",
  },
  {
    title: "Varen dostop",
    description: "Prijava, registracija, zasciten profil in omejen admin dostop po vlogah.",
  },
  {
    title: "Mobilna uporaba",
    description: "Navigacija s hamburger menijem in postavitev, prilagojena telefonu.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_45%,_#ffffff_100%)] text-slate-950">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">ToDo App</p>
            <h1 className="text-xl font-semibold">TaskFlow</h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Prijava
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Registracija
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              Next.js ToDo aplikacija za nalogo in Vercel deploy
            </p>
            <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
              Organiziraj naloge, uporabnike in administracijo v enem odzivnem vmesniku.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Aplikacija pokrije landing page, prijavo, registracijo, dashboard, profil,
              admin del in povezavo s Sanity podatki. Pripravljena je za nadaljnjo objavo na Vercelu.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-2xl bg-slate-950 px-6 py-4 text-center font-medium text-white transition hover:bg-slate-800"
              >
                Zacni zdaj
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-300 px-6 py-4 text-center font-medium text-slate-700 transition hover:bg-white"
              >
                Imam racun
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)]">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Danes</p>
              <p className="mt-2 text-3xl font-semibold">3 prioritete</p>
              <div className="mt-5 space-y-3">
                {["Oddaj porocilo", "Uredi dashboard", "Preveri admin flow"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"
                  >
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-sky-100" />
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>TaskFlow ToDo App</p>
          <p>Next.js, NextAuth, Sanity, responsive UI</p>
        </div>
      </footer>
    </div>
  )
}
