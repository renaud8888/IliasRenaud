"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Beaker,
  CheckCircle2,
  Clock4,
  Download,
  LoaderCircle,
  Mail,
  RefreshCcw,
  RotateCcw,
  Send,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SimulationBadge } from "@/components/ui/simulation-badge";
import type { AdminPayload, AppDateContext, DevEmailDryRunItem, DevScenarioDefinition } from "@/lib/types";

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

export function DevToolsPanel({
  runtime,
  profiles
}: Readonly<{
  runtime: AdminPayload["runtime"];
  profiles: AdminPayload["profiles"];
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dateContext, setDateContext] = useState<AppDateContext>(runtime.dateContext);
  const [simulatedNow, setSimulatedNow] = useState<string>(
    toDateTimeLocalValue(runtime.settings.simulated_now ?? runtime.dateContext.simulatedDate)
  );
  const [simulationEnabled, setSimulationEnabled] = useState(runtime.settings.simulation_enabled);
  const [generator, setGenerator] = useState({
    startDate: profiles.length > 0 ? runtime.dateContext.currentDate.slice(0, 10) : "",
    endDate: runtime.dateContext.currentDate.slice(0, 10),
    frequency: "daily",
    trend: "realistic",
    overwriteMode: "replace",
    includeNoise: true,
    includeMissingDays: true
  });
  const [previewItems, setPreviewItems] = useState<DevEmailDryRunItem[]>([]);

  if (!runtime.devToolsEnabled) {
    return null;
  }

  async function postDevAction(body: Record<string, unknown>) {
    const response = await fetch("/api/dev/tools", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(result.error ?? "Action dev impossible.");
    }

    return result;
  }

  function runAction(
    action: () => Promise<void>,
    successMessage: string,
    options?: { refresh?: boolean }
  ) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await action();
        setSuccess(successMessage);
        if (options?.refresh) {
          router.refresh();
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Erreur dev inconnue.");
      }
    });
  }

  function withConfirm(
    message: string,
    action: () => Promise<void>,
    successMessage: string,
    options?: { refresh?: boolean }
  ) {
    if (!window.confirm(message)) {
      return;
    }

    runAction(action, successMessage, options);
  }

  return (
    <div className="space-y-6">
      <SimulationBadge dateContext={dateContext} />

      {(pending || error || success) ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3">
          {pending ? (
            <div className="flex items-center gap-3 text-slate-200">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <p className="text-sm font-medium">Action en cours...</p>
            </div>
          ) : null}
          {!pending && success ? (
            <div className="flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          ) : null}
          {!pending && error ? (
            <div className="text-sm font-medium text-red-300">{error}</div>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="section-title">Simulation & tests</p>
        <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">Outils de développement</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Cette zone reste volontairement réservée au développement ou aux environnements explicitement autorisés.
          Toutes les données injectées ici sont marquées comme données de test pour rester réversibles.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Clock4 className="mt-1 h-5 w-5 text-cyan-300" />
            <div className="w-full">
              <p className="section-title">Date simulée</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Horloge applicative</h3>
              <p className="mt-2 text-sm text-slate-400">
                Date système réelle: {dateContext.systemDate.slice(0, 19).replace("T", " ")}
              </p>
              <div className="mt-5 grid gap-4">
                <label className="flex items-center gap-3 text-sm text-slate-100">
                  <input
                    type="checkbox"
                    checked={simulationEnabled}
                    onChange={(event) => setSimulationEnabled(event.target.checked)}
                  />
                  Activer une date simulée
                </label>
                <input
                  type="datetime-local"
                  value={simulatedNow}
                  onChange={(event) => setSimulatedNow(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        const result = await postDevAction({
                          action: "set-simulated-date",
                          enabled: simulationEnabled,
                          simulatedNow: simulationEnabled && simulatedNow ? new Date(simulatedNow).toISOString() : null
                        });
                        setDateContext(result);
                      }, "Date simulée mise à jour.", { refresh: true })
                    }
                  >
                    Appliquer la date simulée
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        const result = await postDevAction({ action: "use-system-date" });
                        setDateContext(result);
                        setSimulationEnabled(false);
                      }, "Retour à la vraie date système.", { refresh: true })
                    }
                  >
                    Revenir à la date réelle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-emerald-300" />
            <div className="w-full">
              <p className="section-title">Scénarios de test</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Injection en un clic</h3>
              <div className="mt-5 grid gap-3">
                {runtime.scenarios.map((scenario: DevScenarioDefinition) => (
                  <button
                    key={scenario.key}
                    type="button"
                    className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]"
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        const result = await postDevAction({
                          action: "apply-scenario",
                          scenarioKey: scenario.key
                        });

                        if (scenario.key === "scenario-h" && result?.scenario) {
                          setSimulationEnabled(true);
                        }
                      }, `${scenario.title} injecté. Recharge visuelle appliquée.`, { refresh: true })
                    }
                  >
                    <p className="font-semibold text-white">{scenario.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Beaker className="mt-1 h-5 w-5 text-orange-300" />
            <div className="w-full">
              <p className="section-title">Génération de données</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Faux poids réalistes</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Date de début</span>
                  <input
                    type="date"
                    value={generator.startDate}
                    onChange={(event) => setGenerator((current) => ({ ...current, startDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Date de fin</span>
                  <input
                    type="date"
                    value={generator.endDate}
                    onChange={(event) => setGenerator((current) => ({ ...current, endDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Fréquence</span>
                  <select
                    value={generator.frequency}
                    onChange={(event) => setGenerator((current) => ({ ...current, frequency: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  >
                    <option value="daily">Tous les jours</option>
                    <option value="partial">Jours partiels</option>
                    <option value="gaps">Oublis aléatoires</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Tendance</span>
                  <select
                    value={generator.trend}
                    onChange={(event) => setGenerator((current) => ({ ...current, trend: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  >
                    <option value="realistic">Réaliste</option>
                    <option value="behind">En retard</option>
                    <option value="ahead">En avance</option>
                    <option value="flat">Quasi plate</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Entrées existantes</span>
                  <select
                    value={generator.overwriteMode}
                    onChange={(event) => setGenerator((current) => ({ ...current, overwriteMode: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white"
                  >
                    <option value="replace">Remplacer</option>
                    <option value="ignore">Ignorer</option>
                  </select>
                </label>
                <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <label className="flex items-center gap-3 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={generator.includeNoise}
                      onChange={(event) => setGenerator((current) => ({ ...current, includeNoise: event.target.checked }))}
                    />
                    Bruit quotidien réaliste
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={generator.includeMissingDays}
                      onChange={(event) => setGenerator((current) => ({ ...current, includeMissingDays: event.target.checked }))}
                    />
                    Autoriser des jours manquants
                  </label>
                </div>
              </div>
              <Button
                className="mt-5"
                disabled={pending}
                onClick={() =>
                  runAction(async () => {
                    await postDevAction({
                      action: "generate-data",
                      payload: generator
                    });
                  }, "Données fictives générées. Recharge visuelle appliquée.", { refresh: true })
                }
              >
                Générer les poids fictifs
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-sky-300" />
            <div className="w-full">
              <p className="section-title">Prévisualisation emails</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Dry-run et envoi test</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    runAction(async () => {
                      const result = await postDevAction({ action: "preview-weekly-email" });
                      setPreviewItems(result.items ?? []);
                    }, "Preview du résumé hebdomadaire prête.")
                  }
                >
                  Prévisualiser email hebdomadaire
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    runAction(async () => {
                      const result = await postDevAction({ action: "preview-reminder-email" });
                      setPreviewItems(result.items ?? []);
                    }, "Preview du rappel d’oubli prête.")
                  }
                >
                  Prévisualiser rappel oubli
                </Button>
                <Button
                  disabled={pending}
                  onClick={() =>
                    runAction(async () => {
                      await postDevAction({ action: "send-test-weekly-email" });
                    }, "Emails hebdomadaires de test envoyés.")
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  Tester email hebdomadaire
                </Button>
                <Button
                  disabled={pending}
                  onClick={() =>
                    runAction(async () => {
                      await postDevAction({ action: "send-test-reminder-email" });
                    }, "Rappels d’oubli de test envoyés.")
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  Tester rappel oubli
                </Button>
              </div>
              <div className="mt-5 space-y-4">
                {previewItems.length > 0 ? (
                  previewItems.map((item) => (
                    <div key={`${item.profileSlug}-${item.subject}`} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-semibold text-white">{item.subject}</p>
                      <p className="mt-1 text-sm text-slate-400">À : {item.to}</p>
                      <p className="mt-1 text-sm text-slate-400">Pourquoi : {item.reason}</p>
                      <div
                        className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/60"
                        dangerouslySetInnerHTML={{ __html: item.html }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Lance un dry-run pour voir à qui l’email serait envoyé, pourquoi et avec quelles données.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start gap-3">
            <RefreshCcw className="mt-1 h-5 w-5 text-amber-300" />
            <div className="w-full">
              <p className="section-title">Reset / rollback</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Actions réversibles</h3>
              <div className="mt-5 grid gap-3">
                <Button
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    withConfirm(
                      "Supprimer toutes les données de test ?",
                      async () => {
                        await postDevAction({ action: "delete-test-data" });
                      },
                      "Toutes les données de test ont été supprimées.",
                      { refresh: true }
                    )
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer toutes les données de test
                </Button>
                <Button
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    withConfirm(
                      "Réinitialiser complètement les données par défaut ?",
                      async () => {
                        await postDevAction({ action: "reset-default-data" });
                      },
                      "Données par défaut restaurées.",
                      { refresh: true }
                    )
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réinitialiser les données par défaut
                </Button>
                <Button
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    withConfirm(
                      "Vider toutes les pesées, y compris les vraies données ?",
                      async () => {
                        await postDevAction({ action: "clear-weights" });
                      },
                      "Toutes les pesées ont été supprimées.",
                      { refresh: true }
                    )
                  }
                >
                  Vider uniquement les poids
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    withConfirm(
                      "Restaurer la configuration initiale (sans supprimer les poids) ?",
                      async () => {
                        await postDevAction({ action: "restore-initial-configuration" });
                      },
                      "Configuration initiale restaurée.",
                      { refresh: true }
                    )
                  }
                >
                  Restaurer configuration initiale
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Download className="mt-1 h-5 w-5 text-violet-300" />
            <div className="w-full">
              <p className="section-title">Snapshot</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl font-bold">Export JSON</h3>
              <p className="mt-2 text-sm text-slate-400">
                Export rapide de l’état actuel pour archivage ou restauration via script développeur.
              </p>
              <Button
                className="mt-5"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  runAction(async () => {
                    const snapshot = await postDevAction({ action: "export-snapshot" });
                    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
                  }, "Snapshot copié dans le presse-papiers.")
                }
              >
                Exporter un snapshot JSON
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
