'use client';

import React, { useState } from 'react';
import { BalancePatch } from '../lib/types';
import { FileJson, Copy, Check, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getSeverityBadge } from '../lib/utils';

interface BalancePatchViewerProps {
  patch: BalancePatch | null;
}

export const BalancePatchViewer: React.FC<BalancePatchViewerProps> = ({ patch }) => {
  const [copied, setCopied] = useState(false);

  if (!patch) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-8 text-center font-mono text-sm text-slate-500 backdrop-blur-xl">
        No balance patch generated yet. Run the simulation through Room 10 to trigger the Director Agent.
      </div>
    );
  }

  const jsonString = JSON.stringify(patch, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance_patch_${patch.simulation_id || 'run'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 backdrop-blur-2xl shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                BALANCE_PATCH.JSON // MACHINE-READABLE SPECIFICATION
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                v{patch.version || '1.0'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Simulation: <b className="text-cyan-300">{patch.simulation_id}</b> | Total Changes: <b className="text-white">{patch.changes?.length || 0}</b>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-mono text-xs transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD .JSON</span>
          </button>
        </div>
      </div>

      {/* Quick Change Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {patch.changes?.map((c) => (
          <div key={c.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">{c.id} (Room {c.room})</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getSeverityBadge(c.severity)}`}>
                {c.severity}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-tight">{c.recommendation}</p>
            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>Category: <b className="text-slate-400">{c.category}</b></span>
              <span>Conf: <b className="text-emerald-400">{Math.round(c.confidence * 100)}%</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Code Editor Styled Raw Block */}
      <div className="relative rounded-xl border border-slate-800/80 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-[380px] overflow-y-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap">{jsonString}</pre>
      </div>
    </div>
  );
};
