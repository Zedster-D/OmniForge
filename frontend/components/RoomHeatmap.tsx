'use client';

import React, { useState } from 'react';
import { RoomHeatmapData } from '../lib/types';
import { Flame, ShieldAlert, Skull, Crosshair, ChevronRight, CheckCircle2, Gamepad2, Info } from 'lucide-react';

interface RoomHeatmapProps {
  heatmaps?: Record<string | number, RoomHeatmapData>;
  mostProblematicRoom?: number;
  currentRoom?: number;
  scenarioSeed?: number;
  onGameChange?: (seed: number) => void;
}

const AC_ROOM_NAMES: Record<number, { name: string; enemy: string; hazard: string; type: string }> = {
  1: { name: 'Venetian Harbor Canal', enemy: 'Port Sentry', hazard: 'Water Patrol Skiff', type: 'Stealth Entry' },
  2: { name: 'Rooftop Clotheslines', enemy: 'Crossbow Scout', hazard: 'Shaky Slate Tiles', type: 'Parkour Navigation' },
  3: { name: 'Fortress Outer Gate', enemy: 'Gate Pikeman', hazard: 'Hay Bale Leap Skip', type: 'Bypass Sector' },
  4: { name: 'Courtyard Patrol', enemy: 'Elite Templar', hazard: 'Torchlight Cones', type: 'Infiltration' },
  5: { name: 'Cathedral Cloister', enemy: 'Inquisitor Guard', hazard: 'Alarm Bells', type: 'Combat & Stealth' },
  6: { name: 'Cathedral Rooftops (Hotspot)', enemy: 'Sniper Captain', hazard: '45m Laser Sightline & Spikes', type: 'Severe Friction Spike' },
  7: { name: 'Animus Archive', enemy: 'Heavy Brute', hazard: 'Obscured Wall Ledge', type: 'Lore Discovery' },
  8: { name: 'Clocktower Spire', enemy: 'Steeple Guard', hazard: 'High Altitude Gale Winds', type: 'Viewpoint Sync' },
  9: { name: 'Inner Keep Balcony', enemy: 'Assassin Hunter', hazard: 'Poison Dart Trap', type: 'Boss Preparation' },
  10: { name: 'Grand Templar Vault', enemy: 'Grand Master Rodrigo', hazard: 'Fire Cauldrons & Glyph Traps', type: 'Final Confrontation' },
};

const GTA_ROOM_NAMES: Record<number, { name: string; enemy: string; hazard: string; type: string }> = {
  1: { name: 'Safehouse Heist Briefing', enemy: 'Rival Gang Thug', hazard: 'CCTV Camera (Alarm)', type: 'Mission Setup' },
  2: { name: 'Armored Van Hijack', enemy: 'Securicar Guard', hazard: 'Radio Reinforcement', type: 'Heavy Combat' },
  3: { name: 'Downtown Traffic Weave', enemy: '2-Star Patrol Car', hazard: 'Gridlock Crash', type: 'High Speed Driving' },
  4: { name: 'First National Bank Vault', enemy: 'Vault Security Lead', hazard: 'Laser Tripwire', type: 'Infiltration & Safe Drill' },
  5: { name: 'Ocean Drive Escape', enemy: '3-Star Interceptor', hazard: 'Chopper Spotlight', type: 'Pursuit Evasion' },
  6: { name: 'Freeway 4-Star Pursuit (Hotspot)', enemy: 'SWAT Armored Bearcat', hazard: 'Roadblock & Spike Strips', type: 'Severe Friction Spike' },
  7: { name: 'Alleyway Pay \'n\' Spray', enemy: 'Undercover Cruiser', hazard: 'Heat Tracking Radar', type: 'Wanted Level Cooldown' },
  8: { name: 'Industrial Port Jump', enemy: 'Port Authority Guard', hazard: 'Stunt Ramp Water Gap', type: 'Stunt Bypass' },
  9: { name: 'Coastal Waterway Pursuit', enemy: 'Coast Guard Gunboat', hazard: 'Depth Mines', type: 'Naval Escape' },
  10: { name: 'Getaway Cargo Yacht', enemy: 'FIB Tactical Commander', hazard: 'Attack Chopper Missiles', type: 'Final Heist Escape' },
};

const DUNGEON_ROOM_NAMES: Record<number, { name: string; enemy: string; hazard: string; type: string }> = {
  1: { name: 'Entrance Vestibule', enemy: 'Goblin Scout', hazard: 'None', type: 'Tutorial Encounter' },
  2: { name: 'Submerged Armory', enemy: 'Cave Crawler', hazard: 'Spike Grid', type: 'Hazard Gauntlet' },
  3: { name: 'Scriptorium', enemy: 'Skeleton Scribe', hazard: 'Poison Mold Spores', type: 'Lore Room' },
  4: { name: 'Crypt of Shadows', enemy: 'Shadow Stalker', hazard: 'Dart Traps', type: 'Combat Encounter' },
  5: { name: 'Molten Crucible', enemy: 'Flame-Orc', hazard: 'Lava Eruption', type: 'Environmental Hazard' },
  6: { name: 'The Crucible (Hotspot)', enemy: 'Blight Fiend', hazard: 'Acidic Bile & Spikes', type: 'Severe Friction Spike' },
  7: { name: 'Echoing Catacombs', enemy: 'Dungeon Stalker', hazard: 'Pitfall Trap', type: 'Puzzle Sector' },
  8: { name: 'Grand Colosseum', enemy: 'Dread Minotaur', hazard: 'Guillotine Blades', type: 'Mini-Boss Arena' },
  9: { name: 'Sanctum of Void', enemy: 'Void Warden', hazard: 'Gravitational Rift', type: 'Resource Check' },
  10: { name: 'Abyssal Throne', enemy: 'Abyssal Sovereign Boss', hazard: 'Hellfire Pillars', type: 'Final Boss' },
};

