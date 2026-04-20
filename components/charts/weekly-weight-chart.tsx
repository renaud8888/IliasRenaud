"use client";

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { WeeklyPoint } from "@/lib/types";
import { formatWeight } from "@/lib/utils";

export function WeeklyWeightChart({
  data,
  accentColor,
  slug
}: Readonly<{
  data: WeeklyPoint[];
  accentColor: string;
  slug: "ilias" | "renaud";
}>) {
  const chartData = data.map((item) => ({
    ...item,
    actualWeight: item.averageWeight ?? undefined,
    difference:
      typeof item.averageWeight === "number" ? Number((item.averageWeight - item.theoreticalWeight).toFixed(1)) : null
  }));
  const gradientId = `actual-fill-${slug}`;
  const lineId = `line-fill-${slug}`;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ left: -20, right: 8, top: 12, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.7} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number | string, name) => {
              if (name === "difference") {
                return [`${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(1)} kg`, "Écart"];
              }

              return [formatWeight(Number(value)), name === "actualWeight" ? "Réel" : "Théorique"];
            }}
            labelFormatter={(label) => `Semaine ${label}`}
          />
          <Area
            type="monotone"
            dataKey="theoreticalWeight"
            stroke="transparent"
            fill="rgba(255,255,255,0.06)"
            fillOpacity={1}
            isAnimationActive
          />
          <Area
            type="monotone"
            dataKey="actualWeight"
            stroke="transparent"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="actualWeight"
            name="actualWeight"
            stroke={`url(#${lineId})`}
            strokeWidth={3.5}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="theoreticalWeight"
            name="theoreticalWeight"
            stroke="#cbd5e1"
            strokeDasharray="6 6"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
