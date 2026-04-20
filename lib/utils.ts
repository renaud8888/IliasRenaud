import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatWeight(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${round(value, 1).toFixed(1)} kg`;
}

export function formatPercent(value: number) {
  return `${round(value, 0)} %`;
}
