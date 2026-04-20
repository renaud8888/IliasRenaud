import Link from "next/link";
import { CalendarRange, Flame, Target, TimerReset } from "lucide-react";
import { ParticipantCard } from "@/components/dashboard/participant-card";
import { Card } from "@/components/ui/card";
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
      <Card className="overflow-hidden border-none bg-transparent p-0 shadow-none">
        <div className="glass-card rounded-[34px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="section-title">Tableau de bord</p>
              <h2 className="mt-2 max-w-3xl font-[var(--font-heading)] text-4xl font-bold md:text-6xl">
                Voir tout le duel en 3 secondes.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Une seule question compte: qui tient sa trajectoire réelle face au cap théorique d’aujourd’hui. Le reste s’efface.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white/[0.05] p-5">
                <div className="mb-2 flex items-center gap-2 text-slate-300">
                  <CalendarRange className="h-4 w-4" />
                  <span className="text-sm">Période active</span>
                </div>
                <p className="font-semibold text-white">{data.period.startDate} au {data.period.endDate}</p>
              </div>
              <div className="rounded-[28px] bg-white/[0.05] p-5">
                <div className="mb-2 flex items-center gap-2 text-slate-300">
                  <TimerReset className="h-4 w-4" />
                  <span className="text-sm">Aujourd’hui</span>
                </div>
                <p className="font-semibold text-white">{today}</p>
              </div>
              <div className="rounded-[28px] bg-white/[0.05] p-5 sm:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-slate-300">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Règle du jeu</span>
                </div>
                <p className="font-semibold text-white">
                  Le poids du jour nourrit uniquement la moyenne hebdomadaire. Le dashboard reste lisible, rapide et orienté action.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-[24px] border border-white/10 px-4 py-4 text-white transition hover:bg-white/8 sm:col-span-2"
              >
                <Flame className="h-4 w-4" />
                <span className="text-sm font-semibold">Admin: objectifs, dates, messages et corrections</span>
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
