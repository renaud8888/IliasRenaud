import type { PersonSlug } from "@/lib/types";

export const APP_NAME = "Duel de Poids";
export const APP_DESCRIPTION =
  "Suivi de transformation sur 4 mois entre Ilias et Renaud.";

export const TIMEZONE = "Europe/Brussels";
export const ACCESS_COOKIE_NAME = "site-access";

export const PERSON_EMAIL_ENV_KEYS: Record<PersonSlug, "ILIAS_EMAIL" | "RENAUD_EMAIL"> = {
  ilias: "ILIAS_EMAIL",
  renaud: "RENAUD_EMAIL"
};

export const PERSON_THEME: Record<
  PersonSlug,
  {
    gradient: string;
    panel: string;
    ring: string;
    badge: string;
  }
> = {
  ilias: {
    gradient: "from-amber-400 via-orange-500 to-red-500",
    panel: "bg-orange-500/10",
    ring: "#f97316",
    badge: "bg-orange-500/15 text-orange-200 border-orange-400/30"
  },
  renaud: {
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    panel: "bg-emerald-500/10",
    ring: "#14b8a6",
    badge: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30"
  }
};
