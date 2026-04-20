"use client";

import Link from "next/link";
import { LogOut, Settings2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  showAdminLink = true
}: Readonly<{
  children: React.ReactNode;
  showAdminLink?: boolean;
}>) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/8 p-3 text-orange-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Suivi privé</p>
              <h1 className="font-[var(--font-heading)] text-lg font-bold text-white">Duel de Poids</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showAdminLink ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                <Settings2 className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <Button variant="secondary" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Quitter
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
