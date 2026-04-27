"use client";

import { formatPercent, formatWeight } from "@/lib/utils";

export function ProgressGauge({
  realProgressPercent,
  theoreticalProgressPercent,
  lostWeight,
  remainingWeight,
  accentColor,
  movedLabel = "perdus",
  remainingLabel = "restants"
}: Readonly<{
  realProgressPercent: number;
  theoreticalProgressPercent: number;
  lostWeight: number;
  remainingWeight: number;
  accentColor: string;
  movedLabel?: string;
  remainingLabel?: string;
}>) {
  const size = 240;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const theoreticalRadius = radius - 24;
  const circumference = 2 * Math.PI * radius;
  const theoreticalCircumference = 2 * Math.PI * theoreticalRadius;
  const safeValue = Math.min(Math.max(realProgressPercent, 0), 100);
  const safeTheoretical = Math.min(Math.max(theoreticalProgressPercent, 0), 100);
  const realOffset = circumference - (safeValue / 100) * circumference;
  const theoreticalOffset = theoreticalCircumference - (safeTheoretical / 100) * theoreticalCircumference;

  return (
    <div className="relative mx-auto flex w-full max-w-[300px] flex-col items-center sm:max-w-[320px]">
      <div
        className="gauge-glow absolute inset-x-8 top-8 h-32 rounded-full blur-3xl sm:h-36"
        style={{ background: `${accentColor}38` }}
      />
      <div className="relative aspect-square w-[min(72vw,240px)] sm:w-[248px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90 overflow-visible">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(148,163,184,0.16)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={theoreticalRadius}
            stroke="rgba(203,213,225,0.62)"
            strokeWidth={5}
            strokeDasharray="5 9"
            strokeDashoffset={theoreticalOffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accentColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={realOffset}
            style={{
              filter: `drop-shadow(0 0 14px ${accentColor}66)`,
              transition: "stroke-dashoffset 700ms ease"
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className="font-[var(--font-heading)] text-6xl font-bold leading-none text-white sm:text-7xl">
            {formatPercent(realProgressPercent)}
          </p>
          <p className="mt-2 text-sm font-bold text-white sm:text-base">
            {formatWeight(lostWeight)} {movedLabel}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
            {formatWeight(remainingWeight)} {remainingLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs font-semibold text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
          Réel
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-300/70 bg-slate-500/25" />
          Théorique {formatPercent(theoreticalProgressPercent)}
        </span>
      </div>
    </div>
  );
}
