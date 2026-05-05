import { format, startOfWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { PERSON_EMAIL_ENV_KEYS } from "@/lib/constants";
import { buildMissedEntryReminderEmail, buildWeeklySummaryEmail } from "@/lib/email/templates";
import { getResendClient } from "@/lib/email/resend";
import { getEmailEnv } from "@/lib/env";
import { getCurrentAppDate, parseDateString, toDateString } from "@/lib/date";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getDashboardData, getBaseData } from "@/lib/services/dashboard";
import type { ParticipantDashboard, PersonSlug } from "@/lib/types";

function isDateWithinChallengePeriod(dateString: string, settings: {
  start_date: string;
  end_date: string;
}) {
  return dateString >= settings.start_date && dateString <= settings.end_date;
}

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
  const env = getEmailEnv();
  return env[PERSON_EMAIL_ENV_KEYS[slug]] ?? "";
}

async function sendEmailOrThrow(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  const result = await resend.emails.send(params);

  if (result.error) {
    throw new Error(`Resend a refusé l'email "${params.subject}" vers ${params.to}: ${result.error.message}`);
  }

  return result.data;
}

export async function sendWeeklySummaryEmails() {
  const env = getEmailEnv();
  const dashboard = await getDashboardData();
  const { settings, profiles, messages } = await getBaseData();
  const currentAppDate = parseDateString(dashboard.dateContext.currentDate);
  const currentDateString = toDateString(currentAppDate);

  if (!isDateWithinChallengePeriod(currentDateString, settings)) {
    return { sent: 0, skipped: true, reason: "outside_challenge_period" };
  }

  const currentWeekStart = `${toDateString(startOfWeek(currentAppDate, { weekStartsOn: 1 }))}T00:00:00`;
  const supabase = getSupabaseAdmin();
  let sentCount = 0;

  for (const participant of dashboard.participants) {
    const counterpart = dashboard.participants.find((item) => item.slug !== participant.slug);
    const profile = profiles.find((item) => item.slug === participant.slug);
    const recipient = getRecipientEmail(participant.slug);
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

    if (!recipient) {
      continue;
    }

    await sendEmailOrThrow({
      from: env.RESEND_FROM_EMAIL,
      to: recipient,
      subject: `Résumé hebdo - ${participant.firstName}`,
      html: buildWeeklySummaryEmail({
        participant,
        counterpart,
        motivation,
        currentDateLabel: format(currentAppDate, "d MMMM yyyy", { locale: fr })
      })
    });

    if (profile) {
      await logEmail({
        profileId: profile.id,
        emailType: "weekly_summary"
      });
    }

    sentCount += 1;
  }

  return { sent: sentCount };
}

async function hasReminderForMissedDate(profileId: string, missedEntryDate: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("profile_id", profileId)
    .eq("email_type", "missed_entry_reminder")
    .eq("reminder_window_start", missedEntryDate)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

function hasEntryForProfileDate(
  profileId: string,
  entryDate: string,
  entries: Array<{ profile_id: string; entry_date: string }>
) {
  return entries.some((entry) => entry.profile_id === profileId && entry.entry_date === entryDate);
}

export async function sendMissedEntryReminders() {
  const env = getEmailEnv();
  const { settings, profiles, entries, messages } = await getBaseData();

  if (!settings.missed_entry_email_enabled) {
    return { sent: 0 };
  }

  const today = await getCurrentAppDate();
  const missedEntryDate = toDateString(subDays(today, 1));

  if (!isDateWithinChallengePeriod(missedEntryDate, settings)) {
    return { sent: 0, skipped: true, reason: "outside_challenge_period" };
  }

  let sentCount = 0;

  for (const profile of profiles) {
    const recipient = getRecipientEmail(profile.slug);
    const hasYesterdayEntry = hasEntryForProfileDate(profile.id, missedEntryDate, entries);

    if (hasYesterdayEntry) {
      continue;
    }

    const alreadySent = await hasReminderForMissedDate(profile.id, missedEntryDate);

    if (alreadySent) {
      continue;
    }

    const messagePool = messages.filter((message) => message.profile_id === profile.id);
    const motivation =
      messagePool[Math.floor(Math.random() * Math.max(messagePool.length, 1))]?.content ??
      "Une mesure aujourd'hui remet tout de suite le projet sur ses rails.";

    if (!recipient) {
      continue;
    }

    await sendEmailOrThrow({
      from: env.RESEND_FROM_EMAIL,
      to: recipient,
      subject: `Rappel pesée - ${profile.first_name}`,
      html: buildMissedEntryReminderEmail({
        firstName: profile.first_name,
        motivation
      })
    });

    await logEmail({
      profileId: profile.id,
      emailType: "missed_entry_reminder",
      reminderWindowStart: missedEntryDate
    });
    sentCount += 1;
  }

  return { sent: sentCount };
}

export function buildWeeklyEmailPreview(participant: ParticipantDashboard) {
  return buildWeeklySummaryEmail({
    participant,
    motivation: "Tu avances mieux quand tu restes simple, régulier et propre.",
    counterpart: undefined,
    currentDateLabel: format(parseDateString("2026-05-05"), "d MMMM yyyy", { locale: fr })
  });
}

export async function isWithinWeeklySendWindow(expectedLocalHour: string) {
  const now = await getCurrentAppDate();
  void expectedLocalHour;
  return format(now, "i") === "1";
}
