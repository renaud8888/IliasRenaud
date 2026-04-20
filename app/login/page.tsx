import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md rounded-[32px] p-6 md:p-8">
        <p className="section-title">Accès</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-4xl font-bold">Duel de Poids</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Un seul mot de passe global pour consulter le tableau de bord, encoder les pesées et gérer l’admin.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
