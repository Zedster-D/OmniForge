'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { PersonaRadarPoint, AgentMetrics } from '../lib/types';
import { Award, BarChart2 } from 'lucide-react';

interface PerformanceChartProps {
  radarData?: PersonaRadarPoint[];
  agentSummaries?: Record<string, AgentMetrics>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  radarData = [
    { subject: 'Speed', Casual: 30, Speedrunner: 98, Explorer: 40 },
    { subject: 'Survival', Casual: 88, Speedrunner: 65, Explorer: 75 },
    { subject: 'Exploration', Casual: 45, Speedrunner: 15, Explorer: 96 },
    { subject: 'Combat Aggr.', Casual: 35, Speedrunner: 92, Explorer: 60 },
    { subject: 'Efficiency', Casual: 50, Speedrunner: 95, Explorer: 65 },
    { subject: 'Patience', Casual: 30, Speedrunner: 85, Explorer: 95 },
  ],
  agentSummaries,
}) => {
  const barData = [
    {
      name: 'Actions',
      Casual: agentSummaries?.casual?.actions_taken || 24,
      Speedrunner: agentSummaries?.speedrunner?.actions_taken || 13,
      Explorer: agentSummaries?.explorer?.actions_taken || 38,
    },
    {
      name: 'Damage Taken',
      Casual: agentSummaries?.casual?.damage_taken || 92,
      Speedrunner: agentSummaries?.speedrunner?.damage_taken || 45,
      Explorer: agentSummaries?.explorer?.damage_taken || 58,
    },
    {
      name: 'Failures',
      Casual: agentSummaries?.casual?.failed_actions || 3,
      Speedrunner: agentSummaries?.speedrunner?.failed_actions || 1,
      Explorer: agentSummaries?.explorer?.failed_actions || 0,
    },
    {
      name: 'Loot Discovered',
      Casual: agentSummaries?.casual?.items_collected || 2,
      Speedrunner: agentSummaries?.speedrunner?.items_collected || 0,
      Explorer: agentSummaries?.explorer?.items_collected || 9,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Persona Behavioral Radar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Award className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            PERSONA ARCHETYPE RADAR COMPARISON
          </h3>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
              <Radar name="Casual" dataKey="Casual" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
              <Radar name="Speedrunner" dataKey="Speedrunner" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
              <Radar name="Explorer" dataKey="Explorer" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Combat & Navigation Metric Bars */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            CROSS-PERSONA METRIC BREAKDOWN
          </h3>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
              <Bar dataKey="Casual" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Speedrunner" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Explorer" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
