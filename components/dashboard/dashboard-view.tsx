import Link from "next/link";
import { ArrowDownRight, CalendarRange, TimerReset } from "lucide-react";
import { ParticipantCard } from "@/components/dashboard/participant-card";
import { Card } from "@/components/ui/card";
import { SimulationBadge } from "@/components/ui/simulation-badge";
import type { DashboardPayload } from "@/lib/types";

export function DashboardView({
  data,
  today
}: Readonly<{
  data: DashboardPayload;
  today: string;
}>) {
  const ilias = data.participants.find((participant) => participant.slug === "ilias");
  const renaud = data.participants.find((participant) => participant.slug === "renaud");

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

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="#ilias-section"
                className="inline-flex items-center justify-between rounded-[24px] bg-cyan-500/14 px-5 py-4 text-white transition hover:bg-cyan-500/20"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Aller à</p>
                  <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold">Ilias</p>
                </div>
                <ArrowDownRight className="h-5 w-5 text-cyan-200" />
              </Link>
              <Link
                href="#renaud-section"
                className="inline-flex items-center justify-between rounded-[24px] bg-orange-500/14 px-5 py-4 text-white transition hover:bg-orange-500/20"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-100/70">Aller à</p>
                  <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold">Renaud</p>
                </div>
                <ArrowDownRight className="h-5 w-5 text-orange-200" />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-2">
        {ilias ? <ParticipantCard participant={ilias} today={today} /> : null}
        {renaud ? <ParticipantCard participant={renaud} today={today} /> : null}
      </div>
    </div>
  );
}
