import type { DevScenarioDefinition } from "@/lib/types";

export const DEFAULT_GLOBAL_SETTINGS = {
  start_date: "2026-05-01",
  end_date: "2026-08-31",
  status_tolerance_pct: 7.5,
  reminder_cooldown_days: 4,
  weekly_email_enabled: true,
  missed_entry_email_enabled: true,
  weekly_email_hour_local: "12:00"
};

export const DEFAULT_PROFILE_CONFIG = {
  ilias: {
    start_weight: 116,
    target_weight: 105,
    accent_color: "#38bdf8"
  },
  renaud: {
    start_weight: 65,
    target_weight: 70,
    accent_color: "#fb923c"
  }
} as const;

export const DEFAULT_MESSAGES = {
  ilias: [
    "Chaque pesée propre te rapproche du vrai déclic.",
    "Petit déficit, grosse discipline, résultat durable.",
    "Le plan gagne quand l'impulsion du jour faiblit.",
    "Ton objectif ne demande pas un miracle, juste des répétitions propres.",
    "Un bon choix maintenant vaut mieux qu'une excuse brillante ce soir.",
    "Hydratation, protéines, sommeil: le trio qui ne ment jamais.",
    "Le cardio aide, la constance finit le travail.",
    "On veut moins de flou, plus de maîtrise.",
    "Même à 80 %, une journée cadrée reste une victoire.",
    "Tu ne chasses pas juste des kilos, tu bâtis une version plus solide.",
    "Le week-end ne casse rien si tu gardes une ligne claire.",
    "Ton futur toi remercie déjà la pesée d'aujourd'hui.",
    "Rien de spectaculaire, juste une série de journées sérieuses.",
    "Perdre du poids avec calme, c'est jouer le match long intelligemment.",
    "Une envie passe. Une habitude bien tenue reste.",
    "Moins d'impro, plus de structure: c'est là que tu prends l'avantage.",
    "Ta discipline fait le sale boulot pour que la balance suive.",
    "Le frigo ne décide pas, c'est toi qui mènes la séance.",
    "Quand tu doutes, reviens au plan le plus simple possible.",
    "Le corps adore les routines propres. Continue."
  ],
  renaud: [
    "Chaque repas solide construit la progression que tu veux voir.",
    "On vise du propre: manger mieux, récupérer mieux, pousser mieux.",
    "La prise de poids utile adore la régularité.",
    "Si tu manges comme un athlète, le corps finit par répondre.",
    "Force, patience, calories bien posées: la recette reste simple.",
    "Une collation bien placée peut faire plus qu'un grand discours.",
    "Continue d'empiler les journées stables, les kilos suivront.",
    "Le muscle aime le sommeil presque autant que l'entraînement.",
    "Ton objectif n'est pas grossir au hasard, c'est construire plus fort.",
    "Une journée sérieuse vaut mieux qu'une semaine annoncée.",
    "Le shaker n'est pas de la magie, mais il sauve des points.",
    "Manger assez, ce n'est pas tricher, c'est jouer la bonne stratégie.",
    "La constance fait gonfler les résultats avant les bras.",
    "Tu peux rester lean et progresser, si tu tiens le plan.",
    "Aujourd'hui encore, on nourrit la machine intelligemment.",
    "Les petites portions ratent les grands objectifs.",
    "Tu ne cherches pas juste 70 kg, tu cherches 70 kg utiles.",
    "Quand l'appétit cale, la discipline prend le relais.",
    "Le progrès aime les repas qui reviennent sans drame.",
    "Encore une journée carrée et tu renforces le socle."
  ]
} as const;

export const DEV_SCENARIOS: DevScenarioDefinition[] = [
  { key: "scenario-a", title: "A - 14 jours propres", description: "Deux semaines complètes, tendance réaliste, sans oublis." },
  { key: "scenario-b", title: "B - 30 jours avec oublis", description: "Un mois de données avec quelques jours manquants." },
  { key: "scenario-c", title: "C - 60 jours réalistes", description: "Deux mois complets pour vérifier les moyennes hebdomadaires." },
  { key: "scenario-d", title: "D - Utilisateur en retard", description: "Ilias avance trop lentement par rapport au cap théorique." },
  { key: "scenario-e", title: "E - Utilisateur en avance", description: "Renaud dépasse la progression attendue." },
  { key: "scenario-f", title: "F - Semaine incomplète", description: "Semaine actuelle partielle pour tester la moyenne incomplète." },
  { key: "scenario-g", title: "G - Oubli depuis 3 jours", description: "Aucune pesée récente pour déclencher le rappel d’oubli." },
  { key: "scenario-h", title: "H - Lundi midi simulé", description: "Date simulée lundi à midi pour tester l’email hebdomadaire." }
];
