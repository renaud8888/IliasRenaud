import { differenceInCalendarDays } from "date-fns";
import { PERSON_EMAIL_ENV_KEYS } from "@/lib/constants";
import { buildParticipantDashboard } from "@/lib/calculations";
import { DEV_SCENARIOS } from "@/lib/default-seed";
import { getSerializableAppDateContext, parseDateString } from "@/lib/date";
import { areDevToolsEnabled, getRuntimeSettings } from "@/lib/runtime";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  AdminPayload,
  DashboardPayload,
  GlobalSettingsRecord,
  MotivationalMessageRecord,
  ProfileRecord,
  WeightEntryRecord
} from "@/lib/types";

function assertData<T>(value: T | null, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

export async function getBaseData() {
  const supabase = getSupabaseAdmin();
  const [{ data: settings }, { data: profiles }, { data: entries }, { data: messages }] =
    await Promise.all([
      supabase.from("global_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("profiles").select("*").order("order_index"),
      supabase.from("weight_entries").select("*").order("entry_date", { ascending: false }),
      supabase
        .from("motivational_messages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
    ]);

  return {
    settings: assertData(settings as GlobalSettingsRecord | null, "Configuration globale introuvable."),
    profiles: (profiles ?? []) as ProfileRecord[],
    entries: (entries ?? []) as WeightEntryRecord[],
    messages: (messages ?? []) as MotivationalMessageRecord[]
  };
}

export async function getDashboardData(): Promise<DashboardPayload> {
  const [{ settings, profiles, entries, messages }, dateContext] = await Promise.all([
    getBaseData(),
    getSerializableAppDateContext()
  ]);
  const currentDate = parseDateString(dateContext.currentDate);

  return {
    generatedAt: dateContext.currentDate,
    dateContext,
    period: {
      startDate: settings.start_date,
      endDate: settings.end_date,
      totalDays: differenceInCalendarDays(parseDateString(settings.end_date), parseDateString(settings.start_date)) + 1,
      tolerancePct: Number(settings.status_tolerance_pct)
    },
    participants: profiles.map((profile) =>
      buildParticipantDashboard({
        profile,
        settings,
        entries: entries.filter((entry) => entry.profile_id === profile.id),
        messagePoolSize: messages.filter((message) => message.profile_id === profile.id).length,
        currentDate
      })
    )
  };
}

export async function getAdminData(): Promise<AdminPayload> {
  const [{ settings, profiles, entries, messages }, runtimeSettings, dateContext] = await Promise.all([
    getBaseData(),
    getRuntimeSettings(),
    getSerializableAppDateContext()
  ]);

  return {
    settings,
    runtime: {
      settings: runtimeSettings,
      dateContext,
      devToolsEnabled: areDevToolsEnabled(),
      scenarios: DEV_SCENARIOS
    },
    profiles: profiles.map((profile) => ({
      ...profile,
      email: process.env[PERSON_EMAIL_ENV_KEYS[profile.slug]] ?? "",
      messages: messages.filter((message) => message.profile_id === profile.id)
    })),
    weightEntries: entries
      .map((entry) => {
        const profile = profiles.find((item) => item.id === entry.profile_id);

        if (!profile) {
          return null;
        }

        return {
          ...entry,
          first_name: profile.first_name,
          slug: profile.slug
        };
      })
      .filter(Boolean) as AdminPayload["weightEntries"]
  };
}
