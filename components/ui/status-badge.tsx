import { cn } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";

const styles: Record<ProgressStatus, string> = {
  "en avance": "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  "dans les temps": "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  "en retard": "border-orange-400/30 bg-orange-500/10 text-orange-100"
};

export function StatusBadge({ status }: Readonly<{ status: ProgressStatus }>) {
  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", styles[status])}>
      {status}
    </span>
  );
}
