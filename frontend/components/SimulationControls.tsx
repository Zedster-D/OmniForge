'use client';

import React from 'react';
import { Play, Square, RotateCcw, Cpu, Zap, Activity, ShieldAlert, Sparkles, FileText } from 'lucide-react';
import { AIMode, SimulationStatus } from '../lib/types';
import { DEMO_PRESETS } from '../hooks/useSimulation';

interface SimulationControlsProps {
  runId?: string;
  seed: number;
  onSeedChange: (seed: number) => void;
  aiMode: AIMode;
  status: SimulationStatus;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  onStart: (seed?: number) => void;
  onStop: () => void;
  onReplay: () => void;
  onOpenDirectorModal: () => void;
  hasReport: boolean;
  loading: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  runId,
  seed,
  onSeedChange,
  aiMode,
  status,
  speedMultiplier,
  onSpeedChange,
  onStart,
  onStop,
  onReplay,
  onOpenDirectorModal,
  hasReport,
  loading,
}) => {
  const isRunning = status === 'running';

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Simulation Meta & AI Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Activity className={`w-4 h-4 ${isRunning ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
            <span className="text-xs font-mono text-slate-400">RUN:</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{runId || 'NOT INITIALIZED'}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider ${
              aiMode === 'OPENAI'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI MODE: {aiMode}</span>
          </div>

          {/* Preset Selector */}
          <div className="relative">
            <select
              className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
              value={seed}
              onChange={(e) => onSeedChange(Number(e.target.value))}
              disabled={isRunning}
            >
              {DEMO_PRESETS.map((p) => (
                <option key={p.seed} value={p.seed}>
                  {p.name} (Seed {p.seed})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Playback Speed */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
          <span className="text-[11px] font-mono text-slate-400 px-2">SPEED:</span>
          {[0.5, 1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => onSpeedChange(spd)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-all ${
                speedMultiplier === spd
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={() => onStart()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START SWARM</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>ABORT RUN</span>
            </button>
          )}

          <button
            onClick={onReplay}
            disabled={isRunning || !runId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 hover:text-purple-300 text-slate-300 font-mono font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer"
            title="Replay historical telemetry from database"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REPLAY</span>
          </button>

          {hasReport && (
            <button
              onClick={onOpenDirectorModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/60 text-amber-300 hover:text-amber-200 font-mono font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all animate-bounce cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>DIRECTOR REPORT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
