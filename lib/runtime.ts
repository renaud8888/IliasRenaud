import { getFeatureEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AppRuntimeSettingsRecord } from "@/lib/types";

const DEFAULT_RUNTIME_SETTINGS: AppRuntimeSettingsRecord = {
  id: 1,
  simulation_enabled: false,
  simulated_now: null
};

export function areDevToolsEnabled() {
  const featureEnv = getFeatureEnv();
  return process.env.NODE_ENV !== "production" || featureEnv.ENABLE_TEST_TOOLS === true;
}

export function ensureDevToolsEnabled() {
  if (!areDevToolsEnabled()) {
    throw new Error("Les outils de simulation sont désactivés dans cet environnement.");
  }
}

export async function getRuntimeSettings(): Promise<AppRuntimeSettingsRecord> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("app_runtime_settings").select("*").eq("id", 1).maybeSingle();
  return (data as AppRuntimeSettingsRecord | null) ?? DEFAULT_RUNTIME_SETTINGS;
}

export async function updateRuntimeSettings(patch: Partial<AppRuntimeSettingsRecord>) {
  const supabase = getSupabaseAdmin();
  const payload = {
    ...DEFAULT_RUNTIME_SETTINGS,
    ...patch,
    id: 1
  };

  const { error } = await supabase.from("app_runtime_settings").upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

export async function resetRuntimeSettings() {
  await updateRuntimeSettings(DEFAULT_RUNTIME_SETTINGS);
}
