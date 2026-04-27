import { processReminderEmails } from "@/lib/reminders"

const globalReminderScheduler = globalThis as typeof globalThis & {
  __taskflowReminderSchedulerStarted?: boolean
  __taskflowReminderSchedulerRunning?: boolean
}

const INTERVAL_MS = 60 * 1000

async function tick() {
  if (globalReminderScheduler.__taskflowReminderSchedulerRunning) {
    return
  }

  globalReminderScheduler.__taskflowReminderSchedulerRunning = true

  try {
    const result = await processReminderEmails()
    if (result.sent || result.failed) {
      console.log(
        `[TaskFlow reminders] scanned=${result.scanned} sent=${result.sent} failed=${result.failed}`
      )
    }
  } catch (error) {
    console.error("[TaskFlow reminders] automatic processing failed:", error)
  } finally {
    globalReminderScheduler.__taskflowReminderSchedulerRunning = false
  }
}

if (
  process.env.NODE_ENV === "development" &&
  !globalReminderScheduler.__taskflowReminderSchedulerStarted
) {
  globalReminderScheduler.__taskflowReminderSchedulerStarted = true
  void tick()
  setInterval(() => {
    void tick()
  }, INTERVAL_MS)
  console.log("[TaskFlow reminders] development scheduler started (every 60s)")
}
