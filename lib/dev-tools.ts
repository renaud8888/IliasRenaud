import { addDays, differenceInCalendarDays, format, set, startOfWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { buildMissedEntryReminderEmail, buildWeeklySummaryEmail } from "@/lib/email/templates";
import { getResendClient } from "@/lib/email/resend";
import { getEmailEnv } from "@/lib/env";
import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_MESSAGES,
  DEFAULT_PROFILE_CONFIG,
  DEV_SCENARIOS
} from "@/lib/default-seed";
import {
  getCurrentAppDate,
  getSerializableAppDateContext,
  parseDateString,
  toDateString
} from "@/lib/date";
import { getDashboardData, getBaseData } from "@/lib/services/dashboard";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getRuntimeSettings, resetRuntimeSettings, updateRuntimeSettings } from "@/lib/runtime";
import type {
  DevEmailDryRunItem,
  DevGenerateRequest,
  DevSnapshot,
  DevTrendMode,
  PersonSlug,
  ProfileRecord
} from "@/lib/types";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function shouldGenerateEntry(index: number, totalDays: number, request: DevGenerateRequest) {
  if (!request.includeMissingDays) {
    return true;
  }

  if (request.frequency === "daily") {
    return true;
  }

  if (request.frequency === "partial") {
    return Math.random() > 0.18;
  }

  const normalized = index / Math.max(totalDays, 1);
  const dynamicGapChance = normalized > 0.7 ? 0.45 : 0.3;
  return Math.random() > dynamicGapChance;
}

function getTrendFactor(trend: DevTrendMode, slug: PersonSlug) {
  if (trend === "behind") {
    return slug === "ilias" ? 0.62 : 0.74;
  }

  if (trend === "ahead") {
    return slug === "renaud" ? 1.18 : 1.08;
  }

  if (trend === "flat") {
    return 0.15;
  }

  return slug === "ilias" ? 0.97 : 1.03;
}

function buildWeightValue(params: {
  profile: ProfileRecord;
  index: number;
  totalDays: number;
  request: DevGenerateRequest;
}) {
  const { profile, index, totalDays, request } = params;
  const startWeight = Number(profile.start_weight);
  const targetWeight = Number(profile.target_weight);
  const ratio = totalDays <= 1 ? 1 : index / (totalDays - 1);
  const trendFactor = getTrendFactor(request.trend, profile.slug);
  const progressRatio = Math.min(Math.max(ratio * trendFactor, 0), 1.15);
  const baseWeight = startWeight + (targetWeight - startWeight) * progressRatio;
  const noise = request.includeNoise ? randomBetween(-0.45, 0.45) : 0;
  const weeklyRhythm = Math.sin(index / 3.3) * 0.22;
  return Number((baseWeight + weeklyRhythm + noise).toFixed(1));
}

async function upsertGeneratedEntries(params: {
  request: DevGenerateRequest;
  profiles: ProfileRecord[];
}) {
  const supabase = getSupabaseAdmin();
  const start = parseDateString(params.request.startDate);
  const end = parseDateString(params.request.endDate);
  const totalDays = differenceInCalendarDays(end, start) + 1;
  const dates = Array.from({ length: totalDays }, (_, index) => addDays(start, index));
  const rows: Array<{
    profile_id: string;
    entry_date: string;
    weight_kg: number;
    is_test_data: boolean;
    scenario_key: string | null;
  }> = [];

  for (const profile of params.profiles) {
    dates.forEach((date, index) => {
      if (!shouldGenerateEntry(index, totalDays, params.request)) {
        return;
      }

      rows.push({
        profile_id: profile.id,
        entry_date: toDateString(date),
        weight_kg: buildWeightValue({
          profile,
          index,
          totalDays,
          request: params.request
        }),
        is_test_data: true,
        scenario_key: params.request.scenarioKey ?? null
      });
    });
  }

  if (params.request.overwriteMode === "replace") {
    const { error } = await supabase.from("weight_entries").upsert(rows, {
      onConflict: "profile_id,entry_date"
    });

    if (error) {
      throw error;
    }
  } else {
    for (const row of rows) {
      const { data: existing } = await supabase
        .from("weight_entries")
        .select("id")
        .eq("profile_id", row.profile_id)
        .eq("entry_date", row.entry_date)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("weight_entries").insert(row);

        if (error) {
          throw error;
        }
      }
    }
  }

  return rows.length;
}

export async function generateFakeWeights(request: DevGenerateRequest) {
  const { profiles } = await getBaseData();
  const count = await upsertGeneratedEntries({
    request,
    profiles
  });

  return {
    success: true,
    inserted: count,
    request
  };
}

function nextMondayNoon(baseDate: Date) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const candidate = set(start, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
  return format(baseDate, "i") === "1" && baseDate <= candidate ? candidate : addDays(candidate, 7);
}

