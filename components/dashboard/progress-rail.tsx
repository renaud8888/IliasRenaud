"use client";

import { formatPercent } from "@/lib/utils";

export function ProgressRail({
  actual,
  theoretical,
  accentColor
}: Readonly<{
  actual: number;
  theoretical: number;
  accentColor: string;
}>) {
  const safeActual = Math.min(Math.max(actual, 0), 100);
  const safeTheoretical = Math.min(Math.max(theoretical, 0), 100);

  return (
    <div className="space-y-3 rounded-[28px] bg-white/[0.04] p-5">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Réel</span>
        <span className="font-semibold text-white">{formatPercent(actual)}</span>
      </div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/35 transition-all duration-700"
          style={{ width: `${safeTheoretical}%` }}
        />
        <div
          className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.16)] transition-all duration-700"
          style={{
            width: `${safeActual}%`,
            background: `linear-gradient(90deg, ${accentColor}AA 0%, ${accentColor} 100%)`
          }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-slate-950"
          style={{ left: `${safeTheoretical}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
        <span>Théorique {formatPercent(theoretical)}</span>
        <span>Réel {formatPercent(actual)}</span>
      </div>
    </div>
  );
}
