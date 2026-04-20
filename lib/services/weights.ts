import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PersonSlug, WeightMutationResponse } from "@/lib/types";

export async function upsertWeightEntry(params: {
  profileSlug: PersonSlug;
  entryDate: string;
  weightKg: number;
}): Promise<WeightMutationResponse> {
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", params.profileSlug)
    .single();

  if (!profile) {
    throw new Error("Participant introuvable.");
  }

  const { error } = await supabase.from("weight_entries").upsert(
    {
      profile_id: profile.id,
      entry_date: params.entryDate,
      weight_kg: params.weightKg
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

export async function updateWeightEntry(entryId: string, params: { entryDate: string; weightKg: number }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("weight_entries")
    .update({
      entry_date: params.entryDate,
      weight_kg: params.weightKg
    })
    .eq("id", entryId);

  if (error) {
    throw error;
  }
}

export async function deleteWeightEntry(entryId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("weight_entries").delete().eq("id", entryId);

  if (error) {
    throw error;
  }
}
