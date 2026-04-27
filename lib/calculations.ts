import { differenceInCalendarDays, isAfter, isBefore, startOfMonth, startOfWeek, subDays } from "date-fns";
import {
  formatDayLabel,
  getPeriodProgressPct,
  getWeeklyBuckets,
  toDateString,
  formatWeekLabel,
  parseDateString
} from "@/lib/date";
import type {
  DailyPoint,
  GlobalSettingsRecord,
  ParticipantDashboard,
  ProfileRecord,
  ProgressStatus,
  SportActivityType,
  WeightEntryRecord,
  WeeklyPoint
} from "@/lib/types";
import { clamp, round } from "@/lib/utils";

function calculateRealProgress(startWeight: number, targetWeight: number, currentWeight: number) {
  const totalDelta = targetWeight - startWeight;

  if (totalDelta === 0) {
    return 100;
  }

  const traveled = currentWeight - startWeight;
  return clamp((traveled / totalDelta) * 100, 0, 100);
}

function calculateFrequentActivity(entries: WeightEntryRecord[]): SportActivityType | null {
  const counts = entries.reduce<Partial<Record<SportActivityType, number>>>((acc, entry) => {
    if (!entry.sport_done || !entry.sport_activity_type) {
      return acc;
    }

    acc[entry.sport_activity_type] = (acc[entry.sport_activity_type] ?? 0) + 1;
    return acc;
  }, {});

  return (Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] as SportActivityType | undefined) ?? null;
}

