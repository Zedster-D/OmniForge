import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export function getFrustrationColor(score: number): string {
  if (score < 25) return "text-emerald-400";
  if (score < 55) return "text-yellow-400";
  if (score < 80) return "text-amber-500";
  return "text-red-500 animate-pulse";
}

export function getFrustrationBgColor(score: number): string {
  if (score < 25) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (score < 55) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
  if (score < 80) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  return "bg-red-500/20 border-red-500/50 text-red-400";
}

export function getSeverityBadge(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
    case "high":
      return "bg-amber-500/20 text-amber-400 border border-amber-500/50";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
    case "low":
    default:
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40";
  }
}
