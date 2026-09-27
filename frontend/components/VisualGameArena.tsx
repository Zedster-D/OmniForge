'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, Pause, RotateCcw, Shield, Heart, Zap, Flame, Award, Skull, Sparkles, User } from 'lucide-react';
import { AgentLiveState } from '../hooks/useTelemetry';

interface VisualGameArenaProps {
  casualState: AgentLiveState;
  speedrunnerState: AgentLiveState;
  explorerState: AgentLiveState;
  currentRoom: number;
  scenarioName?: string;
  onManualAction?: (action: string) => void;
}

interface EntityPos {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  label: string;
  color: string;
  icon: string;
  frustration: number;
  status: string;
}

export const VisualGameArena: React.FC<VisualGameArenaProps> = ({
  casualState,
  speedrunnerState,
  explorerState,
  currentRoom,
  scenarioName = "Assassin's Creed: Shadows of the Citadel",
}) => {
  const [selectedAgent, setSelectedAgent] = useState<'casual' | 'speedrunner' | 'explorer' | 'manual'>('casual');
  const [manualHp, setManualHp] = useState<number>(100);
  const [manualRoom, setManualRoom] = useState<number>(currentRoom || 1);
  const [manualFrust, setManualFrust] = useState<number>(0);
  const [manualInventory, setManualInventory] = useState<string[]>(['Smoke Bomb', 'Health Flask']);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [enemyHp, setEnemyHp] = useState<number>(60);
  const [actionEffect, setActionEffect] = useState<string | null>(null);

  // Sync manual room if external room changes
  useEffect(() => {
    if (currentRoom > 0) setManualRoom(currentRoom);
  }, [currentRoom]);

  // Trigger floating combat feedback
  const triggerFeedback = (text: string) => {
    setActionEffect(text);
    setTimeout(() => setActionEffect(null), 1200);
  };

  const handleManualAction = (action: string) => {
    let logMsg = '';
    if (action === 'attack') {
      const dmg = Math.floor(Math.random() * 25) + 15;
      const counterDmg = enemyHp > dmg ? (Math.floor(Math.random() * 18) + 8) : 0;
      setEnemyHp((prev) => Math.max(0, prev - dmg));
      setManualHp((prev) => Math.max(5, prev - counterDmg));
      if (counterDmg > 0) setManualFrust((prev) => Math.min(100, prev + 8));
      triggerFeedback(`⚔️ Hit Enemy for ${dmg} DMG! (-${counterDmg} HP)`);
      logMsg = `You executed Attack! Dealt ${dmg} DMG. Took ${counterDmg} counter damage.`;
    } else if (action === 'heal') {
      if (manualInventory.includes('Health Flask')) {
        setManualHp((prev) => Math.min(100, prev + 35));
        setManualFrust((prev) => Math.max(0, prev - 12));
        triggerFeedback('🧪 Consumed Health Flask (+35 HP)');
        logMsg = 'Used Health Flask: Restored 35 HP. Frustration reduced by 12%.';
      } else {
        triggerFeedback('⚠️ Out of Health Flasks!');
        logMsg = 'Failed to heal: No flasks in inventory.';
      }
    } else if (action === 'smoke') {
      triggerFeedback('💨 Smoke Bomb Deployed! (Evaded Detection)');
      setManualFrust((prev) => Math.max(0, prev - 5));
      logMsg = 'Threw Smoke Bomb: Enemies blinded for 1 turn.';
    } else if (action === 'bypass') {
      if (manualRoom === 4 || manualRoom === 6) {
        triggerFeedback('⚡ Parkour Bypass Activated! (Shortcut)');
        setManualRoom((prev) => Math.min(10, prev + 1));
        setEnemyHp(70);
        logMsg = `Used secret parkour bypass! Advanced directly to Sector ${manualRoom + 1}.`;
      } else {
        triggerFeedback('⚡ Vaulted obstacle (+10 Momentum)');
        logMsg = 'Executed Parkour Sprint.';
      }
    } else if (action === 'next_room') {
      if (enemyHp <= 0 || manualRoom < 10) {
        const nextR = Math.min(10, manualRoom + 1);
        setManualRoom(nextR);
        setEnemyHp(50 + nextR * 10);
        triggerFeedback(`🚪 Advanced to Sector ${nextR}!`);
        logMsg = `Cleared Sector ${manualRoom} -> Entered Sector ${nextR}.`;
      }
    }

    if (logMsg) {
      setCombatLog((prev) => [logMsg, ...prev.slice(0, 5)]);
    }
  };

  // Agent display data
  const currentAgentData =
    selectedAgent === 'casual'
      ? {
          name: 'Casual Assassin',
          hp: casualState.player_hp,
          maxHp: casualState.max_player_hp,
          frust: casualState.frustration,
          room: casualState.room,
          color: 'text-cyan-400 border-cyan-500',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
          desc: 'Plays cautiously, easily frustrated by sniper traps and overlapping detection cones.',
        }
      : selectedAgent === 'speedrunner'
      ? {
          name: 'Speedrunner AI',
          hp: speedrunnerState.player_hp,
          maxHp: speedrunnerState.max_player_hp,
          frust: speedrunnerState.frustration,
          room: speedrunnerState.room,
          color: 'text-purple-400 border-purple-500',
          badge: 'bg-purple-950 text-purple-300 border-purple-500/40',
          desc: 'Rushes rooftop ziplines and skips 80% of combat encounters using parkour glitches.',
        }
      : selectedAgent === 'explorer'
      ? {
          name: 'Animus Explorer',
          hp: explorerState.player_hp,
          maxHp: explorerState.max_player_hp,
          frust: explorerState.frustration,
          room: explorerState.room,
          color: 'text-emerald-400 border-emerald-500',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
          desc: 'Collects 100% of Animus fragments, tests all wall climbs, maps secret chambers.',
        }
      : {
          name: 'You (Manual Playtest Mode)',
          hp: manualHp,
          maxHp: 100,
          frust: manualFrust,
          room: manualRoom,
          color: 'text-amber-400 border-amber-500',
          badge: 'bg-amber-950 text-amber-300 border-amber-500/40',
          desc: 'Test the game mechanics yourself! Take actions below to feel the level balance.',
        };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Gamepad2 className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white tracking-wider">
                LIVE GAME ENGINE ARENA (2D SIMULATOR)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-700">
                SECTOR {currentAgentData.room} / 10
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">{scenarioName}</p>
          </div>
        </div>

        {/* Persona Camera Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 font-mono text-xs">
          <span className="text-[10px] text-slate-400 px-2">POV:</span>
          {(['casual', 'speedrunner', 'explorer', 'manual'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedAgent(mode)}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                selectedAgent === mode
                  ? mode === 'manual'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {mode === 'manual' ? '🎮 PLAY YOURSELF' : mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Canvas Dungeon Simulation Stage */}
      <div className="relative h-64 w-full rounded-xl bg-gradient-to-b from-slate-900/90 via-[#0a0d14] to-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 select-none">
        {/* Floating Action Effect Banner */}
        {actionEffect && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-bounce">
            {actionEffect}
          </div>
        )}

        {/* Sector Environment Backdrop */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ENVIRONMENT: {currentAgentData.room <= 3 ? 'Courtyard Outer Wall' : currentAgentData.room <= 6 ? 'Cathedral Rooftops (High Danger)' : 'Fortress Sanctum'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>HAZARDS: {currentAgentData.room >= 6 ? 'Crossbow Snipers (25m)' : 'Spike Pit'}</span>
            <span>LOOT: Animus Fragment [Available]</span>
          </div>
        </div>

        {/* Visual Arena Stage Layout */}
        <div className="flex-1 flex items-center justify-between px-6 py-2 relative">
          {/* Player / Bot Avatar */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${currentAgentData.color} bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all transform hover:scale-105`}>
                {selectedAgent === 'manual' ? (
                  <User className="w-7 h-7 text-amber-400" />
                ) : selectedAgent === 'casual' ? (
                  <Shield className="w-7 h-7 text-cyan-400" />
                ) : selectedAgent === 'speedrunner' ? (
                  <Zap className="w-7 h-7 text-purple-400" />
                ) : (
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                )}
              </div>
              {/* Frustration Floating Gauge */}
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-mono font-black text-amber-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-500" />
                {currentAgentData.frust}%
              </div>
            </div>
            <div className="text-center font-mono">
              <div className="text-xs font-bold text-white">{currentAgentData.name}</div>
              <div className="text-[10px] text-emerald-400 font-bold">{currentAgentData.hp} / {currentAgentData.maxHp} HP</div>
            </div>
          </div>

          {/* Center Hazard / Puzzle Zone */}
          <div className="flex flex-col items-center justify-center gap-2 text-center font-mono px-4">
            <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              {currentAgentData.room === 6 ? (
                <span className="text-red-400 font-bold">⚠️ CRITICAL FRICTION ZONE: Rooftop Snipers</span>
              ) : currentAgentData.room === 4 ? (
                <span className="text-purple-400 font-bold">⚡ SPEEDRUN BYPASS: Hay Bale Wall</span>
              ) : (
                <span className="text-slate-400">Patrol Route: 2 Guards</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-2xl animate-pulse">
              <span>🗡️</span>
              <span className="text-xs text-slate-500">══════►</span>
              <span>👹</span>
            </div>
          </div>

          {/* Enemy / Target Unit */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <Skull className="w-7 h-7 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-950 border border-red-500/60 text-[10px] font-mono font-bold text-red-400">
                LVL {currentAgentData.room}
              </div>
            </div>
            <div className="text-center font-mono">
              <div className="text-xs font-bold text-red-300">
                {currentAgentData.room === 6 ? 'Sniper Captain' : 'Citadel Guard'}
              </div>
              <div className="text-[10px] text-red-400 font-bold">{enemyHp > 0 ? `${enemyHp} HP` : 'DEFEATED'}</div>
            </div>
          </div>
        </div>

        {/* Active Persona Insight Bar */}
        <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">{currentAgentData.desc}</span>
          <span className={`px-2 py-0.5 rounded border ${currentAgentData.badge}`}>
            {selectedAgent === 'manual' ? 'INTERACTIVE MODE' : 'AUTONOMOUS AI STREAM'}
          </span>
        </div>
      </div>

      {/* Manual Interactive Control Bar (If User Wants to Play / Test) */}
      {selectedAgent === 'manual' && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              PLAYTEST CONTROLS (TEST GAME FRICTION DIRECTLY):
            </span>
            <span className="text-slate-400 text-[11px]">Click buttons to test game balance response</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleManualAction('attack')}
              className="px-3 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            >
              ⚔️ ATTACK
            </button>
            <button
              onClick={() => handleManualAction('heal')}
              className="px-3 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              🧪 HEAL (+35 HP)
            </button>
            <button
              onClick={() => handleManualAction('smoke')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              💨 SMOKE BOMB
            </button>
            <button
              onClick={() => handleManualAction('bypass')}
              className="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/60 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              ⚡ PARKOUR BYPASS
            </button>
          </div>

          {/* Combat Log */}
          {combatLog.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Playtest Log:</div>
              {combatLog.map((log, i) => (
                <div key={i} className="text-slate-300">
                  &gt; {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
