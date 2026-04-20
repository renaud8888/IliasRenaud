import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { formatWeight, round } from "@/lib/utils";
import type { GoalType, ParticipantDashboard } from "@/lib/types";

function getTrend(delta: number, goalType: GoalType) {
  const adjusted = goalType === "loss" ? -delta : delta;

  if (adjusted > 0.15) {
    return {
      label: `${adjusted > 0 ? "+" : ""}${round(adjusted, 1).toFixed(1)} kg`,
      icon: ArrowUp,
      mood: "🔥",
      className: "text-emerald-300 bg-emerald-500/10"
    };
  }

  if (adjusted < -0.15) {
    return {
      label: `${round(adjusted, 1).toFixed(1)} kg`,
      icon: ArrowDown,
      mood: "⚠️",
      className: "text-red-300 bg-red-500/10"
    };
  }

  return {
    label: "0.0 kg",
    icon: ArrowRight,
    mood: "•",
    className: "text-slate-300 bg-white/8"
  };
}

export function HistoryStrip({
  participant
}: Readonly<{
  participant: ParticipantDashboard;
}>) {
  const items = participant.history.slice(0, 6).map((item, index, list) => {
    const previous = list[index + 1];
    const delta = previous ? item.averageWeight - previous.averageWeight : 0;
    return {
      ...item,
      delta,
      trend: getTrend(delta, participant.goalType)
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Rythme hebdo</p>
          <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Historique</h3>
        </div>
        <p className="text-sm text-slate-400">Variation vs semaine précédente</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => {
            const TrendIcon = item.trend.icon;
            return (
              <div key={item.weekLabel} className="rounded-[24px] bg-white/[0.05] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-300">{item.weekLabel}</p>
                    <p className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-white">
                      {formatWeight(item.averageWeight)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.trend.className}`}>
                    {item.trend.mood}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                  <TrendIcon className="h-4 w-4" />
                  <span>{item.trend.label}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            Pas encore de moyenne hebdomadaire calculable.
          </div>
        )}
      </div>
    </div>
  );
}
