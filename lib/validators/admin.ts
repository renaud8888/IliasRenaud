import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.");

export const messageListSchema = z.array(
  z.object({
    id: z.string().uuid().optional(),
    content: z.string().min(5).max(280),
    tone: z.string().min(2).max(50).default("motivation"),
    is_active: z.boolean().default(true)
  })
);

export const adminSettingsSchema = z.object({
  settings: z.object({
    start_date: isoDateSchema,
    end_date: isoDateSchema,
    status_tolerance_pct: z.coerce.number().min(0).max(30),
    reminder_cooldown_days: z.coerce.number().int().min(1).max(14),
    weekly_email_enabled: z.boolean(),
    missed_entry_email_enabled: z.boolean(),
    weekly_email_hour_local: z.string().regex(/^\d{2}:00$/)
  }),
  profiles: z.array(
    z.object({
      id: z.string().uuid(),
      start_weight: z.coerce.number().min(30).max(250),
      target_weight: z.coerce.number().min(30).max(250)
    })
  ),
  messagesByProfile: z.record(messageListSchema)
});
