"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { WeeklyPoint } from "@/lib/types";
import { formatWeight } from "@/lib/utils";

export function WeeklyWeightChart({
  data,
  accentColor
}: Readonly<{
  data: WeeklyPoint[];
  accentColor: string;
}>) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number | string, name) => [formatWeight(Number(value)), name === "averageWeight" ? "Réel" : "Théorique"]}
            labelFormatter={(label) => `Semaine ${label}`}
          />
          <Line
            type="monotone"
            dataKey="averageWeight"
            name="averageWeight"
            stroke={accentColor}
            strokeWidth={3}
            dot={{ r: 3 }}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
