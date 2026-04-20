import { ArrowRight, Target, TrendingDown, TrendingUp } from "lucide-react";
import { WeeklyWeightChart } from "@/components/charts/weekly-weight-chart";
import { HistoryStrip } from "@/components/dashboard/history-strip";
import { ProgressGauge } from "@/components/dashboard/progress-gauge";
import { ProgressRail } from "@/components/dashboard/progress-rail";
import { ProgressSummary } from "@/components/dashboard/progress-summary";
import { WeightEntryForm } from "@/components/forms/weight-entry-form";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PERSON_THEME } from "@/lib/constants";
import { formatPercent, formatWeight } from "@/lib/utils";
import type { ParticipantDashboard } from "@/lib/types";

export function ParticipantCard({
  participant,
  today
}: Readonly<{
  participant: ParticipantDashboard;
  today: string;
}>) {
  const isLoss = participant.goalType === "loss";
  const theme = PERSON_THEME[participant.slug];
  const difference = participant.realProgressPct - participant.theoreticalProgressPct;
  const differenceText =
    difference > 2
      ? `Tu es en avance de ${Math.abs(Math.round(difference))}%`
      : difference < -2
        ? `Tu es en retard de ${Math.abs(Math.round(difference))}%`
        : "Tu es dans le bon tempo";

  return (
    <Card className="relative overflow-hidden border-none bg-transparent p-0 shadow-none">
      <div className="glass-card relative overflow-hidden rounded-[34px] p-5 md:p-7">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-[0.08]`}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-white/12" />
        <div className="relative flex flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">Athlète</p>
            <h2 className="font-[var(--font-heading)] text-4xl font-bold md:text-5xl">{participant.firstName}</h2>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
              {isLoss ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              <span>{isLoss ? "Objectif perte de poids" : "Objectif prise de poids"}</span>
            </div>
          </div>
          <StatusBadge status={participant.status} />
        </div>

          <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
            <ProgressGauge
              value={participant.realProgressPct}
              theoretical={participant.theoreticalProgressPct}
              accentColor={theme.ring}
              title="Progression réelle"
              subtitle={participant.latestWeeklyLabel}
            />

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] bg-white/[0.05] p-5 md:p-6">
                  <p className="section-title">Poids de référence</p>
                  <p className="mt-3 font-[var(--font-heading)] text-5xl font-bold text-white">
                    {formatWeight(participant.currentWeeklyWeight)}
                  </p>
                  <p className="mt-3 text-sm text-slate-400">{participant.latestWeeklyLabel}</p>
                </div>
                <div className="rounded-[28px] bg-white/[0.05] p-5 md:p-6">
                  <p className="section-title">Cap final</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="font-[var(--font-heading)] text-5xl font-bold text-white">
                      {formatWeight(participant.targetWeight)}
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Départ à {formatWeight(participant.startWeight)}</p>
                </div>
              </div>

              <ProgressSummary
                theoretical={formatPercent(participant.theoreticalProgressPct)}
                actual={formatPercent(participant.realProgressPct)}
                difference={difference}
                statusText={differenceText}
              />

              <ProgressRail
                actual={participant.realProgressPct}
                theoretical={participant.theoreticalProgressPct}
                accentColor={theme.ring}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-[30px] bg-slate-950/45 p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-400" />
              <div>
                <p className="section-title">Courbe hebdomadaire</p>
                <p className="mt-1 text-sm text-slate-300">
                  Réel contre trajectoire idéale, avec la différence visible d’un coup d’œil.
                </p>
              </div>
            </div>
            <WeeklyWeightChart data={participant.chart} accentColor={theme.ring} slug={participant.slug} />
          </div>

          <HistoryStrip participant={participant} />

          <WeightEntryForm
            profileSlug={participant.slug}
            firstName={participant.firstName}
            defaultDate={today}
            accentColor={theme.ring}
          />
        </div>
      </div>
    </Card>
  );
}
