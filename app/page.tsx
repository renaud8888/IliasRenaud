import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SetupState } from "@/components/ui/setup-state";
import { isAuthenticated } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  try {
    const dashboard = await getDashboardData();

    return (
      <AppShell>
        <DashboardView data={dashboard} today={dashboard.dateContext.currentDate.slice(0, 10)} />
      </AppShell>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur de configuration serveur empêche encore de charger le dashboard.";

    return (
      <AppShell>
        <SetupState
          title="Le dashboard n’est pas encore prêt"
          message={`${message} Vérifie les variables d’environnement Supabase dans Vercel puis exécute le SQL de création et de seed.`}
        />
      </AppShell>
    );
  }
}