function calculateActiveStreak(entries: WeightEntryRecord[], currentDate: Date) {
  const sportDates = new Set(entries.filter((entry) => entry.sport_done).map((entry) => entry.entry_date));
  let streak = 0;
  let cursor = currentDate;

  while (sportDates.has(toDateString(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

function determineStatus(
  realProgressPct: number,
  theoreticalProgressPct: number,
  tolerancePct: number
): ProgressStatus {
  if (realProgressPct > theoreticalProgressPct + tolerancePct) {
    return "en avance";
  }

  if (realProgressPct < theoreticalProgressPct - tolerancePct) {
    return "en retard";
  }

  return "dans les temps";
}

function calculateTheoreticalWeight(
  startWeight: number,
  targetWeight: number,
  startDate: string,
  endDate: string,
  date: Date
) {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);

  if (isBefore(date, start)) {
    return startWeight;
  }

  if (isAfter(date, end)) {
    return targetWeight;
  }

  const totalDays = Math.max(differenceInCalendarDays(end, start), 1);
  const elapsedDays = differenceInCalendarDays(date, start);
  const ratio = elapsedDays / totalDays;
  return round(startWeight + (targetWeight - startWeight) * ratio, 1);
}

export function buildParticipantDashboard(params: {
  profile: ProfileRecord;
  settings: GlobalSettingsRecord;
  entries: WeightEntryRecord[];
  messagePoolSize: number;
  currentDate: Date;
}): ParticipantDashboard {
  const { profile, settings, entries, messagePoolSize, currentDate } = params;
  const weeklyBuckets = getWeeklyBuckets(settings.start_date, settings.end_date, currentDate);

  const weeklyChart: WeeklyPoint[] = weeklyBuckets.map((bucket) => {
    const bucketEntries = entries.filter(
      (entry) =>
        entry.entry_date >= toDateString(bucket.clampedStart) &&
        entry.entry_date <= toDateString(bucket.clampedEnd)
    );

    const averageWeight =
      bucketEntries.length > 0
        ? round(
            bucketEntries.reduce((sum, entry) => sum + Number(entry.weight_kg), 0) /
              bucketEntries.length,
            1
          )
        : null;

    return {
      weekStart: toDateString(bucket.weekStart),
      weekEnd: toDateString(bucket.weekEnd),
      label: formatWeekLabel(bucket.clampedStart, bucket.clampedEnd),
      averageWeight,
      theoreticalWeight: calculateTheoreticalWeight(
        Number(profile.start_weight),
        Number(profile.target_weight),
        settings.start_date,
        settings.end_date,
        bucket.clampedEnd
      )
    };
  });

  const history = weeklyChart
    .filter((point) => point.averageWeight !== null)
    .map((point) => ({
      weekLabel: point.label,
      averageWeight: point.averageWeight as number
    }))
    .reverse();

  const dailyEntriesByDate = entries
    .filter((entry) => entry.entry_date >= settings.start_date && entry.entry_date <= toDateString(currentDate))
    .reduce<Record<string, WeightEntryRecord[]>>((acc, entry) => {
      acc[entry.entry_date] ??= [];
      acc[entry.entry_date].push(entry);
      return acc;
    }, {});

  const chart: DailyPoint[] = Object.entries(dailyEntriesByDate)
    .map(([date, dayEntries]) => {
      const day = parseDateString(date);
      const weight = round(
        dayEntries.reduce((sum, entry) => sum + Number(entry.weight_kg), 0) / dayEntries.length,
        1
      );

      return {
        date,
        label: formatDayLabel(day),
        weight,
        sportDone: dayEntries.some((entry) => entry.sport_done),
        sportActivityType: dayEntries.find((entry) => entry.sport_done && entry.sport_activity_type)?.sport_activity_type ?? null,
        theoreticalWeight: calculateTheoreticalWeight(
          Number(profile.start_weight),
          Number(profile.target_weight),
          settings.start_date,
          settings.end_date,
          day
        )
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));

  const latestWeekly = history[0];
  const latestEntry = [...entries].sort((left, right) => right.entry_date.localeCompare(left.entry_date))[0];
  const currentWeeklyWeight = latestWeekly?.averageWeight ?? Number(profile.start_weight);
  const theoreticalProgressPct = clamp(
    getPeriodProgressPct(settings.start_date, settings.end_date, currentDate),
    0,
    100
  );
  const realProgressPct = round(
    calculateRealProgress(
      Number(profile.start_weight),
      Number(profile.target_weight),
      currentWeeklyWeight
    ),
    0
  );
  const todayString = toDateString(currentDate);
  const todayEntry = entries.find((entry) => entry.entry_date === todayString);
  const weekStart = toDateString(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const monthStart = toDateString(startOfMonth(currentDate));
  const sportEntries = entries.filter((entry) => entry.sport_done);
  const weekSportEntries = sportEntries.filter((entry) => entry.entry_date >= weekStart && entry.entry_date <= todayString);
  const monthSportEntries = sportEntries.filter((entry) => entry.entry_date >= monthStart && entry.entry_date <= todayString);
  const mapActivity = (entry: WeightEntryRecord) => ({
    date: entry.entry_date,
    label: formatDayLabel(parseDateString(entry.entry_date)),
    activityType: entry.sport_activity_type as SportActivityType,
    note: entry.sport_note ?? null
  });
  const sortRecent = (left: WeightEntryRecord, right: WeightEntryRecord) => right.entry_date.localeCompare(left.entry_date);
  const weekSessions = weekSportEntries.length;
  const monthSessions = monthSportEntries.length;
  const latestActivities = sportEntries
    .filter((entry) => entry.sport_activity_type)
    .sort(sortRecent)
    .slice(0, 5)
    .map(mapActivity);

  return {
    id: profile.id,
    slug: profile.slug,
    firstName: profile.first_name,
    goalType: profile.goal_type,
    startWeight: Number(profile.start_weight),
    targetWeight: Number(profile.target_weight),
    latestWeight: latestEntry ? Number(latestEntry.weight_kg) : Number(profile.start_weight),
    currentWeeklyWeight,
    latestWeeklyLabel: latestWeekly?.weekLabel ?? "Aucune semaine validée",
    realProgressPct,
    theoreticalProgressPct: round(theoreticalProgressPct, 0),
    status: determineStatus(realProgressPct, theoreticalProgressPct, settings.status_tolerance_pct),
    gaugeColor: profile.accent_color,
    messagePoolSize,
    chart,
    history,
    todaySport: {
      entryDate: todayString,
      hasWeightEntry: Boolean(todayEntry),
      sportDone: todayEntry?.sport_done ?? false,
      sportActivityType: todayEntry?.sport_activity_type ?? null,
      sportNote: todayEntry?.sport_note ?? null
    },
    sportStats: {
      weekSessions,
      monthSessions,
      frequentActivity: calculateFrequentActivity(sportEntries),
      activeStreakDays: calculateActiveStreak(entries, currentDate),
      weekActivities: weekSportEntries.filter((entry) => entry.sport_activity_type).sort(sortRecent).map(mapActivity),
      monthActivities: monthSportEntries.filter((entry) => entry.sport_activity_type).sort(sortRecent).map(mapActivity),
      latestActivities
    }
  };
}
