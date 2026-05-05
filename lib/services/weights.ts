import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PersonSlug, SportActivityType, WeightMutationResponse } from "@/lib/types";

function assertEntryDateWithinChallenge(entryDate: string, settings: {
  start_date: string;
  end_date: string;
}) {
  if (entryDate < settings.start_date || entryDate > settings.end_date) {
    throw new Error(`La date doit être comprise entre le ${settings.start_date} et le ${settings.end_date}.`);
  }
}

export async function upsertWeightEntry(params: {
  profileSlug: PersonSlug;
  entryDate: string;
  weightKg: number;
  sportDone?: boolean;
  sportActivityType?: SportActivityType | null;
  sportNote?: string | null;
}): Promise<WeightMutationResponse> {
  const supabase = getSupabaseAdmin();
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id")
      .eq("slug", params.profileSlug)
      .single(),
    supabase
      .from("global_settings")
      .select("start_date,end_date")
      .eq("id", 1)
      .single()
  ]);

  if (!profile) {
    throw new Error("Participant introuvable.");
  }

  if (!settings) {
    throw new Error("Configuration globale introuvable.");
  }

  assertEntryDateWithinChallenge(params.entryDate, settings);

  const { error } = await supabase.from("weight_entries").upsert(
    {
      profile_id: profile.id,
      entry_date: params.entryDate,
      weight_kg: params.weightKg,
      sport_done: params.sportDone ?? false,
      sport_activity_type: params.sportDone ? params.sportActivityType ?? "Autre" : null,
      sport_note: params.sportDone ? params.sportNote ?? null : null,
      sport_updated_at: params.sportDone ? new Date().toISOString() : null
    },
    {
      onConflict: "profile_id,entry_date"
    }
  );

  if (error) {
    throw error;
  }

  const { data: messages } = await supabase
    .from("motivational_messages")
    .select("content")
    .eq("profile_id", profile.id)
    .eq("is_active", true);

  const motivationalMessage =
    messages && messages.length > 0 ? messages[randomInt(messages.length)].content : null;

  return {
    success: true,
    participant: params.profileSlug,
    entryDate: params.entryDate,
    weightKg: params.weightKg,
    motivationalMessage
  };
}

export async function updateWeightEntry(entryId: string, params: {
  entryDate: string;
  weightKg: number;
  sportDone?: boolean;
  sportActivityType?: SportActivityType | null;
  sportNote?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data: settings } = await supabase
    .from("global_settings")
    .select("start_date,end_date")
    .eq("id", 1)
    .single();

  if (!settings) {
    throw new Error("Configuration globale introuvable.");
  }

  assertEntryDateWithinChallenge(params.entryDate, settings);

  const { error } = await supabase
    .from("weight_entries")
    .update({
      entry_date: params.entryDate,
      weight_kg: params.weightKg,
      sport_done: params.sportDone ?? false,
      sport_activity_type: params.sportDone ? params.sportActivityType ?? "Autre" : null,
      sport_note: params.sportDone ? params.sportNote ?? null : null,
      sport_updated_at: params.sportDone ? new Date().toISOString() : null
    })
    .eq("id", entryId);

  if (error) {
    throw error;
  }
}

export async function updateSportForWeightEntry(params: {
  profileSlug: PersonSlug;
  entryDate: string;
  sportDone: boolean;
  sportActivityType: SportActivityType | null;
  sportNote: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", params.profileSlug)
    .single();

  if (!profile) {
    throw new Error("Participant introuvable.");
  }

  const { data: entry } = await supabase
    .from("weight_entries")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("entry_date", params.entryDate)
    .maybeSingle();

  if (!entry) {
    throw new Error("Remplis d’abord la pesée du jour pour associer une activité.");
  }

  const { error } = await supabase
    .from("weight_entries")
    .update({
      sport_done: params.sportDone,
      sport_activity_type: params.sportDone ? params.sportActivityType ?? "Autre" : null,
      sport_note: params.sportDone ? params.sportNote : null,
      sport_updated_at: new Date().toISOString()
    })
    .eq("id", entry.id);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function deleteWeightEntry(entryId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("weight_entries").delete().eq("id", entryId);

  if (error) {
    throw error;
  }
}
