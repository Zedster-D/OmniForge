'use client';

import React, { useState } from 'react';
import { TelemetryEvent } from '../lib/types';
import { Activity, Filter, AlertTriangle, CheckCircle, Flame, Eye } from 'lucide-react';
import { getSeverityBadge } from '../lib/utils';

interface EventFeedProps {
  events: TelemetryEvent[];
  onSelectEvent?: (event: TelemetryEvent) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({ events, onSelectEvent }) => {
  const [filter, setFilter] = useState<'ALL' | 'DECISIONS' | 'COMBAT' | 'ANOMALIES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((ev) => {
    if (filter === 'DECISIONS' && ev.event_type !== 'AGENT_DECISION') return false;
    if (filter === 'COMBAT' && ev.event_type !== 'ACTION_RESULT' && ev.event_type !== 'TOOL_CALL') return false;
    if (filter === 'ANOMALIES' && ev.event_type !== 'ANOMALY_DETECTED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSummary = ev.decision_summary?.toLowerCase().includes(q);
      const matchObs = ev.observation?.toLowerCase().includes(q);
      const matchTool = ev.tool?.toLowerCase().includes(q);
      const matchAgent = ev.agent_id?.toLowerCase().includes(q);
      if (!matchSummary && !matchObs && !matchTool && !matchAgent) return false;
    }

    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
            GLOBAL SWARM TELEMETRY &amp; EVIDENCE TRACE ({filteredEvents.length})
          </h3>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {(['ALL', 'DECISIONS', 'COMBAT', 'ANOMALIES'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 text-xs font-mono rounded font-semibold transition-all cursor-pointer ${
                filter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Filter by agent, room, tool, keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Scrollable Event List */}
      <div className="h-[340px] overflow-y-auto space-y-1.5 font-mono text-xs custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 italic">
            No telemetry events match current filter.
          </div>
        ) : (
          filteredEvents.slice().reverse().map((ev, i) => {
            const timeStr = ev.timestamp ? ev.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--';
            const agentBadgeColor = {
              casual: 'bg-cyan-950 text-cyan-400 border-cyan-500/40',
              speedrunner: 'bg-purple-950 text-purple-400 border-purple-500/40',
              explorer: 'bg-emerald-950 text-emerald-400 border-emerald-500/40',
              director: 'bg-amber-950 text-amber-400 border-amber-500/40',
            }[ev.agent_id || ''] || 'bg-slate-900 text-slate-400 border-slate-700';

            return (
              <div
                key={i}
                onClick={() => onSelectEvent?.(ev)}
                className={`p-2 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer flex items-start gap-2.5 ${
                  ev.event_type === 'ANOMALY_DETECTED' ? 'border-red-500/50 bg-red-950/20' : ''
                }`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">[{timeStr}]</span>

                {ev.agent_id && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${agentBadgeColor}`}>
                    {ev.agent_id}
                  </span>
                )}

                <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                  R{ev.room || 1}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="text-slate-200">
                    {ev.decision_summary || ev.observation || ev.tool_result?.message || `Event: ${ev.event_type}`}
                  </span>
                </div>

                {ev.damage_taken ? (
                  <span className="text-red-400 font-bold shrink-0">-{ev.damage_taken} HP</span>
                ) : null}

                {ev.anomaly && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${getSeverityBadge(ev.anomaly.severity)}`}>
                    {ev.anomaly.severity}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
