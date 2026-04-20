import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatPercent, formatWeight } from "@/lib/utils";
import type { ParticipantDashboard, ProgressStatus } from "@/lib/types";

function renderStatusPill(status: ProgressStatus) {
  const styles: Record<ProgressStatus, string> = {
    "en avance": "background:#164e63;color:#a5f3fc;",
    "dans les temps": "background:#14532d;color:#bbf7d0;",
    "en retard": "background:#7c2d12;color:#fdba74;"
  };

  return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;${styles[status]}">${status}</span>`;
}

export function buildWeeklySummaryEmail(params: {
  participant: ParticipantDashboard;
  counterpart?: ParticipantDashboard;
  motivation: string;
}) {
  const { participant, counterpart, motivation } = params;

  return `
    <div style="font-family:Arial,sans-serif;background:#07111f;padding:24px;color:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;padding:28px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8;">Résumé du lundi</p>
        <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">${participant.firstName}, on garde le cap.</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;">Semaine du ${format(new Date(), "d MMMM yyyy", { locale: fr })}</p>
        <div style="display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:20px;">
          <div style="background:#0f172a;border-radius:18px;padding:16px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Poids hebdomadaire</div>
            <div style="font-size:28px;font-weight:800;">${formatWeight(participant.currentWeeklyWeight)}</div>
          </div>
          <div style="background:#0f172a;border-radius:18px;padding:16px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Objectif final</div>
            <div style="font-size:28px;font-weight:800;">${formatWeight(participant.targetWeight)}</div>
          </div>
        </div>
        <div style="display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:20px;">
          <div style="background:#0f172a;border-radius:18px;padding:16px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Progression réelle</div>
            <div style="font-size:28px;font-weight:800;">${formatPercent(participant.realProgressPct)}</div>
          </div>
          <div style="background:#0f172a;border-radius:18px;padding:16px;">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Progression théorique</div>
            <div style="font-size:28px;font-weight:800;">${formatPercent(participant.theoreticalProgressPct)}</div>
          </div>
        </div>
        <div style="margin-bottom:18px;">${renderStatusPill(participant.status)}</div>
        <p style="margin:0 0 18px;font-size:15px;color:#e2e8f0;">${motivation}</p>
        ${
          counterpart
            ? `<p style="margin:0 0 18px;font-size:14px;color:#cbd5e1;">Petit regard sur ${counterpart.firstName} : ${formatWeight(counterpart.currentWeeklyWeight)}, ${formatPercent(counterpart.realProgressPct)} de progression réelle.</p>`
            : ""
        }
        <div style="background:linear-gradient(135deg,#1d4ed8,#0f766e);border-radius:20px;padding:18px;">
          <p style="margin:0;font-size:14px;color:#eff6ff;">Cap final : garder la discipline jusqu'au 31 août, une semaine propre après l'autre.</p>
        </div>
      </div>
    </div>
  `;
}

export function buildMissedEntryReminderEmail(params: { firstName: string; motivation: string }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#07111f;padding:24px;color:#f8fafc;">
      <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;padding:28px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8;">Rappel léger</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;">${params.firstName}, on n'oublie pas la pesée.</h1>
        <p style="margin:0 0 14px;font-size:15px;color:#cbd5e1;">Aucune entrée détectée depuis 3 jours. Une mesure aujourd'hui suffit pour relancer la dynamique.</p>
        <div style="background:#0f172a;border-radius:18px;padding:16px;">
          <p style="margin:0;font-size:15px;color:#e2e8f0;">${params.motivation}</p>
        </div>
      </div>
    </div>
  `;
}
