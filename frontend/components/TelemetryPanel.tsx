'use client';

import React from 'react';
import { JsonTree } from './JsonTree';
import { Shield, Swords, Package, Flame, Key, Compass, CheckCircle } from 'lucide-react';

interface TelemetryPanelProps {
  currentRoom: number;
  gameState: any;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ currentRoom, gameState }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
            LIVE DUNGEON STATE // ROOM {currentRoom}
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          WEBSOCKET ACTIVE
        </span>
      </div>

      {/* Visual State HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>PLAYER HEALTH</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">{gameState?.player_hp ?? 100}%</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span>ENEMY TARGET</span>
          </div>
          <span className="text-sm font-mono font-bold text-red-300 truncate block">
            {gameState?.enemy_type ? `${gameState.enemy_type} (${gameState.enemy_hp ?? 0} HP)` : 'None (Safe)'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>BYPASS ROUTE</span>
          </div>
          <span className={`text-sm font-mono font-bold ${gameState?.bypass_available ? 'text-emerald-400' : 'text-slate-500'}`}>
            {gameState?.bypass_available ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>ITEMS PRESENT</span>
          </div>
          <span className="text-sm font-mono font-bold text-purple-300">
            {gameState?.items?.length ? `${gameState.items.length} item(s)` : 'None'}
          </span>
        </div>
      </div>

      {/* Available Actions Badges */}
      <div>
        <span className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wide">
          Available Engine Actions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {gameState?.available_actions?.map((act: string) => (
            <span
              key={act}
              className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
            >
              {act}
            </span>
          )) || <span className="text-xs font-mono text-slate-500">None</span>}
        </div>
      </div>

      {/* Raw Engine JSON State Tree */}
      <JsonTree data={gameState} title="RAW GAME ENGINE STATE (Pydantic Model)" defaultOpen={false} />
    </div>
  );
};
