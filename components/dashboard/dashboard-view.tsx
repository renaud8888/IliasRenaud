import Link from "next/link";
import { CalendarRange, Flame, Gauge, TimerReset } from "lucide-react";
import { ParticipantCard } from "@/components/dashboard/participant-card";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
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
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="section-title">Tableau de bord</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-4xl font-bold md:text-5xl">
              Transformer 4 mois en routine visible.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Chaque poids du jour nourrit une seule vérité utile: la moyenne hebdomadaire. Le duel reste lisible, motivant et simple à tenir sur téléphone.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-300">
                <CalendarRange className="h-4 w-4" />
                <span className="text-sm">Période active</span>
              </div>
              <p className="font-semibold text-white">{data.period.startDate} au {data.period.endDate}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-300">
                <Gauge className="h-4 w-4" />
                <span className="text-sm">Tolérance statut</span>
              </div>
              <p className="font-semibold text-white">{formatPercent(data.period.tolerancePct)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-300">
                <TimerReset className="h-4 w-4" />
                <span className="text-sm">Référence du jour</span>
              </div>
              <p className="font-semibold text-white">{today}</p>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 to-white/4 p-4 text-white transition hover:bg-white/10"
            >
              <Flame className="h-4 w-4" />
              <span className="text-sm font-semibold">Ajuster objectifs et messages</span>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {ilias ? <ParticipantCard participant={ilias} today={today} /> : null}
        {renaud ? <ParticipantCard participant={renaud} today={today} /> : null}
      </div>
    </div>
  );
}
