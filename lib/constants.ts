import type { GoalType, PersonSlug } from "@/lib/types";

export const APP_NAME = "Duel de Poids";
export const APP_DESCRIPTION =
  "Suivi de transformation sur 4 mois entre Ilias et Renaud.";

export const TIMEZONE = "Europe/Brussels";
export const ACCESS_COOKIE_NAME = "site-access";

export const ACTIVE_PERSON_SLUGS = ["ilias", "renaud"] as const satisfies readonly PersonSlug[];

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
    gradient: "from-sky-400 via-cyan-400 to-blue-500",
    panel: "bg-cyan-500/10",
    ring: "#38bdf8",
    badge: "bg-cyan-500/15 text-cyan-100 border-cyan-300/30"
  },
  renaud: {
    gradient: "from-orange-400 via-emerald-400 to-lime-400",
    panel: "bg-emerald-500/10",
    ring: "#fb923c",
    badge: "bg-orange-500/15 text-orange-100 border-orange-300/30"
  }
};

export const GOAL_LABELS: Record<GoalType, string> = {
  loss: "Objectif perte de poids",
  gain: "Objectif prise de poids"
};

export const SPORT_ACTIVITY_TYPES = [
  "Futsal",
  "Football",
  "Vélo",
  "Marche",
  "Course à pied",
  "Musculation générale",
  "Randonnée",
  "Renforcement musculaire",
  "Calisthénie",
  "Natation / piscine",
  "Autre"
] as const;