export async function applyScenario(key: string) {
  const appDate = await getCurrentAppDate();
  const endDate = toDateString(appDate);
  const scenarioRequestMap: Record<string, DevGenerateRequest> = {
    "scenario-a": {
      startDate: toDateString(subDays(appDate, 13)),
      endDate,
      frequency: "daily",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: false,
      scenarioKey: key
    },
    "scenario-b": {
      startDate: toDateString(subDays(appDate, 29)),
      endDate,
      frequency: "partial",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: true,
      scenarioKey: key
    },
    "scenario-c": {
      startDate: toDateString(subDays(appDate, 59)),
      endDate,
      frequency: "daily",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: false,
      scenarioKey: key
    },
    "scenario-d": {
      startDate: toDateString(subDays(appDate, 44)),
      endDate,
      frequency: "partial",
      trend: "behind",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: true,
      scenarioKey: key
    },
    "scenario-e": {
      startDate: toDateString(subDays(appDate, 44)),
      endDate,
      frequency: "daily",
      trend: "ahead",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: false,
      scenarioKey: key
    },
    "scenario-f": {
      startDate: toDateString(startOfWeek(appDate, { weekStartsOn: 1 })),
      endDate,
      frequency: "gaps",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: true,
      scenarioKey: key
    },
    "scenario-g": {
      startDate: toDateString(subDays(appDate, 24)),
      endDate: toDateString(subDays(appDate, 4)),
      frequency: "partial",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: true,
      scenarioKey: key
    },
    "scenario-h": {
      startDate: toDateString(subDays(appDate, 29)),
      endDate,
      frequency: "daily",
      trend: "realistic",
      overwriteMode: "replace",
      includeNoise: true,
      includeMissingDays: false,
      scenarioKey: key
    }
  };

  const request = scenarioRequestMap[key];

  if (!request) {
    throw new Error("Scénario inconnu.");
  }

  const result = await generateFakeWeights(request);

  if (key === "scenario-h") {
    await updateRuntimeSettings({
      simulation_enabled: true,
      simulated_now: nextMondayNoon(appDate).toISOString()
    });
  }

  return {
    ...result,
    scenario: DEV_SCENARIOS.find((item) => item.key === key) ?? null
  };
}

export async function deleteTestData() {
  const supabase = getSupabaseAdmin();
  await Promise.all([
    supabase.from("weight_entries").delete().eq("is_test_data", true),
    supabase.from("email_logs").delete().eq("is_test_data", true)
  ]);

  return { success: true };
}

export async function clearAllWeights() {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("weight_entries").delete().neq("id", "");

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function restoreInitialConfiguration() {
  const supabase = getSupabaseAdmin();
  const { profiles } = await getBaseData();

  const profileMap = Object.fromEntries(profiles.map((profile) => [profile.slug, profile]));

  await supabase.from("global_settings").update(DEFAULT_GLOBAL_SETTINGS).eq("id", 1);

  await Promise.all(
    (["ilias", "renaud"] as const).map(async (slug) => {
      const profile = profileMap[slug];

      if (!profile) {
        return;
      }

      const defaults = DEFAULT_PROFILE_CONFIG[slug];
      await supabase
        .from("profiles")
        .update({
          start_weight: defaults.start_weight,
          target_weight: defaults.target_weight,
          accent_color: defaults.accent_color
        })
        .eq("id", profile.id);

      await supabase.from("motivational_messages").delete().eq("profile_id", profile.id);
      await supabase.from("motivational_messages").insert(
        DEFAULT_MESSAGES[slug].map((content) => ({
          profile_id: profile.id,
          tone: "motivation",
          content,
          is_active: true
        }))
      );
    })
  );

  await resetRuntimeSettings();
  return { success: true };
}

export async function resetDefaultData() {
  const supabase = getSupabaseAdmin();
  await clearAllWeights();
  await restoreInitialConfiguration();
  await supabase.from("email_logs").delete().neq("id", "");
  return { success: true };
}

export async function exportSnapshot(): Promise<DevSnapshot> {
  const supabase = getSupabaseAdmin();
  const [{ settings, profiles, entries, messages }, runtimeSettings, { data: emailLogs }] = await Promise.all([
    getBaseData(),
    getRuntimeSettings(),
    supabase.from("email_logs").select("*").order("sent_at", { ascending: false })
  ]);

  return {
    exportedAt: (await getCurrentAppDate()).toISOString(),
    runtimeSettings,
    globalSettings: settings,
    profiles,
    messages,
    weightEntries: entries,
    emailLogs: (emailLogs ?? []) as DevSnapshot["emailLogs"]
  };
}

export async function restoreSnapshot(snapshot: DevSnapshot) {
  const supabase = getSupabaseAdmin();
  await supabase.from("weight_entries").delete().neq("id", "");
  await supabase.from("email_logs").delete().neq("id", "");
  await supabase.from("motivational_messages").delete().neq("id", "");

  await supabase.from("global_settings").update(snapshot.globalSettings).eq("id", 1);

  for (const profile of snapshot.profiles) {
    await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        goal_type: profile.goal_type,
        start_weight: profile.start_weight,
        target_weight: profile.target_weight,
        accent_color: profile.accent_color,
        order_index: profile.order_index
      })
      .eq("id", profile.id);
  }

  if (snapshot.messages.length > 0) {
    await supabase.from("motivational_messages").insert(snapshot.messages);
  }

  if (snapshot.weightEntries.length > 0) {
    await supabase.from("weight_entries").insert(snapshot.weightEntries);
  }

  if (snapshot.emailLogs.length > 0) {
    await supabase.from("email_logs").insert(snapshot.emailLogs);
  }

  await updateRuntimeSettings(snapshot.runtimeSettings);
  return { success: true };
}

