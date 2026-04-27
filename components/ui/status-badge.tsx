import { cn } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";

const styles: Record<ProgressStatus, string> = {
  "en avance": "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  "dans les temps": "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  "en retard": "border-orange-400/30 bg-orange-500/10 text-orange-100"
};

export function StatusBadge({ status }: Readonly<{ status: ProgressStatus }>) {
  return (
    <span className={cn("inline-flex shrink-0 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-3 sm:text-xs", styles[status])}>
      {status}
    </span>
  );
}
