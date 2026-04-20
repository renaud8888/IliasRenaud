"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-slate-900/90 p-6">
          <div className="mb-4 flex items-center gap-3 text-orange-300">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">Erreur applicative</p>
          </div>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">
            Le rendu a rencontré une erreur côté serveur
          </h1>
          <p className="mt-4 text-slate-300">
            Vérifie la configuration Vercel et Supabase, puis recharge. Si un digest est affiché, il peut aider à retrouver l’erreur exacte dans les logs.
          </p>
          {error.digest ? (
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Digest: {error.digest}
            </p>
          ) : null}
          <Button className="mt-6" onClick={reset}>
            Réessayer
          </Button>
        </div>
      </body>
    </html>
  );
}