export async function setSimulatedDate(params: { enabled: boolean; simulatedNow: string | null }) {
  await updateRuntimeSettings({
    simulation_enabled: params.enabled,
    simulated_now: params.enabled ? params.simulatedNow : null
  });

  return getSerializableAppDateContext();
}

export async function resetToSystemDate() {
  await updateRuntimeSettings({
    simulation_enabled: false,
    simulated_now: null
  });

  return getSerializableAppDateContext();
}

function getReminderReason(profileName: string) {
  return `${profileName} n'a aucun poids encodé sur les 3 derniers jours applicatifs.`;
}

export async function previewWeeklyEmails(): Promise<DevEmailDryRunItem[]> {
  const emailEnv = getEmailEnv();
  const dashboard = await getDashboardData();

  return dashboard.participants.map((participant) => ({
    profileSlug: participant.slug,
    firstName: participant.firstName,
    to: participant.slug === "ilias" ? emailEnv.ILIAS_EMAIL : emailEnv.RENAUD_EMAIL,
    subject: `Résumé hebdo - ${participant.firstName}`,
    reason: `Résumé hebdomadaire généré pour ${format(parseDateString(dashboard.dateContext.currentDate), "EEEE d MMMM yyyy", { locale: fr })}.`,
    html: buildWeeklySummaryEmail({
      participant,
      counterpart: dashboard.participants.find((item) => item.slug !== participant.slug),
      motivation: "Preview de test: résumé hebdomadaire.",
      currentDateLabel: format(parseDateString(dashboard.dateContext.currentDate), "d MMMM yyyy", {
        locale: fr
      })
    })
  }));
}

export async function previewMissedReminderEmails(): Promise<DevEmailDryRunItem[]> {
  const emailEnv = getEmailEnv();
  const { profiles, entries } = await getBaseData();
  const appDate = await getCurrentAppDate();
  const reminderWindowStart = toDateString(subDays(appDate, 2));

  return profiles
    .filter((profile) => {
      const latestEntry = entries.find((entry) => entry.profile_id === profile.id)?.entry_date ?? null;
      return latestEntry === null || latestEntry < reminderWindowStart;
    })
    .map((profile) => ({
      profileSlug: profile.slug,
      firstName: profile.first_name,
      to: profile.slug === "ilias" ? emailEnv.ILIAS_EMAIL : emailEnv.RENAUD_EMAIL,
      subject: `Rappel pesée - ${profile.first_name}`,
      reason: getReminderReason(profile.first_name),
      html: buildMissedEntryReminderEmail({
        firstName: profile.first_name,
        motivation: "Preview de test: rappel d'oubli."
      })
    }));
}

export async function insertTestEmailLogs(type: "weekly_summary" | "missed_entry_reminder") {
  const supabase = getSupabaseAdmin();
  const { profiles } = await getBaseData();
  const appDate = await getCurrentAppDate();

  await supabase.from("email_logs").insert(
    profiles.map((profile) => ({
      profile_id: profile.id,
      email_type: type,
      sent_at: appDate.toISOString(),
      is_test_data: true,
      scenario_key: `manual-${type}`
    }))
  );
}

export async function sendWeeklyEmailsForTest() {
  const resend = getResendClient();
  const emailEnv = getEmailEnv();
  const items = await previewWeeklyEmails();

  for (const item of items) {
    await resend.emails.send({
      from: emailEnv.RESEND_FROM_EMAIL,
      to: item.to,
      subject: `[TEST] ${item.subject}`,
      html: item.html
    });
  }

  await insertTestEmailLogs("weekly_summary");
  return { success: true, sent: items.length };
}

export async function sendReminderEmailsForTest() {
  const resend = getResendClient();
  const emailEnv = getEmailEnv();
  const items = await previewMissedReminderEmails();

  for (const item of items) {
    await resend.emails.send({
      from: emailEnv.RESEND_FROM_EMAIL,
      to: item.to,
      subject: `[TEST] ${item.subject}`,
      html: item.html
    });
  }

  if (items.length > 0) {
    await insertTestEmailLogs("missed_entry_reminder");
  }

  return { success: true, sent: items.length };
}
