import {
  addDays,
  differenceInCalendarDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  max,
  min,
  parseISO,
  startOfWeek
} from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { TIMEZONE } from "@/lib/constants";
import { getFeatureEnv } from "@/lib/env";
import { getRuntimeSettings } from "@/lib/runtime";
import type { AppDateContext } from "@/lib/types";

export function getSystemDateInTimezone() {
  return toZonedTime(new Date(), TIMEZONE);
}

export async function getCurrentAppDateContext(): Promise<{
  appDate: Date;
  systemDate: Date;
  simulatedDate: Date | null;
  source: AppDateContext["source"];
}> {
  const systemDate = getSystemDateInTimezone();
  const featureEnv = getFeatureEnv();
  let simulatedDate: Date | null = null;
  let source: AppDateContext["source"] = "system";

  try {
    const runtime = await getRuntimeSettings();

    if (runtime.simulation_enabled && runtime.simulated_now) {
      simulatedDate = toZonedTime(parseISO(runtime.simulated_now), TIMEZONE);
      source = "admin";
    }
  } catch {
    simulatedDate = null;
  }

  if (!simulatedDate && featureEnv.APP_SIMULATED_NOW) {
    simulatedDate = toZonedTime(parseISO(featureEnv.APP_SIMULATED_NOW), TIMEZONE);
    source = "env";
  }

  return {
    appDate: simulatedDate ?? systemDate,
    systemDate,
    simulatedDate,
    source
  };
}

export async function getCurrentAppDate() {
  return (await getCurrentAppDateContext()).appDate;
}

export async function getSerializableAppDateContext(): Promise<AppDateContext> {
  const { appDate, systemDate, simulatedDate, source } = await getCurrentAppDateContext();
  return {
    currentDate: appDate.toISOString(),
    systemDate: systemDate.toISOString(),
    simulatedDate: simulatedDate ? simulatedDate.toISOString() : null,
    isSimulated: Boolean(simulatedDate),
    source
  };
}

export function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateString(dateString: string) {
  return parseISO(dateString);
}

export function getPeriodProgressPct(startDate: string, endDate: string, today: Date) {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);

  if (isBefore(today, start)) {
    return 0;
  }

  if (isAfter(today, end)) {
    return 100;
  }

  const totalDays = Math.max(differenceInCalendarDays(end, start), 1);
  const elapsedDays = differenceInCalendarDays(today, start);
  return (elapsedDays / totalDays) * 100;
}

export function getWeeklyBuckets(startDate: string, endDate: string, today: Date) {
  const start = parseDateString(startDate);
  const end = min([parseDateString(endDate), today]);
  const safeStart = startOfWeek(start, { weekStartsOn: 1 });
  const safeEnd = endOfWeek(max([start, end]), { weekStartsOn: 1 });

  return eachWeekOfInterval(
    { start: safeStart, end: safeEnd },
    { weekStartsOn: 1 }
  ).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    return {
      weekStart,
      weekEnd,
      clampedStart: max([weekStart, start]),
      clampedEnd: min([weekEnd, parseDateString(endDate), today])
    };
  });
}

export function formatWeekLabel(weekStart: Date, weekEnd: Date) {
  return `${format(weekStart, "d MMM", { locale: fr })} - ${format(weekEnd, "d MMM", {
    locale: fr
  })}`;
}

export function isWithinRecentDays(entryDate: string, days: number, today: Date) {
  const entry = parseDateString(entryDate);
  const floor = addDays(today, -(days - 1));
  return !isBefore(entry, floor);
}
