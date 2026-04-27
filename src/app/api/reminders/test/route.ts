import { NextRequest, NextResponse } from "next/server"
import { isReminderEmailConfigured } from "@/lib/mail"
import nodemailer from "nodemailer"

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }

  return request.headers.get("authorization") === `Bearer ${secret}`
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS,
    },
    tls:
      process.env.GMAIL_SMTP_ALLOW_SELF_SIGNED === "true"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  })
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isReminderEmailConfigured()) {
    return NextResponse.json(
      { error: "Gmail SMTP email configuration is not set." },
      { status: 400 }
    )
  }

  const to =
    request.nextUrl.searchParams.get("to")?.trim() || process.env.ORDER_EMAIL_FROM || ""

  if (!to) {
    return NextResponse.json({ error: "Missing target email address." }, { status: 400 })
  }

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.ORDER_EMAIL_FROM,
      to,
      subject: "TaskFlow test email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2>TaskFlow test email</h2>
          <p>Ce si dobil to sporocilo, Gmail SMTP posiljanje deluje.</p>
          <p>Cas posiljanja: <strong>${new Date().toLocaleString("sl-SI")}</strong></p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, message: `Test email sent to ${to}.` })
  } catch (error) {
    console.error("Test email failed:", error)
    return NextResponse.json({ error: "Test email failed." }, { status: 500 })
  }
}
