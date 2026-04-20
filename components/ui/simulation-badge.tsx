import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FlaskConical } from "lucide-react";
import { parseDateString } from "@/lib/date";
import type { AppDateContext } from "@/lib/types";

export function SimulationBadge({ dateContext }: Readonly<{ dateContext: AppDateContext }>) {
  if (!dateContext.isSimulated || !dateContext.simulatedDate) {
    return null;
  }

  const date = parseDateString(dateContext.simulatedDate);

  return (
    <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-500/10 px-4 py-3 text-cyan-100">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-4 w-4" />
        <p className="text-sm font-semibold">
          Mode simulation actif - date simulée : {format(date, "EEEE d MMM yyyy 'à' HH:mm", { locale: fr })}
        </p>
      </div>
    </div>
  );
}
