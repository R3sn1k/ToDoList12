import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_45%,_#ffffff_100%)] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)]">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "shadow-none border-0 p-0",
              rootBox: "w-full",
              headerTitle: "text-slate-950 text-3xl font-semibold",
              headerSubtitle: "text-slate-500",
              socialButtonsBlockButton: "rounded-2xl border border-slate-300 shadow-none",
              formButtonPrimary: "rounded-2xl bg-slate-950 hover:bg-slate-800 text-white",
              footerActionLink: "text-sky-700 hover:text-sky-800",
              formFieldInput: "rounded-2xl border border-slate-300",
            },
          }}
        />
      </div>
    </div>
  )
}
