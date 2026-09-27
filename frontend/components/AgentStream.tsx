'use client';

import React, { useRef, useEffect } from 'react';
import { TelemetryEvent } from '../lib/types';
import { formatTimeMs, getFrustrationColor } from '../lib/utils';
import { Terminal, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';

interface AgentStreamProps {
  agentId: 'casual' | 'speedrunner' | 'explorer';
  name: string;
  executableName: string;
  room: number;
  playerHp: number;
  maxPlayerHp: number;
  frustration: number;
  isFinished: boolean;
  events: TelemetryEvent[];
  themeColor: 'cyan' | 'purple' | 'emerald';
}

export const AgentStream: React.FC<AgentStreamProps> = ({
  agentId,
  name,
  executableName,
  room,
  playerHp,
  maxPlayerHp,
  frustration,
  isFinished,
  events,
  themeColor,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/40',
      headerBg: 'bg-cyan-950/40 border-cyan-500/30',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      accent: 'text-cyan-400',
      bar: 'bg-cyan-500',
    },
    purple: {
      border: 'border-purple-500/40',
      headerBg: 'bg-purple-950/40 border-purple-500/30',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      accent: 'text-purple-400',
      bar: 'bg-purple-500',
    },
    emerald: {
      border: 'border-emerald-500/40',
      headerBg: 'bg-emerald-950/40 border-emerald-500/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      accent: 'text-emerald-400',
      bar: 'bg-emerald-500',
    },
  }[themeColor];

  return (
    <div className={`flex flex-col h-[480px] rounded-xl border ${colorStyles.border} bg-slate-950/90 backdrop-blur-xl ${colorStyles.glow} overflow-hidden`}>
      {/* Terminal Titlebar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${colorStyles.headerBg}`}>
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 ${colorStyles.accent}`} />
          <span className="font-mono text-xs font-bold tracking-wider text-slate-100">{executableName}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
            ROOM {room}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">HP:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  playerHp > 50 ? 'bg-emerald-500' : playerHp > 25 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, (playerHp / maxPlayerHp) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-200">{playerHp}%</span>
          </div>

          {/* Frustration */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">FRUST:</span>
            <span className={`text-[10px] font-mono font-bold ${getFrustrationColor(frustration)}`}>
              {frustration}%
            </span>
          </div>

          {isFinished && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
              CLEARED
            </span>
          )}
        </div>
      </div>

      {/* Terminal Stream Body */}
      <div ref={scrollRef} className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-2 select-text custom-scrollbar">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 italic">
            Awaiting simulation event stream...
          </div>
        ) : (
          events.map((ev, i) => {
            const timeStr = ev.timestamp ? ev.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--';

            if (ev.event_type === 'AGENT_OBSERVATION') {
              return (
                <div key={i} className="text-slate-400 bg-slate-900/40 p-1.5 rounded border border-slate-800/60">
                  <span className="text-slate-500 text-[10px]">[{timeStr}]</span>{' '}
                  <span className="text-blue-400 font-semibold uppercase">OBSERVE:</span> {ev.observation}
                </div>
              );
            }

            if (ev.event_type === 'AGENT_DECISION') {
              return (
                <div key={i} className="text-cyan-200 bg-cyan-950/20 p-1.5 rounded border border-cyan-500/20">
                  <span className="text-slate-500 text-[10px]">[{timeStr}]</span>{' '}
                  <span className="text-cyan-400 font-semibold uppercase">DECISION:</span> {ev.decision_summary}
                </div>
              );
            }

            if (ev.event_type === 'TOOL_CALL') {
              return (
                <div key={i} className="text-amber-300 font-semibold pl-2 border-l-2 border-amber-500/60">
                  <span className="text-slate-500 text-[10px]">[{timeStr}]</span>{' '}
                  <span className="text-amber-400">TOOL:</span> <code className="bg-amber-950/50 px-1 py-0.5 rounded text-amber-200">{ev.tool}()</code>
                </div>
              );
            }

            if (ev.event_type === 'ACTION_RESULT') {
              const isSuccess = ev.tool_result?.success ?? true;
              return (
                <div
                  key={i}
                  className={`p-1.5 rounded border ${
                    isSuccess
                      ? 'bg-slate-900/80 border-slate-700/60 text-slate-200'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  <span className="text-slate-500 text-[10px]">[{timeStr}]</span>{' '}
                  <span className={isSuccess ? 'text-emerald-400' : 'text-red-400'}>
                    {isSuccess ? 'RESULT:' : 'FAILED:'}
                  </span>{' '}
                  {ev.tool_result?.message}
                  {ev.damage_taken ? (
                    <span className="ml-2 px-1 rounded bg-red-950 text-red-400 font-bold">-{ev.damage_taken} HP</span>
                  ) : null}
                  {ev.damage_dealt ? (
                    <span className="ml-2 px-1 rounded bg-cyan-950 text-cyan-300 font-bold">+{ev.damage_dealt} DMG</span>
                  ) : null}
                </div>
              );
            }

            if (ev.event_type === 'FRUSTRATION_UPDATE') {
              const delta = ev.frustration_delta ?? 0;
              return (
                <div key={i} className="text-[11px] text-yellow-300/90 pl-3 italic flex items-center gap-1">
                  <span>METRIC: Frustration {ev.frustration}% ({delta > 0 ? `+${delta}` : delta})</span>
                </div>
              );
            }

            if (ev.event_type === 'ANOMALY_DETECTED') {
              return (
                <div key={i} className="bg-red-950/50 border border-red-500/80 text-red-300 p-2 rounded flex items-start gap-2 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-200">ANOMALY DETECTED:</span> {ev.decision_summary}
                  </div>
                </div>
              );
            }

            if (ev.event_type === 'AGENT_FINISHED') {
              return (
                <div key={i} className="bg-emerald-950/60 border border-emerald-500 p-2 rounded text-emerald-300 font-bold text-center">
                  {'>>> AGENT PLAYTHROUGH CONCLUDED <<<'}
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
};
