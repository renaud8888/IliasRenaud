import { z } from "zod";

const authEnvSchema = z.object({
  SITE_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(1)
});

const supabaseEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

const emailEnvSchema = z.object({
  APP_URL: z.string().url(),
  RENAUD_EMAIL: z.string().email(),
  ILIAS_EMAIL: z.string().email(),
  KAMRAN_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1)
});

const cronEnvSchema = z.object({
  CRON_SECRET: z.string().min(1)
});

const featureEnvSchema = z.object({
  ENABLE_TEST_TOOLS: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  APP_SIMULATED_NOW: z.string().datetime().optional().or(z.literal("").transform(() => undefined))
});

type AuthEnv = z.infer<typeof authEnvSchema>;
type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;
type EmailEnv = z.infer<typeof emailEnvSchema>;
type CronEnv = z.infer<typeof cronEnvSchema>;
type FeatureEnv = z.infer<typeof featureEnvSchema>;

let cachedAuthEnv: AuthEnv | null = null;
let cachedSupabaseEnv: SupabaseEnv | null = null;
let cachedEmailEnv: EmailEnv | null = null;
let cachedCronEnv: CronEnv | null = null;
let cachedFeatureEnv: FeatureEnv | null = null;

export function getAuthEnv(): AuthEnv {
  if (cachedAuthEnv) {
    return cachedAuthEnv;
  }

  cachedAuthEnv = authEnvSchema.parse({
    SITE_PASSWORD: process.env.SITE_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET
  });

  return cachedAuthEnv;
}

export function getSupabaseEnv(): SupabaseEnv {
  if (cachedSupabaseEnv) {
    return cachedSupabaseEnv;
  }

  cachedSupabaseEnv = supabaseEnvSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  return cachedSupabaseEnv;
}

export function getEmailEnv(): EmailEnv {
  if (cachedEmailEnv) {
    return cachedEmailEnv;
  }

  cachedEmailEnv = emailEnvSchema.parse({
    APP_URL: process.env.APP_URL,
    RENAUD_EMAIL: process.env.RENAUD_EMAIL,
    ILIAS_EMAIL: process.env.ILIAS_EMAIL,
    KAMRAN_EMAIL: process.env.KAMRAN_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL
  });

  return cachedEmailEnv;
}

export function getCronEnv(): CronEnv {
  if (cachedCronEnv) {
    return cachedCronEnv;
  }

  cachedCronEnv = cronEnvSchema.parse({
    CRON_SECRET: process.env.CRON_SECRET
  });

  return cachedCronEnv;
}

export function getFeatureEnv(): FeatureEnv {
  if (cachedFeatureEnv) {
    return cachedFeatureEnv;
  }

  cachedFeatureEnv = featureEnvSchema.parse({
    ENABLE_TEST_TOOLS: process.env.ENABLE_TEST_TOOLS,
    APP_SIMULATED_NOW: process.env.APP_SIMULATED_NOW
  });

  return cachedFeatureEnv;
}
