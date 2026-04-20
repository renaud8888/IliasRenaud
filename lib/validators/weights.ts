import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.");

export const weightInputSchema = z.object({
  profileSlug: z.enum(["ilias", "renaud"]),
  entryDate: isoDateSchema,
  weightKg: z.coerce.number().min(30).max(250)
});

export const adminWeightUpdateSchema = z.object({
  entryDate: isoDateSchema,
  weightKg: z.coerce.number().min(30).max(250)
});
