'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'red';
  trend?: string;
  isProblem?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  color = 'cyan',
  trend,
  isProblem = false,
}) => {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    red: 'border-red-500/40 text-red-400 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
        isProblem ? colorMap.red : colorMap[color]
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">{title}</span>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
        {subValue && <span className="text-xs font-mono text-slate-400">{subValue}</span>}
      </div>

      {trend && (
        <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
      
      {/* Subtle corner tech accent */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-70" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-70" />
    </div>
  );
};
