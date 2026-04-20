import { format, startOfWeek, subDays } from "date-fns";
import { PERSON_EMAIL_ENV_KEYS } from "@/lib/constants";
import { buildMissedEntryReminderEmail, buildWeeklySummaryEmail } from "@/lib/email/templates";
import { getResendClient } from "@/lib/email/resend";
import { getEnv } from "@/lib/env";
import { getTodayInTimezone, toDateString } from "@/lib/date";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getDashboardData, getBaseData } from "@/lib/services/dashboard";
import type { ParticipantDashboard, PersonSlug } from "@/lib/types";

async function logEmail(params: {
  profileId: string;
  emailType: "weekly_summary" | "missed_entry_reminder";
  reminderWindowStart?: string;
}) {
  const supabase = getSupabaseAdmin();

  await supabase.from("email_logs").insert({
    profile_id: params.profileId,
    email_type: params.emailType,
    reminder_window_start: params.reminderWindowStart ?? null
  });
}

function getRecipientEmail(slug: PersonSlug) {
  const env = getEnv();
  return env[PERSON_EMAIL_ENV_KEYS[slug]];
}

export async function sendWeeklySummaryEmails() {
  const env = getEnv();
  const resend = getResendClient();
  const dashboard = await getDashboardData();
  const { profiles, messages } = await getBaseData();
  const currentWeekStart = `${toDateString(startOfWeek(getTodayInTimezone(), { weekStartsOn: 1 }))}T00:00:00`;
  const supabase = getSupabaseAdmin();

  for (const participant of dashboard.participants) {
    const counterpart = dashboard.participants.find((item) => item.slug !== participant.slug);
    const profile = profiles.find((item) => item.slug === participant.slug);
    const messagePool = messages.filter((message) => message.profile_id === profile?.id);
    const motivation =
      messagePool[Math.floor(Math.random() * Math.max(messagePool.length, 1))]?.content ??
      "Une semaine propre vaut mieux qu'un grand sprint raté. Continue.";

    if (profile) {
      const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("email_type", "weekly_summary")
        .gte("sent_at", currentWeekStart)
        .limit(1)
        .maybeSingle();

      if (existingLog) {
        continue;
      }
    }

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: getRecipientEmail(participant.slug),
      subject: `Résumé hebdo - ${participant.firstName}`,
      html: buildWeeklySummaryEmail({
        participant,
        counterpart,
        motivation
      })
    });

    if (profile) {
      await logEmail({
        profileId: profile.id,
        emailType: "weekly_summary"
      });
    }
  }
}

async function hasRecentReminder(profileId: string, cooldownDays: number) {
  const supabase = getSupabaseAdmin();
  const sinceDate = toDateString(subDays(getTodayInTimezone(), cooldownDays));
  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("profile_id", profileId)
    .eq("email_type", "missed_entry_reminder")
    .gte("sent_at", `${sinceDate}T00:00:00`);

  return (data?.length ?? 0) > 0;
}

function getLatestEntryDateForProfile(profileId: string, entries: Array<{ profile_id: string; entry_date: string }>) {
  return entries.find((entry) => entry.profile_id === profileId)?.entry_date ?? null;
}

export async function sendMissedEntryReminders() {
  const env = getEnv();
  const resend = getResendClient();
  const { settings, profiles, entries, messages } = await getBaseData();

  if (!settings.missed_entry_email_enabled) {
    return { sent: 0 };
  }

  const today = getTodayInTimezone();
  const reminderWindowStart = toDateString(subDays(today, 2));
  let sentCount = 0;

  for (const profile of profiles) {
    const latestEntryDate = getLatestEntryDateForProfile(profile.id, entries);
    const missedSince =
      latestEntryDate === null || latestEntryDate < reminderWindowStart;

    if (!missedSince) {
      continue;
    }

    const alreadySent = await hasRecentReminder(profile.id, settings.reminder_cooldown_days);

    if (alreadySent) {
      continue;
    }

    const messagePool = messages.filter((message) => message.profile_id === profile.id);
    const motivation =
      messagePool[Math.floor(Math.random() * Math.max(messagePool.length, 1))]?.content ??
      "Une mesure aujourd'hui remet tout de suite le projet sur ses rails.";

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: getRecipientEmail(profile.slug),
      subject: `Rappel pesée - ${profile.first_name}`,
      html: buildMissedEntryReminderEmail({
        firstName: profile.first_name,
        motivation
      })
    });

    await logEmail({
      profileId: profile.id,
      emailType: "missed_entry_reminder",
      reminderWindowStart
    });
    sentCount += 1;
  }

  return { sent: sentCount };
}

export function buildWeeklyEmailPreview(participant: ParticipantDashboard) {
  return buildWeeklySummaryEmail({
    participant,
    motivation: "Tu avances mieux quand tu restes simple, régulier et propre.",
    counterpart: undefined
  });
}

export function isWithinWeeklySendWindow(expectedLocalHour: string) {
  const now = getTodayInTimezone();
  return format(now, "i") === "1" && format(now, "HH:00") === expectedLocalHour;
}
