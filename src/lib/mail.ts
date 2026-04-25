import type { SanityTodo } from "@/lib/sanity-utils"

const RESEND_API_URL = "https://api.resend.com/emails"

function getAppUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? ""
}

export function isReminderEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL)
}

export async function sendTaskReminderEmail(todo: SanityTodo) {
  if (!isReminderEmailConfigured()) {
    throw new Error("Reminder email configuration is missing.")
  }

  const dueLabel = todo.dueDate
    ? new Intl.DateTimeFormat("sl-SI", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(todo.dueDate))
    : "brez roka"

  const dashboardUrl = `${getAppUrl()}/dashboard`
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REMINDER_FROM_EMAIL,
      to: [todo.user.email],
      subject: `Opomnik: "${todo.title}" zapade kmalu`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin-bottom: 12px;">Opomnik za nalogo</h2>
          <p>Naloga <strong>${todo.title}</strong> ima rok <strong>${dueLabel}</strong>.</p>
          ${
            todo.description
              ? `<p style="margin-top: 12px;"><strong>Opis:</strong><br />${todo.description}</p>`
              : ""
          }
          ${
            dashboardUrl !== "/dashboard"
              ? `<p style="margin-top: 20px;"><a href="${dashboardUrl}" style="color: #2563eb;">Odpri TaskFlow dashboard</a></p>`
              : ""
          }
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(`Reminder email failed: ${payload}`)
  }
}
