'use client';

import React from 'react';
import { DirectorReport as IDirectorReport, BalancePatch } from '../lib/types';
import { Sparkles, ShieldCheck, AlertCircle, Wrench, FileCode, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { getSeverityBadge } from '../lib/utils';

interface DirectorReportProps {
  report: IDirectorReport;
  patch?: BalancePatch | null;
  onDownloadPatch?: () => void;
  onClose?: () => void;
}

export const DirectorReport: React.FC<DirectorReportProps> = ({
  report,
  patch,
  onDownloadPatch,
  onClose,
}) => {
  const healthScore = report.health_score || 85;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.3)]';
    return 'text-red-400 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse';
  };

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-slate-950/95 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-white tracking-wide uppercase">
              DIRECTOR QA AUDIT // BALANCE REPORT
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Run ID: <b className="text-cyan-300">{report.run_id}</b> | Generated from Swarm Playtesting Telemetry
            </span>
          </div>
        </div>

        {/* Health Gauge Widget */}
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 bg-slate-900/80 ${getHealthColor(healthScore)}`}>
            <span className="text-2xl font-mono font-black">{healthScore}</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">GAME HEALTH</span>
          </div>

          {onDownloadPatch && (
            <button
              onClick={onDownloadPatch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT BALANCE_PATCH.JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <span className="text-xs font-mono font-bold text-amber-400 block mb-1 uppercase tracking-wider">
          Executive QA Summary
        </span>
        <p className="text-sm font-mono text-slate-200 leading-relaxed">
          {report.executive_summary}
        </p>
      </div>

      {/* Grid: Common Friction vs Persona Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common Friction */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>Common Playthrough Friction</span>
          </div>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300">
            {report.common_issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Systemic Balance Issues */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
            <Wrench className="w-4 h-4" />
            <span>Systemic Balance Vulnerabilities</span>
          </div>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300">
            {report.systemic_issues.map((sys, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{sys}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Persona-Specific Deep Dive */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
          Persona-Specific Telemetry Synthesis
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
            <span className="font-bold text-cyan-400 block">CASUAL PERSONA</span>
            {report.persona_specific_issues?.casual?.map((p, i) => (
              <p key={i} className="text-slate-300 text-[11px]">- {p}</p>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-1.5">
            <span className="font-bold text-purple-400 block">SPEEDRUNNER PERSONA</span>
            {report.persona_specific_issues?.speedrunner?.map((p, i) => (
              <p key={i} className="text-slate-300 text-[11px]">- {p}</p>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <span className="font-bold text-emerald-400 block">EXPLORER PERSONA</span>
            {report.persona_specific_issues?.explorer?.map((p, i) => (
              <p key={i} className="text-slate-300 text-[11px]">- {p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations & Actionable Balance Patches */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wide">
            AUTOMATED BALANCE RECOMMENDATIONS ({report.recommendations.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 font-mono text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                    ROOM {rec.room}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${getSeverityBadge(rec.severity)}`}>
                    {rec.severity} SEVERITY
                  </span>
                </div>
                <span className="text-slate-400">
                  Confidence: <b className="text-emerald-400">{Math.round(rec.confidence * 100)}%</b>
                </span>
              </div>

              <div className="text-slate-100 font-semibold pl-2 border-l-2 border-emerald-500">
                Fix: {rec.actionable_fix}
              </div>

              {rec.evidence && (
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-slate-500">Evidence:</span>
                  {Object.entries(rec.evidence).map(([k, v]) => (
                    <span key={k}>
                      {k}: <b className="text-slate-300">{String(v)}</b>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
