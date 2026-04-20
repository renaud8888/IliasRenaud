"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          password: String(formData.get("password")),
          next: searchParams.get("next") ?? "/"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Mot de passe incorrect.");
        return;
      }

      router.push(result.redirectTo ?? "/");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-300">
          <LockKeyhole className="h-4 w-4" />
          <span className="text-sm font-semibold">Accès privé</span>
        </div>
        <input
          name="password"
          type="password"
          placeholder="Mot de passe global"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion..." : "Entrer dans le suivi"}
      </Button>
    </form>
  );
}
