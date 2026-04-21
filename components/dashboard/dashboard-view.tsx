import Link from "next/link";
import { ArrowDownRight, CalendarRange, TimerReset } from "lucide-react";
import { ParticipantCard } from "@/components/dashboard/participant-card";
import { Card } from "@/components/ui/card";
import { SimulationBadge } from "@/components/ui/simulation-badge";
import { PERSON_THEME } from "@/lib/constants";
import type { DashboardPayload } from "@/lib/types";

export function DashboardView({
  data,
  today
}: Readonly<{
  data: DashboardPayload;
  today: string;
}>) {
  const participants = data.participants;

  return (
    <div className="space-y-8">
      <SimulationBadge dateContext={data.dateContext} />
      <Card className="overflow-hidden border-none bg-transparent p-0 shadow-none">
        <div className="glass-card rounded-[34px] p-5 md:p-7">
          <div className="max-w-4xl space-y-5">
            <div>
              <p className="section-title">Tableau de bord</p>
              <h2 className="mt-2 font-[var(--font-heading)] text-4xl font-bold md:text-6xl">
                Voir où tu en es.
                <br />
                Agir tout de suite.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Le duel se lit en un instant: progression réelle, objectif du jour, puis action immédiate.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm md:text-base">
              <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-white/[0.05] px-4 py-3 text-slate-300">
                <CalendarRange className="h-4 w-4" />
                <span className="font-medium text-white">Période active</span>
                <span>{data.period.startDate} au {data.period.endDate}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-white/[0.05] px-4 py-3 text-slate-300">
                <TimerReset className="h-4 w-4" />
                <span className="font-medium text-white">Aujourd’hui</span>
                <span>{today}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {participants.map((participant) => {
                const theme = PERSON_THEME[participant.slug];

                return (
                  <Link
                    key={participant.id}
                    href={`#${participant.slug}-section`}
                    className="inline-flex items-center justify-between rounded-[24px] px-5 py-4 text-white transition hover:brightness-110"
                    style={{ backgroundColor: `${theme.ring}24` }}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">Aller à</p>
                      <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold">{participant.firstName}</p>
                    </div>
                    <ArrowDownRight className="h-5 w-5 text-white/80" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-2">
        {participants.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} today={today} />
        ))}
      </div>
    </div>
  );
}
