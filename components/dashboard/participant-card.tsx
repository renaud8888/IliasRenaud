import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { WeeklyWeightChart } from "@/components/charts/weekly-weight-chart";
import { ProgressGauge } from "@/components/dashboard/progress-gauge";
import { WeightEntryForm } from "@/components/forms/weight-entry-form";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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

  return (
    <Card className="soft-grid relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: `linear-gradient(90deg, ${participant.gaugeColor}33 0%, ${participant.gaugeColor} 50%, ${participant.gaugeColor}11 100%)`
        }}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">Athlète</p>
            <h2 className="font-[var(--font-heading)] text-4xl font-bold">{participant.firstName}</h2>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
              {isLoss ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              <span>{isLoss ? "Objectif perte de poids" : "Objectif prise de poids"}</span>
            </div>
          </div>
          <StatusBadge status={participant.status} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <ProgressGauge
            label="Progression réelle"
            value={participant.realProgressPct}
            theoretical={participant.theoreticalProgressPct}
            accentColor={participant.gaugeColor}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
              <p className="section-title">Poids hebdo actuel</p>
              <p className="mt-2 font-[var(--font-heading)] text-4xl font-bold">{formatWeight(participant.currentWeeklyWeight)}</p>
              <p className="mt-2 text-sm text-slate-400">{participant.latestWeeklyLabel}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
              <p className="section-title">Cap final</p>
              <p className="mt-2 font-[var(--font-heading)] text-4xl font-bold">{formatWeight(participant.targetWeight)}</p>
              <p className="mt-2 text-sm text-slate-400">Départ à {formatWeight(participant.startWeight)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
              <p className="section-title">Réel vs théorique</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatPercent(participant.realProgressPct)} / {formatPercent(participant.theoreticalProgressPct)}
              </p>
              <p className="mt-2 text-sm text-slate-400">Tolérance appliquée automatiquement via l’admin.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
              <p className="section-title">Messages coach</p>
              <p className="mt-2 text-lg font-semibold text-white">{participant.messagePoolSize} disponibles</p>
              <p className="mt-2 text-sm text-slate-400">Un message aléatoire s’affiche après chaque encodage.</p>
            </div>
          </div>
        </div>

        <WeightEntryForm
          profileSlug={participant.slug}
          firstName={participant.firstName}
          defaultDate={today}
        />

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-100">Courbe hebdomadaire</p>
          </div>
          <WeeklyWeightChart data={participant.chart} accentColor={participant.gaugeColor} />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="mb-4 text-sm font-semibold text-slate-100">Historique hebdomadaire</p>
          <div className="space-y-3">
            {participant.history.length > 0 ? (
              participant.history.map((item) => (
                <div key={item.weekLabel} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <span className="text-sm text-slate-300">{item.weekLabel}</span>
                  <span className="font-semibold text-white">{formatWeight(item.averageWeight)}</span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                Pas encore de moyenne hebdomadaire calculable.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
