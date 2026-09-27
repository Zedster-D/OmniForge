'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Flame, AlertTriangle } from 'lucide-react';

interface FrustrationChartProps {
  data: Array<{
    room: number;
    Casual: number;
    Speedrunner: number;
    Explorer: number;
  }>;
}

export const FrustrationChart: React.FC<FrustrationChartProps> = ({ data }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            FRUSTRATION TIMELINE // ROOMS 1–10 (REAL-TIME TELEMETRY)
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Friction Spike Threshold (&gt;60%)</span>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="room"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(r) => `R${r}`}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#334155',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)',
              }}
              labelFormatter={(r) => `Dungeon Room ${r}`}
            />
            <Legend
              wrapperStyle={{
                fontFamily: 'monospace',
                fontSize: '11px',
                paddingTop: '8px',
              }}
            />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'CRITICAL FRICTION', fill: '#ef4444', fontSize: 10, position: 'top' }} />
            
            {/* Persona Lines */}
            <Line
              type="monotone"
              dataKey="Casual"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ fill: '#38bdf8', r: 3 }}
              activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Speedrunner"
              stroke="#a855f7"
              strokeWidth={2.5}
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 6, stroke: '#a855f7', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Explorer"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
