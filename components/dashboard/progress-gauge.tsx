"use client";

import { formatPercent } from "@/lib/utils";

export function ProgressGauge({
  label,
  value,
  theoretical,
  accentColor
}: Readonly<{
  label: string;
  value: number;
  theoretical: number;
  accentColor: string;
}>) {
  const realAngle = Math.min(Math.max(value, 0), 100) * 3.6;
  const theoreticalAngle = Math.min(Math.max(theoretical, 0), 100) * 3.6;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative flex h-48 w-48 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${accentColor} ${realAngle}deg, rgba(148,163,184,0.12) ${realAngle}deg 360deg)`
        }}
      >
        <div className="absolute inset-[14px] rounded-full bg-slate-950/95" />
        <div
          className="absolute h-40 w-40 rounded-full border border-dashed border-white/10"
          style={{
            clipPath: `polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)`,
            transform: `rotate(${theoreticalAngle}deg)`
          }}
        />
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="font-[var(--font-heading)] text-5xl font-bold text-white">{formatPercent(value)}</p>
          <p className="mt-2 text-sm text-slate-400">Théorique {formatPercent(theoretical)}</p>
        </div>
      </div>
    </div>
  );
}
