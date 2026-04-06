import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Geslo mora biti dolgo vsaj 8 znakov")
  .regex(/[A-Za-z]/, "Geslo mora vsebovati vsaj eno crko")
  .regex(/[0-9]/, "Geslo mora vsebovati vsaj eno stevilko")

const RECOVERY_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateRecoveryCode() {
  return Array.from({ length: 4 }, () =>
    Array.from(crypto.getRandomValues(new Uint32Array(4)))
      .map((value) => RECOVERY_CODE_CHARS[value % RECOVERY_CODE_CHARS.length])
      .join("")
  ).join("-")
}
