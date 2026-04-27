import nodemailer from "nodemailer"
import type { SanityTodo } from "@/lib/sanity-utils"

function getAppUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? ""
}

function shouldAllowSelfSigned() {
  return process.env.GMAIL_SMTP_ALLOW_SELF_SIGNED === "true"
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS,
    },
    tls: shouldAllowSelfSigned()
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  })
}

export function isReminderEmailConfigured() {
  return Boolean(
    process.env.ORDER_EMAIL_FROM &&
      process.env.GMAIL_SMTP_USER &&
      process.env.GMAIL_SMTP_PASS
  )
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
  const transporter = createTransporter()

  await transporter.sendMail({
    from: process.env.ORDER_EMAIL_FROM,
    to: todo.user.email,
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
  })
}
