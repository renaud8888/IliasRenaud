import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { isAuthenticated } from "@/lib/auth";
import { getTodayInTimezone, toDateString } from "@/lib/date";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  const [dashboard, today] = await Promise.all([getDashboardData(), Promise.resolve(toDateString(getTodayInTimezone()))]);

  return (
    <AppShell>
      <DashboardView data={dashboard} today={today} />
    </AppShell>
  );
}
