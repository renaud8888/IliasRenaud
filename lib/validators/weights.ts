import { z } from "zod";
import { SPORT_ACTIVITY_TYPES } from "@/lib/constants";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.");
const sportActivitySchema = z.enum(SPORT_ACTIVITY_TYPES);
const booleanFromFormSchema = z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true");
const sportFields = {
  sportDone: booleanFromFormSchema.default(false),
  sportActivityType: sportActivitySchema.nullable().optional(),
  sportNote: z.string().trim().max(120).nullable().optional()
};

function normalizeSportPayload<T extends z.ZodRawShape>(shape: T) {
  return z.object({
    ...shape,
    ...sportFields
  }).transform((value, ctx) => {
  if (!value.sportDone) {
    return {
      ...value,
      sportDone: false,
      sportActivityType: null,
      sportNote: null
    };
  }

  if (!value.sportActivityType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choisis un type d’activité."
    });
    return z.NEVER;
  }

  return {
    ...value,
    sportDone: true,
    sportActivityType: value.sportActivityType,
    sportNote: value.sportNote?.trim() || null
  };
  });
}

export const weightInputSchema = normalizeSportPayload({
  profileSlug: z.enum(["ilias", "renaud", "kamran"]),
  entryDate: isoDateSchema,
  weightKg: z.coerce.number().min(30).max(250)
});

export const adminWeightUpdateSchema = normalizeSportPayload({
  entryDate: isoDateSchema,
  weightKg: z.coerce.number().min(30).max(250)
});

export const sportUpdateSchema = normalizeSportPayload({
  profileSlug: z.enum(["ilias", "renaud", "kamran"]),
  entryDate: isoDateSchema
});
