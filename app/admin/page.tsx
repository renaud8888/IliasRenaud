import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AdminPanel } from "@/components/forms/admin-panel";
import { isAuthenticated } from "@/lib/auth";
import { getAdminData } from "@/lib/services/dashboard";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  const data = await getAdminData();

  return (
    <AppShell showAdminLink={false}>
      <AdminPanel initialData={data} />
    </AppShell>
  );
}
