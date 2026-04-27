"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SPORT_ACTIVITY_TYPES } from "@/lib/constants";
import type { ParticipantTodaySport, PersonSlug, SportActivityType } from "@/lib/types";

export function SportEntryForm({
  profileSlug,
  todaySport,
  accentColor
}: Readonly<{
  profileSlug: PersonSlug;
  todaySport: ParticipantTodaySport;
  accentColor: string;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sportDone, setSportDone] = useState(true);
  const [activityType, setActivityType] = useState<SportActivityType>(todaySport.sportActivityType ?? "Futsal");
  const [note, setNote] = useState(todaySport.sportNote ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSportDone(todaySport.sportDone || true);
    setActivityType(todaySport.sportActivityType ?? "Futsal");
    setNote(todaySport.sportNote ?? "");
  }, [open, todaySport]);

  async function saveSport() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/weights/sport", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            profileSlug,
            entryDate: todaySport.entryDate,
            sportDone,
            sportActivityType: sportDone ? activityType : null,
            sportNote: sportDone ? note : null
          })
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Impossible d’enregistrer le sport.");
          return;
        }

        setOpen(false);
        setSuccess("Sport du jour enregistré.");
        router.refresh();
      } catch {
        setError("Une erreur réseau empêche l’enregistrement.");
      }
    });
  }

  if (!todaySport.hasWeightEntry) {
    return null;
  }

  return (
    <>
      <div className="inline-flex">
        {todaySport.sportDone && todaySport.sportActivityType ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-500/12 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/18"
          >
            <CheckCircle2 className="h-4 w-4" />
            Sport fait : {todaySport.sportActivityType}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold text-white shadow-[0_0_18px_rgba(255,255,255,0.08)] transition"
            style={{ background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})` }}
          >
            <Plus className="h-4 w-4" />
            J’ai fait du sport
          </button>
        )}
      </div>

      {success ? <p className="text-sm font-semibold text-emerald-300">{success}</p> : null}

      <Modal open={open} onOpenChange={setOpen} title="Ajouter le sport du jour">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-bold text-white">Sport effectué ?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSportDone(true)}
                className="rounded-2xl px-4 py-3 text-sm font-extrabold text-white"
                style={{ background: sportDone ? `linear-gradient(135deg, ${accentColor}CC, ${accentColor})` : "rgba(15,23,42,0.9)" }}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setSportDone(false)}
                className="rounded-2xl px-4 py-3 text-sm font-extrabold text-white"
                style={{ background: sportDone ? "rgba(15,23,42,0.9)" : "rgba(51,65,85,0.9)" }}
              >
                Non
              </button>
            </div>
          </div>

          {sportDone ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Type d’activité</span>
                <select
                  value={activityType}
                  onChange={(event) => setActivityType(event.target.value as SportActivityType)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                >
                  {SPORT_ACTIVITY_TYPES.map((activity) => (
                    <option key={activity} value={activity}>{activity}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Note courte</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  type="text"
                  maxLength={120}
                  placeholder="Ex. sortie tranquille"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                />
              </label>
            </>
          ) : null}

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="button" className="w-full" disabled={pending} onClick={saveSport}>
            {pending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
