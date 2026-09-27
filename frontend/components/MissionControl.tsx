'use client';

import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useTelemetry } from '../hooks/useTelemetry';
import { SimulationControls } from './SimulationControls';
import { MetricCard } from './MetricCard';
import { AgentGrid } from './AgentGrid';
import { TelemetryPanel } from './TelemetryPanel';
import { FrustrationChart } from './FrustrationChart';
import { RoomHeatmap } from './RoomHeatmap';
import { PerformanceChart } from './PerformanceChart';
import { EventFeed } from './EventFeed';
import { DirectorReport } from './DirectorReport';
import { BalancePatchViewer } from './BalancePatchViewer';
import {
  ShieldAlert,
  Flame,
  Zap,
  Activity,
  Award,
  FileCode,
  Layers,
  Sparkles,
  History,
  Grid,
  Radio,
  GitBranch,
} from 'lucide-react';

export const MissionControl: React.FC = () => {
  const {
    activeRun,
    runsList,
    status,
    aiMode,
    seed,
    setSeed,
    speedMultiplier,
    setSpeedMultiplier,
    runDetails,
    loading,
    error,
    handleStart,
    handleStop,
    handleReplay,
    loadRunDetails,
  } = useSimulation();

  const {
    events,
    isConnected,
    anomalies,
    casualState,
    speedrunnerState,
    explorerState,
    currentRoom,
    activeGameState,
    frustrationTimeline,
    directorReport,
    balancePatch,
    isSimulationFinished,
  } = useTelemetry(activeRun?.id || null);

  const [activeTab, setActiveTab] = useState<'LIVE' | 'HEATMAP' | 'RADAR' | 'DIRECTOR' | 'HISTORY'>('LIVE');
  const [showDirectorModal, setShowDirectorModal] = useState(false);

  // Compute live KPI summaries
  const avgFrust = Math.round(
    (casualState.frustration + speedrunnerState.frustration + explorerState.frustration) / 3
  );
  const peakFrust = Math.max(casualState.frustration, speedrunnerState.frustration, explorerState.frustration);
  const totalFails = events.filter((e) => e.event_type === 'ACTION_RESULT' && !e.tool_result?.success).length;

  const currentReport = directorReport || runDetails?.report || null;
  const currentPatch = balancePatch || runDetails?.patch || null;
  const currentAnalytics = runDetails?.analytics;

  const gameHealth = currentReport?.health_score ?? Math.max(20, 100 - avgFrust * 0.4 - totalFails * 3 - anomalies.length * 4);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Cyber Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black tracking-wider text-white">
                  OMNIFORGE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  MISSION CONTROL v1.0
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Autonomous Multi-Agent Playtesting Swarm
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              <span className="text-slate-400">STATUS:</span>
              <span className="font-bold text-slate-200 uppercase">{status}</span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500 text-red-300 font-mono text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Simulation Command Controls */}
        <SimulationControls
          runId={activeRun?.id}
          seed={seed}
          onSeedChange={setSeed}
          aiMode={aiMode}
          status={status}
          speedMultiplier={speedMultiplier}
          onSpeedChange={setSpeedMultiplier}
          onStart={handleStart}
          onStop={handleStop}
          onReplay={() => handleReplay()}
          onOpenDirectorModal={() => setShowDirectorModal(true)}
          hasReport={!!currentReport}
          loading={loading}
        />

        {/* Mission KPI Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="GAME HEALTH SCORE"
            value={`${gameHealth}/100`}
            subValue="Heuristic"
            icon={Activity}
            color={gameHealth >= 80 ? 'emerald' : gameHealth >= 60 ? 'amber' : 'red'}
            isProblem={gameHealth < 60}
          />
          <MetricCard
            title="AVG FRUSTRATION"
            value={`${avgFrust}%`}
            subValue="Swarm Avg"
            icon={Flame}
            color={avgFrust > 50 ? 'amber' : 'cyan'}
          />
          <MetricCard
            title="PEAK FRUSTRATION"
            value={`${peakFrust}%`}
            subValue="Single Agent"
            icon={Flame}
            color={peakFrust >= 70 ? 'red' : 'purple'}
            isProblem={peakFrust >= 80}
          />
          <MetricCard
            title="PROBLEM ROOM"
            value={`ROOM ${currentAnalytics?.most_problematic_room || (currentRoom >= 6 ? 6 : 4)}`}
            subValue="High Friction"
            icon={ShieldAlert}
            color="red"
          />
          <MetricCard
            title="ANOMALIES FLAGGED"
            value={anomalies.length}
            subValue="Active Alerts"
            icon={Zap}
            color={anomalies.length > 0 ? 'purple' : 'emerald'}
          />
          <MetricCard
            title="TOTAL FAILURES"
            value={totalFails}
            subValue="Action Rejections"
            icon={ShieldAlert}
            color="cyan"
          />
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'LIVE'
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>LIVE SIMULATION SWARM</span>
          </button>

          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'HEATMAP'
                ? 'bg-red-500/20 border border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>10-ROOM HEATMAP &amp; TRACE</span>
          </button>

          <button
            onClick={() => setActiveTab('RADAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'RADAR'
                ? 'bg-purple-500/20 border border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>PERSONA RADAR &amp; METRICS</span>
          </button>

          <button
            onClick={() => setActiveTab('DIRECTOR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'DIRECTOR'
                ? 'bg-amber-500/20 border border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>DIRECTOR AUDIT &amp; PATCH</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>RUN HISTORY ({runsList.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Simulation */}
        {activeTab === 'LIVE' && (
          <div className="space-y-6">
            {/* 3 Live Agent Terminals */}
            <AgentGrid
              casualState={casualState}
              speedrunnerState={speedrunnerState}
              explorerState={explorerState}
            />

            {/* Bottom Row: Frustration Timeline Chart + Live Game State Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FrustrationChart data={frustrationTimeline} />
              <TelemetryPanel currentRoom={currentRoom} gameState={activeGameState} />
            </div>
          </div>
        )}

        {/* Tab 2: 10-Room Heatmap & Trace */}
        {activeTab === 'HEATMAP' && (
          <div className="space-y-6">
            <RoomHeatmap
              heatmaps={currentAnalytics?.room_heatmaps}
              mostProblematicRoom={currentAnalytics?.most_problematic_room || 6}
              currentRoom={currentRoom}
            />
            <EventFeed events={events} />
          </div>
        )}

        {/* Tab 3: Persona Radar & Metrics */}
        {activeTab === 'RADAR' && (
          <div className="space-y-6">
            <PerformanceChart
              radarData={currentAnalytics?.persona_radar}
              agentSummaries={runDetails?.metrics}
            />
            <RoomHeatmap
              heatmaps={currentAnalytics?.room_heatmaps}
              mostProblematicRoom={currentAnalytics?.most_problematic_room || 6}
              currentRoom={currentRoom}
            />
          </div>
        )}

        {/* Tab 4: Director Audit & Balance Patch */}
        {activeTab === 'DIRECTOR' && (
          <div className="space-y-6">
            {currentReport ? (
              <DirectorReport report={currentReport} patch={currentPatch} />
            ) : (
              <div className="p-12 text-center font-mono text-slate-500 rounded-xl border border-slate-800 bg-slate-950/80">
                Awaiting Director synthesis. Start the simulation to run all 3 personas and generate the QA audit.
              </div>
            )}
            <BalancePatchViewer patch={currentPatch} />
          </div>
        )}

        {/* Tab 5: Run History & Database Records */}
        {activeTab === 'HISTORY' && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 font-mono text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              HISTORICAL SIMULATION RUNS (PERSISTED IN SQLITE)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2">RUN ID</th>
                    <th className="p-2">SEED</th>
                    <th className="p-2">AI MODE</th>
                    <th className="p-2">STATUS</th>
                    <th className="p-2">HEALTH SCORE</th>
                    <th className="p-2">CREATED AT</th>
                    <th className="p-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {runsList.map((r) => (
                    <tr key={r.id} className="border-b border-slate-900 hover:bg-slate-900/50 transition">
                      <td className="p-2 font-bold text-cyan-300">{r.id}</td>
                      <td className="p-2 text-slate-300">{r.seed}</td>
                      <td className="p-2 text-slate-400">{r.ai_mode}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2 text-emerald-400 font-bold">{r.health_score || 100}/100</td>
                      <td className="p-2 text-slate-500">{r.created_at?.slice(0, 19)}</td>
                      <td className="p-2 text-right space-x-2">
                        <button
                          onClick={() => loadRunDetails(r.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 text-slate-200 cursor-pointer"
                        >
                          INSPECT
                        </button>
                        <button
                          onClick={() => handleReplay(r.id)}
                          className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/50 text-purple-300 cursor-pointer"
                        >
                          REPLAY
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Director QA Report Popover */}
        {showDirectorModal && currentReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="relative">
                <button
                  onClick={() => setShowDirectorModal(false)}
                  className="absolute top-4 right-4 z-10 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  ESC / CLOSE
                </button>
                <DirectorReport
                  report={currentReport}
                  patch={currentPatch}
                  onClose={() => setShowDirectorModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center font-mono text-xs text-slate-500">
        OmniForge Multi-Agent Game QA Swarm &copy; 2026 // Built with Next.js, FastAPI, SQLite, and WebSockets.
      </footer>
    </div>
  );
};
