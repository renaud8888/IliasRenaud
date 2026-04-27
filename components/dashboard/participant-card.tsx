import { Activity, Gauge, Target, TrendingDown, TrendingUp } from "lucide-react";
import { WeeklyWeightChart } from "@/components/charts/weekly-weight-chart";
import { HistoryStrip } from "@/components/dashboard/history-strip";
import { ProgressGauge } from "@/components/dashboard/progress-gauge";
import { WeightEntryForm } from "@/components/forms/weight-entry-form";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GOAL_LABELS, PERSON_THEME } from "@/lib/constants";
import { clamp, formatPercent, formatWeight, round } from "@/lib/utils";
import type { ParticipantDashboard } from "@/lib/types";

function getMomentumLabel(realProgress: number, theoreticalProgress: number) {
  const gap = realProgress - theoreticalProgress;

  if (realProgress >= 90) {
    return "Presque arrivé 🔥";
  }

  if (gap >= 12) {
    return "Belle avance";
  }

  if (gap <= -8) {
    return "À relancer";
  }

  return "Dans le tempo";
}

export function ParticipantCard({
  participant,
  today
}: Readonly<{
  participant: ParticipantDashboard;
  today: string;
}>) {
  const isLoss = participant.goalType === "loss";
  const theme = PERSON_THEME[participant.slug];
  const goalLabel =
    participant.slug === "kamran" ? "Objectif prise de masse musculaire" : GOAL_LABELS[participant.goalType];
  const totalDelta = participant.targetWeight - participant.startWeight;
  const currentDelta = participant.currentWeeklyWeight - participant.startWeight;
  const timelinePosition = totalDelta === 0 ? 100 : clamp((currentDelta / totalDelta) * 100, 0, 100);
  const movedWeight = isLoss
    ? participant.startWeight - participant.currentWeeklyWeight
    : participant.currentWeeklyWeight - participant.startWeight;
  const remainingWeight = isLoss
    ? participant.currentWeeklyWeight - participant.targetWeight
    : participant.targetWeight - participant.currentWeeklyWeight;
  const safeMovedWeight = Math.max(0, round(movedWeight, 1));
  const safeRemainingWeight = Math.max(0, round(remainingWeight, 1));
  const advancePercent = round(participant.realProgressPct - participant.theoreticalProgressPct, 0);
  const movementLabel = isLoss ? "perdus" : "pris";
  const remainingLabel = isLoss ? "restants" : "à prendre";
  const summary = getMomentumLabel(participant.realProgressPct, participant.theoreticalProgressPct);

  return (
    <Card
      id={`${participant.slug}-section`}
      className="relative overflow-hidden border-none bg-transparent p-0 shadow-none scroll-mt-24"
    >
      <div className="glass-card relative overflow-hidden rounded-[28px] p-4 sm:rounded-[34px] sm:p-5 md:p-7">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-[0.08]`}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-white/12" />
        <div className="relative flex flex-col gap-5 md:gap-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="section-title">Athlète</p>
              <h2 className="mt-1 font-[var(--font-heading)] text-4xl font-bold leading-none text-white md:text-5xl">
                {participant.firstName}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                {isLoss ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                <span>Objectif : {goalLabel.replace("Objectif ", "")}</span>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-white">
                <Activity className="h-4 w-4" style={{ color: theme.ring }} />
                {summary}
              </p>
            </div>
            <StatusBadge status={participant.status} />
          </div>

          <WeightEntryForm
            profileSlug={participant.slug}
            firstName={participant.firstName}
            defaultDate={today}
            accentColor={theme.ring}
          />

          <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-center">
              <ProgressGauge
                realProgressPercent={participant.realProgressPct}
                theoreticalProgressPercent={participant.theoreticalProgressPct}
                lostWeight={safeMovedWeight}
                remainingWeight={safeRemainingWeight}
                accentColor={theme.ring}
                movedLabel={movementLabel}
                remainingLabel={remainingLabel}
              />

              <div className="space-y-4">
                <div className="rounded-[24px] bg-white/[0.045] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="section-title">Position poids</p>
                      <p className="mt-1 text-sm text-slate-400">{participant.latestWeeklyLabel}</p>
                    </div>
                    <Gauge className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="relative px-1 pt-4">
                    <div className="absolute left-2 right-2 top-[25px] h-1 rounded-full bg-slate-700/80" />
                    <div
                      className="absolute left-2 top-[25px] h-1 rounded-full transition-all duration-700"
                      style={{
                        width: `calc((100% - 16px) * ${timelinePosition / 100})`,
                        background: `linear-gradient(90deg, ${theme.ring}55, ${theme.ring})`
                      }}
                    />
                    <span
                      className="absolute top-[17px] block h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white shadow-[0_0_18px_currentColor] transition-all duration-700"
                      style={{
                        left: `calc(8px + (100% - 16px) * ${timelinePosition / 100})`,
                        backgroundColor: theme.ring,
                        color: theme.ring
                      }}
                    />
                    <div className="relative grid grid-cols-3 items-start text-center">
                      <div className="space-y-2 text-left">
                        <span className="block h-4 w-4 rounded-full border border-slate-400 bg-slate-900" />
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Départ</p>
                        <p className="text-sm font-bold text-slate-100">{formatWeight(participant.startWeight)}</p>
                      </div>
                      <div className="relative min-h-16">
                        <div className="pt-8">
                          <p className="text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: theme.ring }}>
                            Actuel
                          </p>
                          <p className="text-base font-extrabold text-white">{formatWeight(participant.currentWeeklyWeight)}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <span className="ml-auto block h-4 w-4 rounded-full border border-slate-400 bg-slate-900" />
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Objectif</p>
                        <p className="text-sm font-bold text-slate-100">{formatWeight(participant.targetWeight)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] bg-white/[0.055] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {isLoss ? "Perdu" : "Pris"}
                    </p>
                    <p className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-white">
                      {formatWeight(safeMovedWeight)}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white/[0.055] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Restant</p>
                    <p className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-white">
                      {formatWeight(safeRemainingWeight)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-[20px] bg-white/[0.055] p-4 sm:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {advancePercent >= 0 ? "Avance" : "Retard"}
                    </p>
                    <p className="mt-2 font-[var(--font-heading)] text-3xl font-bold" style={{ color: theme.ring }}>
                      {advancePercent > 0 ? "+" : ""}{formatPercent(advancePercent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[30px] bg-slate-950/45 p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-400" />
              <div>
                <p className="section-title">Courbe quotidienne</p>
                <p className="mt-1 text-sm text-slate-300">
                  Pesées jour par jour contre trajectoire idéale, avec la différence visible d’un coup d’œil.
                </p>
              </div>
            </div>
            <WeeklyWeightChart data={participant.chart} accentColor={theme.ring} slug={participant.slug} />
          </div>

          <HistoryStrip participant={participant} />

        </div>
      </div>
    </Card>
  );
}
