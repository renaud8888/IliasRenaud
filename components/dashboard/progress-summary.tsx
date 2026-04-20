import { cn } from "@/lib/utils";

export function ProgressSummary({
  theoretical,
  actual,
  difference,
  statusText
}: Readonly<{
  theoretical: string;
  actual: string;
  difference: number;
  statusText: string;
}>) {
  const tone =
    difference >= 3
      ? "text-emerald-300"
      : difference <= -3
        ? "text-red-300"
        : "text-orange-200";

  return (
    <div className="space-y-2 rounded-[28px] bg-white/[0.04] p-5 md:p-6">
      <p className="section-title">Cap du jour</p>
      <div className="space-y-1 text-base leading-7 text-slate-200 md:text-lg">
        <p>
          Objectif aujourd&apos;hui : <span className="font-bold text-white">{theoretical}</span>
        </p>
        <p>
          Actuel : <span className="font-bold text-white">{actual}</span>
        </p>
        <p className={cn("font-semibold", tone)}>
          {statusText}
        </p>
      </div>
    </div>
  );
}
