"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { PersonSlug } from "@/lib/types";

export function WeightEntryForm({
  profileSlug,
  firstName,
  defaultDate
}: Readonly<{
  profileSlug: PersonSlug;
  firstName: string;
  defaultDate: string;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      profileSlug,
      entryDate: String(formData.get("entryDate")),
      weightKg: Number(formData.get("weightKg"))
    };

    startTransition(async () => {
      const response = await fetch("/api/weights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Impossible d'enregistrer ce poids.");
        return;
      }

      setOpen(false);
      setMessage(result.motivationalMessage ?? null);
      router.refresh();
    });
  }

  return (
    <>
      <Button className="w-full gap-2" onClick={() => setOpen(true)}>
        <Scale className="h-4 w-4" />
        Encoder le poids
      </Button>

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

      <Modal open={Boolean(message)} onOpenChange={(next) => !next && setMessage(null)} title="Message du coach">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-5 text-slate-100">
          <p className="text-lg leading-7">{message}</p>
        </div>
      </Modal>
    </>
  );
}
