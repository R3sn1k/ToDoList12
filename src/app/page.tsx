import Link from "next/link"

const pillars = [
  {
    eyebrow: "Nadzor",
    title: "Centraliziran nadzor nad nalogami, uporabniki in prioritetami.",
    description:
      "TaskFlow zdruzi osebni fokus, ekipno preglednost in administracijo v en sam tok dela brez preklapljanja med orodji.",
  },
  {
    eyebrow: "Hiter zajem",
    title: "Od ideje do strukturirane naloge v nekaj sekundah.",
    description:
      "Hitri vnos, urejanje, zakljucevanje in pregled stanja so zgrajeni za vsakodnevni ritem dela, ne za demo ekran.",
  },
  {
    eyebrow: "Varen dostop",
    title: "Prava aplikacija z vlogami, profilom in zascitenimi sekcijami.",
    description:
      "Prijava, profil, admin tokovi in Sanity zaledje tvorijo osnovo, ki jo lahko razsiris v produkcijsko orodje.",
  },
]

const metrics = [
  { value: "24/7", label: "pregled nad delom" },
  { value: "3x", label: "hitrejsi zajem nalog" },
  { value: "100%", label: "odziven vmesnik" },
]

const workflow = [
  "Ustvari racun in odpri svoj osebni prostor.",
  "Dodaj naloge, oznaci prioritete in spremljaj napredek.",
  "Razsiri aplikacijo z admin vmesnikom in Sanity vsebino.",
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3efe6_0%,#f6f1e8_18%,#dce7ec_52%,#f8fafc_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.22),_transparent_32%),radial-gradient(circle_at_50%_0%,_rgba(15,23,42,0.12),_transparent_46%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-28 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-500">TaskFlow</p>
            <h1 className="text-2xl font-semibold tracking-tight">TaskFlow</h1>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300/70 bg-white/60 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-slate-400 hover:bg-white"
            >
              Prijava
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_-18px_rgba(15,23,42,0.8)] transition hover:bg-slate-800"
            >
              Zacni brez odlasanja
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-10 pb-18 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pb-24 lg:pt-12">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-700 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Napreden prostor za naloge, tokove in administracijo
            </div>

            <h2 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-8xl">
              To ni vec
              <span className="block text-slate-500">osnovni task board.</span>
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              TaskFlow postavi tvoje naloge v napreden nadzorni center. Manjs klikanja, vec jasnosti,
              boljsi obcutek ritma in vmesnik, ki deluje kot pravi produkt namesto studentske naloge.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-slate-950 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
              >
                Ustvari prostor
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-300 bg-white/70 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-800 backdrop-blur transition hover:border-slate-400 hover:bg-white"
              >
                Odpri dashboard
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[1.8rem] border border-white/60 bg-white/55 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur"
                >
                  <p className="text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="animate-fade-up-delayed">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-900/10 bg-[#0f172a] p-6 text-white shadow-[0_32px_120px_-36px_rgba(15,23,42,0.65)]">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.4),_transparent_58%)]" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Osrednji pregled</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">Danes obvladas vse.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                    v zivo
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-400">Momentum</p>
                    <p className="mt-2 text-4xl font-semibold">84%</p>
                    <p className="mt-3 text-sm text-slate-300">
                      Zakljucene naloge in aktivni fokus znotraj enega pregleda.
                    </p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-400">Prednostni pas</p>
                    <div className="mt-4 space-y-3">
                      {["Produktni redesign", "Client deploy", "Admin nadzor"].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm"
                        >
                          <span>{item}</span>
                          <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-200">
                            aktivno
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.9rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Potek dela</p>
                      <p className="mt-2 text-lg font-medium text-white">Od zajema do zakljucka brez odvecnega trenja.</p>
                    </div>
                    <div className="hidden rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300 sm:block">
                      usklajeno
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {workflow.map((step, index) => (
                      <div key={step} className="flex gap-4 rounded-2xl bg-black/15 px-4 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                          0{index + 1}
                        </div>
                        <p className="text-sm leading-6 text-slate-200">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2.2rem] border border-slate-200/70 bg-white/70 p-8 shadow-[0_24px_80px_-44px_rgba(15,23,42,0.5)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">Zakaj deluje bolje</p>
            <h3 className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-slate-950">
              Zgrajeno za energijo sodobnega dashboarda, ne za suhoparen checklist.
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Vizualna hierarhija, bold tipografija, mehek motion in bolj jasen razpored vsebine
              naredijo delo prijetnejse in hitrejse. Aplikacija se zdaj obnaša kot produkt, ki ga zelis odpreti.
            </p>
          </article>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.title}
                className={`rounded-[2rem] border p-6 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.55)] ${
                  index === 1
                    ? "border-slate-900/10 bg-slate-950 text-white"
                    : "border-slate-200/70 bg-white/75 text-slate-950 backdrop-blur"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.26em] ${
                    index === 1 ? "text-slate-400" : "text-sky-700"
                  }`}
                >
                  {pillar.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">{pillar.title}</h3>
                <p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-slate-300" : "text-slate-600"}`}>
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
