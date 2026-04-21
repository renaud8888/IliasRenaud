import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AdminPanel } from "@/components/forms/admin-panel";
import { SetupState } from "@/components/ui/setup-state";
import { isAuthenticated } from "@/lib/auth";
import { getAdminData } from "@/lib/services/dashboard";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  try {
    const data = await getAdminData();

    return (
      <AppShell showAdminLink={false} backLink={{ href: "/", label: "Retour accueil" }}>
        <AdminPanel initialData={data} />
      </AppShell>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur de configuration serveur empêche encore de charger l’admin.";

    return (
      <AppShell showAdminLink={false} backLink={{ href: "/", label: "Retour accueil" }}>
        <SetupState
          title="L’admin n’est pas encore prête"
          message={`${message} Vérifie surtout les variables d’environnement Vercel et l’initialisation Supabase.`}
          showAdminLink
        />
      </AppShell>
    );
  }
}
