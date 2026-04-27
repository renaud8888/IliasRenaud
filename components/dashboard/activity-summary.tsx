import { Dumbbell, Flame, Footprints, Trophy } from "lucide-react";
import type { ParticipantSportStats } from "@/lib/types";

export function ActivitySummary({
  stats,
  accentColor
}: Readonly<{
  stats: ParticipantSportStats;
  accentColor: string;
}>) {
  const cards = [
    {
      title: "Cette semaine",
      value: `${stats.weekSessions} séance${stats.weekSessions > 1 ? "s" : ""}`,
      subtitle: "sur 7 jours",
      Icon: Dumbbell
    },
    {
      title: "Ce mois-ci",
      value: `${stats.monthSessions} séance${stats.monthSessions > 1 ? "s" : ""}`,
      subtitle: "activité totale",
      Icon: Trophy
    },
    {
      title: "Activité fréquente",
      value: stats.frequentActivity ?? "Aucune",
      subtitle: stats.frequentActivity ? "la plus pratiquée" : "à construire",
      Icon: Footprints
    },
    {
      title: "Série active",
      value: `${stats.activeStreakDays} jour${stats.activeStreakDays > 1 ? "s" : ""}`,
      subtitle: "avec sport",
      Icon: Flame
    }
  ];

  return (
    <section className="space-y-4 rounded-[30px] bg-slate-950/45 p-4 md:p-5">
      <div>
        <p className="section-title">Activité physique</p>
        <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-white">Régularité sportive</h3>
        <p className="mt-1 text-sm text-slate-300">
          Suit la régularité sportive en parallèle de la perte de poids.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ title, value, subtitle, Icon }) => (
          <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
              <Icon className="h-4 w-4" style={{ color: accentColor }} />
            </div>
            <p className="font-[var(--font-heading)] text-2xl font-bold leading-none text-white">{value}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">{subtitle}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Dernières activités</p>
        <div className="mt-3 space-y-2">
          {stats.latestActivities.length > 0 ? (
            stats.latestActivities.slice(0, 5).map((activity) => (
              <div key={`${activity.date}-${activity.activityType}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">{activity.label}</span>
                <span className="truncate font-bold text-white">{activity.activityType}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Aucune activité enregistrée pour le moment.</p>
          )}
        </div>
      </div>
    </section>
  );
}
