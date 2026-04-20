import { Resend } from "resend";
import { getEnv } from "@/lib/env";

export function getResendClient() {
  return new Resend(getEnv().RESEND_API_KEY);
}