export const RoomHeatmap: React.FC<RoomHeatmapProps> = ({
  heatmaps,
  mostProblematicRoom = 6,
  currentRoom = 1,
  scenarioSeed = 108,
  onGameChange,
}) => {
  const isGTA = scenarioSeed === 777;
  const isDungeon = scenarioSeed === 42;
  const isAC = !isGTA && !isDungeon;

  const ROOM_NAMES = isGTA ? GTA_ROOM_NAMES : isDungeon ? DUNGEON_ROOM_NAMES : AC_ROOM_NAMES;
  const [selectedRoom, setSelectedRoom] = useState<number>(mostProblematicRoom);

  const getHeatmapColor = (score: number, isProblem: boolean) => {
    if (isProblem) return 'border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse';
    if (score >= 60) return 'border-orange-500/70 bg-orange-950/30';
    if (score >= 35) return 'border-yellow-500/50 bg-yellow-950/20';
    if (score >= 15) return 'border-cyan-500/40 bg-cyan-950/20';
    return 'border-slate-800 bg-slate-900/40';
  };

  const selectedData = heatmaps?.[selectedRoom] || {
    room: selectedRoom,
    casual_frustration: selectedRoom === 6 ? 89 : 25,
    speedrunner_friction: selectedRoom === 6 ? 18 : 5,
    explorer_friction: 12,
    explorer_actions: 8,
    damage_taken: selectedRoom === 6 ? 110 : 35,
    failures: selectedRoom === 6 ? 5 : 1,
    anomalies_count: selectedRoom === 6 ? 1 : 0,
    friction_score: selectedRoom === 6 ? 82 : 20,
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-xl space-y-4">
      {/* Dynamic Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
            {isGTA
              ? 'GTA VI: 10-STAGE VICE CITY HEIST HEATMAP & POLICE ESCALATION TRACE'
              : isAC
              ? "ASSASSIN'S CREED: 10-SECTOR CITADEL INFILTRATION HEATMAP & LEVEL ANALYSIS"
              : 'DUNGEON GAUNTLET: 10-ROOM FRICTION HEATMAP & LEVEL ANALYSIS'}
          </h3>
        </div>

        {/* Quick Game Preset Selector */}
        {onGameChange && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-bold">GAME:</span>
            <button
              onClick={() => onGameChange(108)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                isAC ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assassin&apos;s Creed
            </button>
            <button
              onClick={() => onGameChange(777)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                isGTA ? 'bg-purple-500/30 text-purple-300 border border-purple-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              GTA VI Heist
            </button>
            <button
              onClick={() => onGameChange(42)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                isDungeon ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dungeon
            </button>
          </div>
        )}
      </div>

      {/* 10-Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rNum) => {
          const isProblem = rNum === mostProblematicRoom;
          const isCurrent = rNum === currentRoom;
          const isSelected = rNum === selectedRoom;
          const meta = ROOM_NAMES[rNum];

          const data = heatmaps?.[rNum] || {
            room: rNum,
            casual_frustration: rNum === 6 ? 89 : rNum === 7 ? 48 : rNum * 5,
            speedrunner_friction: rNum === 6 ? 18 : 4,
            explorer_friction: 10,
            damage_taken: rNum === 6 ? 110 : 30,
            failures: rNum === 6 ? 5 : 1,
            friction_score: rNum === 6 ? 82 : rNum * 4,
          };

          return (
            <div
              key={rNum}
              onClick={() => setSelectedRoom(rNum)}
              className={`relative cursor-pointer rounded-xl border p-3 transition-all transform hover:scale-[1.03] ${getHeatmapColor(
                data.friction_score,
                isProblem
              )} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {/* Top Tags */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-100 truncate pr-1">
                  R{rNum}: {meta?.name?.split(' ')[0]}
                </span>
                {isProblem ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white animate-bounce shrink-0">
                    HOTSPOT
                  </span>
                ) : isCurrent ? (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 shrink-0">
                    ACTIVE
                  </span>
                ) : null}
              </div>

              {/* Friction Value */}
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-mono text-slate-400">Friction:</span>
                <span className="text-sm font-mono font-bold text-white">{data.friction_score}%</span>
              </div>

              {/* Persona mini-meters */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
                  <span>Casual:</span>
                  <span>{data.casual_frustration}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, data.casual_frustration)}%` }} />
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-purple-400">
                  <span>Speedrun:</span>
                  <span>{data.speedrunner_friction}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400"
                    style={{ width: `${Math.min(100, data.speedrunner_friction)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Room Deep Spotlight Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200 uppercase">
              ROOM {selectedRoom} SPOTLIGHT: {ROOM_NAMES[selectedRoom]?.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">
              Enemy: <b className="text-red-400">{ROOM_NAMES[selectedRoom]?.enemy}</b>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Hazard: <b className="text-amber-400">{ROOM_NAMES[selectedRoom]?.hazard}</b>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Type: <b className="text-cyan-300">{ROOM_NAMES[selectedRoom]?.type}</b>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Total Damage Dealt:</span>
            <span className="text-base font-bold text-red-400">{selectedData.damage_taken} HP</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Failed Agent Actions:</span>
            <span className="text-base font-bold text-amber-400">{selectedData.failures}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Anomalies Detected:</span>
            <span className="text-base font-bold text-purple-400">{selectedData.anomalies_count}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Composite Friction:</span>
            <span className="text-base font-bold text-cyan-300">{selectedData.friction_score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
