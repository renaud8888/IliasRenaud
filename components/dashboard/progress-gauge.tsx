"use client";

import { formatPercent } from "@/lib/utils";

export function ProgressGauge({
  value,
  theoretical,
  accentColor,
  title,
  subtitle
}: Readonly<{
  value: number;
  theoretical: number;
  accentColor: string;
  title: string;
  subtitle: string;
}>) {
  const size = 248;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(Math.max(value, 0), 100);
  const safeTheoretical = Math.min(Math.max(theoretical, 0), 100);
  const realOffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative mx-auto flex w-full max-w-[320px] flex-col items-center">
      <div
        className="gauge-glow absolute inset-x-10 top-8 h-36 rounded-full blur-3xl"
        style={{ background: `${accentColor}33` }}
      />
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90 overflow-visible">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 26}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={4}
            strokeDasharray="4 8"
            fill="transparent"
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
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 26}
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={6}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={2 * Math.PI * (radius - 26)}
            strokeDashoffset={2 * Math.PI * (radius - 26) - (safeTheoretical / 100) * 2 * Math.PI * (radius - 26)}
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="section-title">{title}</p>
          <p className="mt-2 font-[var(--font-heading)] text-6xl font-bold tracking-tight text-white">
            {formatPercent(value)}
          </p>
          <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
            Théorique {formatPercent(theoretical)}
          </p>
        </div>
      </div>
    </div>
  );
}
