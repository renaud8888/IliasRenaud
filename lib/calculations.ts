import { differenceInCalendarDays, isAfter, isBefore } from "date-fns";
import { getPeriodProgressPct, getWeeklyBuckets, toDateString, formatWeekLabel } from "@/lib/date";
import type {
  GlobalSettingsRecord,
  ParticipantDashboard,
  ProfileRecord,
  ProgressStatus,
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
  const start = new Date(startDate);
  const end = new Date(endDate);

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
}): ParticipantDashboard {
  const { profile, settings, entries, messagePoolSize } = params;
  const weeklyBuckets = getWeeklyBuckets(settings.start_date, settings.end_date);

  const chart: WeeklyPoint[] = weeklyBuckets.map((bucket) => {
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

  const history = chart
    .filter((point) => point.averageWeight !== null)
    .map((point) => ({
      weekLabel: point.label,
      averageWeight: point.averageWeight as number
    }))
    .reverse();

  const latestWeekly = history[0];
  const currentWeeklyWeight = latestWeekly?.averageWeight ?? Number(profile.start_weight);
  const theoreticalProgressPct = clamp(
    getPeriodProgressPct(settings.start_date, settings.end_date),
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

  return {
    id: profile.id,
    slug: profile.slug,
    firstName: profile.first_name,
    goalType: profile.goal_type,
    startWeight: Number(profile.start_weight),
    targetWeight: Number(profile.target_weight),
    currentWeeklyWeight,
    latestWeeklyLabel: latestWeekly?.weekLabel ?? "Aucune semaine validée",
    realProgressPct,
    theoreticalProgressPct: round(theoreticalProgressPct, 0),
    status: determineStatus(realProgressPct, theoreticalProgressPct, settings.status_tolerance_pct),
    gaugeColor: profile.accent_color,
    messagePoolSize,
    chart,
    history
  };
}
