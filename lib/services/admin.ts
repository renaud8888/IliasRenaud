import { getSupabaseAdmin } from "@/lib/supabase/server";
import { adminSettingsSchema } from "@/lib/validators/admin";

export async function saveAdminSettings(payload: unknown) {
  const parsed = adminSettingsSchema.parse(payload);
  const supabase = getSupabaseAdmin();

  const { error: settingsError } = await supabase
    .from("global_settings")
    .update(parsed.settings)
    .eq("id", 1);

  if (settingsError) {
    throw settingsError;
  }

  for (const profile of parsed.profiles) {
    const { error } = await supabase
      .from("profiles")
      .update({
        start_weight: profile.start_weight,
        target_weight: profile.target_weight
      })
      .eq("id", profile.id);

    if (error) {
      throw error;
    }
  }

  for (const [profileId, messages] of Object.entries(parsed.messagesByProfile)) {
    const { error: deleteError } = await supabase
      .from("motivational_messages")
      .delete()
      .eq("profile_id", profileId);

    if (deleteError) {
      throw deleteError;
    }

    const cleanMessages = messages
      .map((message) => ({
        profile_id: profileId,
        content: message.content.trim(),
        tone: message.tone,
        is_active: message.is_active
      }))
      .filter((message) => message.content.length > 0);

    if (cleanMessages.length > 0) {
      const { error: insertError } = await supabase.from("motivational_messages").insert(cleanMessages);

      if (insertError) {
        throw insertError;
      }
    }
  }

  return parsed;
}
