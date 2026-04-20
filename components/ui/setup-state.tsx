import Link from "next/link";
import { AlertTriangle, Database, KeyRound, Mail, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SetupState({
  title,
  message,
  showAdminLink = false
}: Readonly<{
  title: string;
  message: string;
  showAdminLink?: boolean;
}>) {
  return (
    <Card className="max-w-3xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="section-title">Configuration requise</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-white">{title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">{message}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <KeyRound className="h-4 w-4" />
                <span className="font-semibold">Variables Vercel</span>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Vérifie au minimum `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SITE_PASSWORD` et `SESSION_SECRET`.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Database className="h-4 w-4" />
                <span className="font-semibold">SQL Supabase</span>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Exécute `sql/schema.sql` puis `sql/seed.sql` dans Supabase pour créer les tables et les données initiales.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Emails</span>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Les emails peuvent attendre pour le dashboard, mais `ILIAS_EMAIL`, `RENAUD_EMAIL`, `RESEND_API_KEY` et `RESEND_FROM_EMAIL` seront nécessaires ensuite.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Après correction</span>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Sauvegarde les variables dans Vercel, redeploie le projet, puis recharge la page.
              </p>
            </div>
          </div>

          {showAdminLink ? (
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Retour au dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
