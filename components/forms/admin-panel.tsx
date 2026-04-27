"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import { DevToolsPanel } from "@/components/forms/dev-tools-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SimulationBadge } from "@/components/ui/simulation-badge";
import { SPORT_ACTIVITY_TYPES } from "@/lib/constants";
import type { AdminPayload, SportActivityType } from "@/lib/types";

type EntryFeedback = {
  type: "pending" | "success" | "error";
  message: string;
};

export function AdminPanel({ initialData }: Readonly<{ initialData: AdminPayload }>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [weightEntries, setWeightEntries] = useState(initialData.weightEntries);
  const [entryFeedback, setEntryFeedback] = useState<Record<string, EntryFeedback>>({});
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
      weightEntries.reduce<Record<string, typeof weightEntries>>((acc, entry) => {
        acc[entry.slug] ??= [];
        acc[entry.slug].push(entry);
        return acc;
      }, {}),
    [weightEntries]
  );
  const defaultEntryDate = initialData.runtime.dateContext.currentDate.slice(0, 10);

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
    const nextEntry = {
      entry_date: String(formData.get("entryDate")),
      weight_kg: Number(formData.get("weightKg")),
      sport_done: String(formData.get("sportDone")) === "true",
      sport_activity_type: formData.get("sportActivityType") ? String(formData.get("sportActivityType")) as SportActivityType : null,
      sport_note: formData.get("sportNote") ? String(formData.get("sportNote")) : null
    };
    setEntryFeedback((current) => ({
      ...current,
      [entryId]: { type: "pending", message: "Correction en cours..." }
    }));

    startTransition(async () => {
      const response = await fetch(`/api/admin/weights/${entryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entryDate: nextEntry.entry_date,
          weightKg: nextEntry.weight_kg,
          sportDone: nextEntry.sport_done,
          sportActivityType: nextEntry.sport_activity_type,
          sportNote: nextEntry.sport_note
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setEntryFeedback((current) => ({
          ...current,
          [entryId]: { type: "error", message: result.error ?? "Modification impossible." }
        }));
        return;
      }

      setWeightEntries((current) =>
        current
          .map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  entry_date: nextEntry.entry_date,
                  weight_kg: nextEntry.weight_kg,
                  sport_done: nextEntry.sport_done,
                  sport_activity_type: nextEntry.sport_done ? nextEntry.sport_activity_type : null,
                  sport_note: nextEntry.sport_done ? nextEntry.sport_note : null,
                  sport_updated_at: nextEntry.sport_done ? new Date().toISOString() : null
                }
              : entry
          )
          .sort((left, right) => right.entry_date.localeCompare(left.entry_date))
      );
      setEntryFeedback((current) => ({
        ...current,
        [entryId]: { type: "success", message: "Pesée corrigée et enregistrée." }
      }));
    });
  }

  async function createEntry(profileSlug: string, formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/weights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileSlug,
          entryDate: String(formData.get("entryDate")),
          weightKg: Number(formData.get("weightKg")),
          sportDone: String(formData.get("sportDone")) === "true",
          sportActivityType: formData.get("sportActivityType") ? String(formData.get("sportActivityType")) : null,
          sportNote: formData.get("sportNote") ? String(formData.get("sportNote")) : null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Ajout impossible.");
        return;
      }

      setSuccess("Pesée ajoutée.");
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
        setEntryFeedback((current) => ({
          ...current,
          [entryId]: { type: "error", message: result.error ?? "Suppression impossible." }
        }));
        return;
      }

      setWeightEntries((current) => current.filter((entry) => entry.id !== entryId));
      setSuccess("Entrée supprimée.");
    });
  }

  return (
    <div className="space-y-6">
      <SimulationBadge dateContext={initialData.runtime.dateContext} />

      {(pending || error || success) ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3">
          {pending ? (
            <div className="flex items-center gap-3 text-slate-200">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <p className="text-sm font-medium">Mise à jour admin en cours...</p>
            </div>
          ) : null}
          {!pending && success ? (
            <div className="flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          ) : null}
          {!pending && error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
        </div>
      ) : null}

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
                <p className="mt-3 text-sm text-slate-400">
                  Email actuel: {initialData.profiles.find((item) => item.id === profile.id)?.email || "non défini"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ces valeurs pilotent directement le cap affiché sur la page principale après sauvegarde.
                </p>
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
        {initialData.profiles.map((profile) => {
          const entries = groupedEntries[profile.slug] ?? [];

          return (
            <Card key={profile.slug}>
              <p className="section-title">Corrections quotidiennes</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">
                {profile.first_name}
              </h3>
              <form
                action={(formData) => createEntry(profile.slug, formData)}
                className="mt-4 rounded-[24px] border border-emerald-300/15 bg-emerald-500/10 p-4"
              >
                <p className="mb-3 text-sm font-semibold text-emerald-100">Ajouter ou remplacer une pesée</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    name="entryDate"
                    type="date"
                    defaultValue={defaultEntryDate}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    required
                  />
                  <input
                    name="weightKg"
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    placeholder="Poids"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                    required
                  />
                  <select
                    name="sportDone"
                    defaultValue="false"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white sm:col-span-1"
                  >
                    <option value="false">Sport : non</option>
                    <option value="true">Sport : oui</option>
                  </select>
                  <select
                    name="sportActivityType"
                    defaultValue="Autre"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  >
                    {SPORT_ACTIVITY_TYPES.map((activity) => (
                      <option key={activity} value={activity}>{activity}</option>
                    ))}
                  </select>
                  <input
                    name="sportNote"
                    type="text"
                    maxLength={120}
                    placeholder="Note sport"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  />
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </form>
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
                      <select
                        name="sportDone"
                        defaultValue={entry.sport_done ? "true" : "false"}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                      >
                        <option value="false">Sport : non</option>
                        <option value="true">Sport : oui</option>
                      </select>
                      <select
                        name="sportActivityType"
                        defaultValue={entry.sport_activity_type ?? "Autre"}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                      >
                        {SPORT_ACTIVITY_TYPES.map((activity) => (
                          <option key={activity} value={activity}>{activity}</option>
                        ))}
                      </select>
                      <input
                        name="sportNote"
                        type="text"
                        maxLength={120}
                        defaultValue={entry.sport_note ?? ""}
                        placeholder="Note sport"
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
                    {entryFeedback[entry.id] ? (
                      <div
                        className={
                          entryFeedback[entry.id].type === "success"
                            ? "mt-3 rounded-[18px] border border-emerald-300/20 bg-emerald-500/12 px-4 py-3 text-sm font-semibold text-emerald-200"
                            : entryFeedback[entry.id].type === "error"
                              ? "mt-3 rounded-[18px] border border-red-300/20 bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-200"
                              : "mt-3 rounded-[18px] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-slate-200"
                        }
                      >
                        <div className="flex items-center gap-2">
                          {entryFeedback[entry.id].type === "pending" ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : entryFeedback[entry.id].type === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : null}
                          <span>{entryFeedback[entry.id].message}</span>
                        </div>
                      </div>
                    ) : null}
                  </form>
                ))}
                {entries.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                    Aucune pesée enregistrée pour le moment.
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      <DevToolsPanel runtime={initialData.runtime} profiles={initialData.profiles} />
    </div>
  );
}
