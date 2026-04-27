"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Dumbbell, Trophy } from "lucide-react";
import type { ParticipantSportStats } from "@/lib/types";

type Period = "week" | "month";

export function ActivitySummary({
  stats,
  accentColor
}: Readonly<{
  stats: ParticipantSportStats;
  accentColor: string;
}>) {
  const [period, setPeriod] = useState<Period>("week");
  const activities = period === "week" ? stats.weekActivities : stats.monthActivities;
  const cards = useMemo(
    () => [
      {
        key: "week" as const,
        title: "Cette semaine",
        value: `${stats.weekSessions} séance${stats.weekSessions > 1 ? "s" : ""}`,
        Icon: Dumbbell
      },
      {
        key: "month" as const,
        title: "Ce mois-ci",
        value: `${stats.monthSessions} séance${stats.monthSessions > 1 ? "s" : ""}`,
        Icon: Trophy
      }
    ],
    [stats.monthSessions, stats.weekSessions]
  );

  return (
    <section className="space-y-4 rounded-[30px] bg-slate-950/45 p-4 md:p-5">
      <div>
        <p className="section-title">Activité physique</p>
        <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-white">Régularité sportive</h3>
        <p className="mt-1 text-sm text-slate-300">
          Appuie sur une période pour voir les séances enregistrées.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ key, title, value, Icon }) => {
          const selected = period === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className="rounded-[22px] border p-4 text-left transition"
              style={{
                borderColor: selected ? `${accentColor}66` : "rgba(255,255,255,0.1)",
                background: selected ? `${accentColor}1A` : "rgba(255,255,255,0.045)"
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
                <Icon className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <p className="font-[var(--font-heading)] text-2xl font-bold leading-none text-white">{value}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" style={{ color: accentColor }} />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {period === "week" ? "Séances de la semaine" : "Séances du mois"}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={`${activity.date}-${activity.activityType}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">{activity.label}</span>
                <span className="truncate font-bold text-white">
                  {activity.activityType}
                  {activity.note ? <span className="font-medium text-slate-400"> · {activity.note}</span> : null}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              Aucune activité enregistrée sur cette période.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
