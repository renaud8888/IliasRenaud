import { Resend } from "resend";
import { getEmailEnv } from "@/lib/env";

export function getResendClient() {
  return new Resend(getEmailEnv().RESEND_API_KEY);
}
