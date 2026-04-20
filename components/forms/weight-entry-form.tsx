"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { PersonSlug } from "@/lib/types";

export function WeightEntryForm({
  profileSlug,
  firstName,
  defaultDate,
  accentColor
}: Readonly<{
  profileSlug: PersonSlug;
  firstName: string;
  defaultDate: string;
  accentColor: string;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = window.setTimeout(() => setSuccess(null), 2200);
    return () => window.clearTimeout(timer);
  }, [success]);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      profileSlug,
      entryDate: String(formData.get("entryDate")),
      weightKg: Number(formData.get("weightKg"))
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/weights", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};

        if (!response.ok) {
          setError(result.error ?? "Impossible d'enregistrer ce poids.");
          return;
        }

        setOpen(false);
        setSuccess(`Pesée enregistrée pour ${firstName}.`);
        setMessage(result.motivationalMessage ?? null);
        router.refresh();
      } catch {
        setError("Une erreur réseau empêche l’enregistrement pour le moment.");
      }
    });
  }

  return (
    <>
      <div className="sticky bottom-3 z-20 mt-2 md:static">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/75 p-2 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <Button
            className="w-full gap-2 rounded-[22px] py-4 text-base text-white"
            onClick={() => setOpen(true)}
            style={{
              background: `linear-gradient(135deg, ${accentColor}CC 0%, ${accentColor} 100%)`
            }}
          >
            <Scale className="h-5 w-5" />
            Ajouter la pesée du jour
          </Button>
        </div>
      </div>

      <Modal open={open} onOpenChange={setOpen} title={`Pesée de ${firstName}`}>
        <form
          action={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor={`${profileSlug}-date`}>
              Date
            </label>
            <input
              id={`${profileSlug}-date`}
              name="entryDate"
              type="date"
              defaultValue={defaultDate}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor={`${profileSlug}-weight`}>
              Poids du jour
            </label>
            <input
              id={`${profileSlug}-weight`}
              name="weightKg"
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder="Ex. 114.8"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enregistrement..." : "Valider la pesée"}
          </Button>
        </form>
      </Modal>

      {success ? (
        <div className="float-in fixed left-1/2 top-20 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-[22px] border border-emerald-300/20 bg-emerald-500/15 px-4 py-3 text-white shadow-[0_14px_40px_rgba(16,185,129,0.18)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        </div>
      ) : null}

      <Modal open={Boolean(message)} onOpenChange={(next) => !next && setMessage(null)} title="Message du coach">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-5 text-slate-100">
          <p className="text-lg leading-7">{message}</p>
        </div>
      </Modal>
    </>
  );
}
