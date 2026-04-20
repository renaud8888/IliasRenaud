import { z } from "zod";

const envSchema = z.object({
  SITE_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
  RENAUD_EMAIL: z.string().email(),
  ILIAS_EMAIL: z.string().email(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1)
});

type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse({
    SITE_PASSWORD: process.env.SITE_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    APP_URL: process.env.APP_URL,
    RENAUD_EMAIL: process.env.RENAUD_EMAIL,
    ILIAS_EMAIL: process.env.ILIAS_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET
  });

  return cachedEnv;
}
