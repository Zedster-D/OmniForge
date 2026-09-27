'use client';

import React, { useState } from 'react';
import { RoomHeatmapData } from '../lib/types';
import { Flame, ShieldAlert, Skull, Crosshair, ChevronRight, CheckCircle2 } from 'lucide-react';

interface RoomHeatmapProps {
  heatmaps?: Record<string | number, RoomHeatmapData>;
  mostProblematicRoom?: number;
  currentRoom?: number;
}

const ROOM_NAMES: Record<number, { name: string; enemy: string; hazard: string }> = {
  1: { name: 'Entrance Vestibule', enemy: 'Goblin Scout', hazard: 'None' },
  2: { name: 'Submerged Armory', enemy: 'Cave Crawler', hazard: 'Spike Grid' },
  3: { name: 'Scriptorium', enemy: 'Skeleton Scribe', hazard: 'Poison Mold' },
  4: { name: 'Crypt of Shadows', enemy: 'Shadow Stalker', hazard: 'Dart Traps' },
  5: { name: 'Molten Crucible', enemy: 'Flame-Orc', hazard: 'Lava Eruption' },
  6: { name: 'Pestilence Chamber', enemy: 'Blight Fiend', hazard: 'Acidic Bile' },
  7: { name: 'Echoing Catacombs', enemy: 'Dungeon Stalker', hazard: 'Pitfall' },
  8: { name: 'Grand Colosseum', enemy: 'Dread Minotaur', hazard: 'Guillotine Blades' },
  9: { name: 'Sanctum of Void', enemy: 'Void Warden', hazard: 'Gravitational Rift' },
  10: { name: 'Abyssal Throne', enemy: 'Abyssal Sovereign', hazard: 'Flame Pillars' },
};

export const RoomHeatmap: React.FC<RoomHeatmapProps> = ({
  heatmaps,
  mostProblematicRoom = 6,
  currentRoom = 1,
}) => {
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
    casual_frustration: 0,
    speedrunner_friction: 0,
    explorer_friction: 0,
    explorer_actions: 0,
    damage_taken: 0,
    failures: 0,
    anomalies_count: 0,
    friction_score: 0,
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
            10-ROOM DUNGEON FRICTION HEATMAP &amp; LEVEL ANALYSIS
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          SELECT ROOM TO INSPECT EVIDENCE
        </span>
      </div>

      {/* 10-Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rNum) => {
          const data = heatmaps?.[rNum] || {
            room: rNum,
            casual_frustration: 0,
            speedrunner_friction: 0,
            explorer_friction: 0,
            damage_taken: 0,
            failures: 0,
            friction_score: 0,
          };
          const isProblem = rNum === mostProblematicRoom;
          const isCurrent = rNum === currentRoom;
          const isSelected = rNum === selectedRoom;
          const meta = ROOM_NAMES[rNum];

          return (
            <div
              key={rNum}
              onClick={() => setSelectedRoom(rNum)}
              className={`relative cursor-pointer rounded-xl border p-3 transition-all transform hover:scale-[1.03] ${
                getHeatmapColor(data.friction_score, isProblem)
              } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {/* Top Tags */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-100">
                  R{rNum}: {meta?.name?.split(' ')[0]}
                </span>
                {isProblem ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white animate-bounce">
                    HOTSPOT
                  </span>
                ) : isCurrent ? (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    ACTIVE
                  </span>
                ) : null}
              </div>

              {/* Friction Value */}
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-mono text-slate-400">Friction:</span>
                <span className="text-sm font-mono font-bold text-white">
                  {data.friction_score}%
                </span>
              </div>

              {/* Persona mini-meters */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
                  <span>Casual:</span>
                  <span>{data.casual_frustration}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.min(100, data.casual_frustration)}%` }}
                  />
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
            <span className="text-slate-400">Enemy: <b className="text-red-400">{ROOM_NAMES[selectedRoom]?.enemy}</b></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Hazard: <b className="text-amber-400">{ROOM_NAMES[selectedRoom]?.hazard}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Total Damage Dealt:</span>
            <span className="text-base font-bold text-red-400">{selectedData.damage_taken} HP</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Failed Agent Actions:</span>
            <span className="text-base font-bold text-amber-400">{selectedData.failures}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Anomalies Detected:</span>
            <span className="text-base font-bold text-purple-400">{selectedData.anomalies_count}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">Composite Friction:</span>
            <span className="text-base font-bold text-cyan-300">{selectedData.friction_score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
