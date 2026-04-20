"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminPayload } from "@/lib/types";

export function AdminPanel({ initialData }: Readonly<{ initialData: AdminPayload }>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    settings: initialData.settings,
    profiles: initialData.profiles.map((profile) => ({
      id: profile.id,
      slug: profile.slug,
      first_name: profile.first_name,
      start_weight: String(profile.start_weight),
      target_weight: String(profile.target_weight)
    })),
    messagesByProfile: Object.fromEntries(
      initialData.profiles.map((profile) => [
        profile.id,
        profile.messages.map((message) => message.content).join("\n")
      ])
    )
  }));

  const groupedEntries = useMemo(
    () =>
      initialData.weightEntries.reduce<Record<string, typeof initialData.weightEntries>>((acc, entry) => {
        acc[entry.slug] ??= [];
        acc[entry.slug].push(entry);
        return acc;
      }, {}),
    [initialData]
  );

  function updateProfileField(id: string, field: "start_weight" | "target_weight", value: string) {
    setForm((current) => ({
      ...current,
      profiles: current.profiles.map((profile) =>
        profile.id === id ? { ...profile, [field]: value } : profile
      )
    }));
  }

  async function saveAll() {
    setError(null);
    setSuccess(null);

    const payload = {
      settings: form.settings,
      profiles: form.profiles.map((profile) => ({
        id: profile.id,
        start_weight: Number(profile.start_weight),
        target_weight: Number(profile.target_weight)
      })),
      messagesByProfile: Object.fromEntries(
        Object.entries(form.messagesByProfile).map(([profileId, text]) => [
          profileId,
          String(text)
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((content) => ({
              content,
              tone: "motivation",
              is_active: true
            }))
        ])
      )
    };

    startTransition(async () => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Impossible d'enregistrer les réglages.");
        return;
      }

      setSuccess("Réglages enregistrés.");
      router.refresh();
    });
  }

  async function updateEntry(entryId: string, formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/weights/${entryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entryDate: String(formData.get("entryDate")),
          weightKg: Number(formData.get("weightKg"))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Modification impossible.");
        return;
      }

      setSuccess("Entrée corrigée.");
      router.refresh();
    });
  }

  async function deleteEntry(entryId: string) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/weights/${entryId}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Suppression impossible.");
        return;
      }

      setSuccess("Entrée supprimée.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-title">Paramètres globaux</p>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">Zone admin</h2>
            </div>
            <Button className="gap-2" onClick={saveAll} disabled={pending}>
              <Save className="h-4 w-4" />
              {pending ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Date de début</span>
              <input
                type="date"
                value={form.settings.start_date}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  settings: { ...current.settings, start_date: event.target.value }
                }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Date de fin</span>
              <input
                type="date"
                value={form.settings.end_date}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  settings: { ...current.settings, end_date: event.target.value }
                }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Tolérance statut (%)</span>
              <input
                type="number"
                step="0.5"
                value={form.settings.status_tolerance_pct}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  settings: { ...current.settings, status_tolerance_pct: Number(event.target.value) }
                }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Cooldown rappel (jours)</span>
              <input
                type="number"
                value={form.settings.reminder_cooldown_days}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  settings: { ...current.settings, reminder_cooldown_days: Number(event.target.value) }
                }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Heure email hebdo (locale, pile)</span>
              <input
                type="time"
                value={form.settings.weekly_email_hour_local}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  settings: { ...current.settings, weekly_email_hour_local: event.target.value }
                }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
              />
            </label>
            <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <label className="flex items-center gap-3 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={form.settings.weekly_email_enabled}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    settings: { ...current.settings, weekly_email_enabled: event.target.checked }
                  }))}
                />
                Emails hebdomadaires actifs
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-100">
                <input
                  type="checkbox"
                  checked={form.settings.missed_entry_email_enabled}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    settings: { ...current.settings, missed_entry_email_enabled: event.target.checked }
                  }))}
                />
                Rappels d’oubli actifs
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <p className="section-title">Objectifs</p>
          <div className="mt-4 space-y-4">
            {form.profiles.map((profile) => (
              <div key={profile.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <h3 className="font-[var(--font-heading)] text-2xl font-bold">{profile.first_name}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-200">Poids de départ</span>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.start_weight}
                      onChange={(event) => updateProfileField(profile.id, "start_weight", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-200">Objectif final</span>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.target_weight}
                      onChange={(event) => updateProfileField(profile.id, "target_weight", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    />
                  </label>
                </div>
                <p className="mt-3 text-sm text-slate-400">Email actuel: {initialData.profiles.find((item) => item.id === profile.id)?.email}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {initialData.profiles.map((profile) => (
          <Card key={profile.id}>
            <p className="section-title">Messages motivants</p>
            <h3 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">{profile.first_name}</h3>
            <p className="mt-2 text-sm text-slate-400">Un message par ligne. Ils seront tous réécrits proprement en base lors de la sauvegarde.</p>
            <textarea
              value={form.messagesByProfile[profile.id] ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  messagesByProfile: {
                    ...current.messagesByProfile,
                    [profile.id]: event.target.value
                  }
                }))
              }
              className="mt-4 min-h-80 w-full rounded-[24px] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-white"
            />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Object.entries(groupedEntries).map(([slug, entries]) => (
          <Card key={slug}>
            <p className="section-title">Corrections quotidiennes</p>
            <h3 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">
              {entries[0]?.first_name ?? slug}
            </h3>
            <div className="mt-4 space-y-4">
              {entries.map((entry) => (
                <form
                  key={entry.id}
                  action={(formData) => updateEntry(entry.id, formData)}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      name="entryDate"
                      type="date"
                      defaultValue={entry.entry_date}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    />
                    <input
                      name="weightKg"
                      type="number"
                      step="0.1"
                      defaultValue={entry.weight_kg}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary" className="gap-2">
                        <PencilLine className="h-4 w-4" />
                        Corriger
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="gap-2"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
    </div>
  );
}
