'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Shield,
  Heart,
  Zap,
  Flame,
  Award,
  Skull,
  Sparkles,
  User,
  ChevronRight,
  ChevronLeft,
  Info,
  HelpCircle,
  Sword,
  Target,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AgentLiveState } from '../hooks/useTelemetry';

interface VisualGameArenaProps {
  casualState: AgentLiveState;
  speedrunnerState: AgentLiveState;
  explorerState: AgentLiveState;
  currentRoom: number;
  scenarioSeed?: number;
  scenarioName?: string;
  onGameChange?: (seed: number) => void;
  onManualAction?: (action: string) => void;
}

export const VisualGameArena: React.FC<VisualGameArenaProps> = ({
  casualState,
  speedrunnerState,
  explorerState,
  currentRoom = 1,
  scenarioSeed = 108,
  scenarioName = "Assassin's Creed: Shadows of the Citadel",
  onGameChange,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<'casual' | 'speedrunner' | 'explorer' | 'manual'>('casual');
  const [manualHp, setManualHp] = useState<number>(100);
  const [manualRoom, setManualRoom] = useState<number>(1);
  const [manualFrust, setManualFrust] = useState<number>(0);
  const [enemyHp, setEnemyHp] = useState<number>(40);
  const [actionEffect, setActionEffect] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [showDamageGuide, setShowDamageGuide] = useState<boolean>(true);
  const [inspectedLevel, setInspectedLevel] = useState<number>(1);

  // Determine game theme based on scenarioSeed
  const isGTA = scenarioSeed === 777;
  const isDungeon = scenarioSeed === 42;
  const isAC = !isGTA && !isDungeon;

  // 10-Level Catalogs per game with exact damage, hazard, and enemy values
  const LEVEL_CATALOG = isGTA
    ? [
        { level: 1, name: 'Safehouse Heist Briefing', enemy: 'Rival Gang Thug', hazard: 'CCTV Camera (Alarm)', loot: 'Body Armor (+35 HP)', enemyMaxHp: 40, enemyAtk: 12, hazardDmg: 15 },
        { level: 2, name: 'Armored Van Hijack', enemy: 'Securicar Guard', hazard: 'Radio Reinforcement', loot: 'Shotgun Shells', enemyMaxHp: 50, enemyAtk: 15, hazardDmg: 20 },
        { level: 3, name: 'Downtown Traffic Weave', enemy: '2-Star Patrol Car', hazard: 'Gridlock Crash', loot: 'Nitro Canister', enemyMaxHp: 65, enemyAtk: 20, hazardDmg: 25 },
        { level: 4, name: 'First National Bank Vault', enemy: 'Vault Security Lead', hazard: 'Laser Tripwire', loot: 'Bypass Keycard', enemyMaxHp: 80, enemyAtk: 25, hazardDmg: 30 },
        { level: 5, name: 'Ocean Drive Escape', enemy: '3-Star Interceptor', hazard: 'Chopper Spotlight', loot: 'Assault Rifle', enemyMaxHp: 95, enemyAtk: 30, hazardDmg: 35 },
        { level: 6, name: 'Freeway 4-Star Pursuit (Hotspot)', enemy: 'SWAT Armored Bearcat', hazard: 'Roadblock & Spike Strips', loot: 'Pay \'n\' Spray Pass', enemyMaxHp: 130, enemyAtk: 40, hazardDmg: 45 },
        { level: 7, name: 'Alleyway Pay \'n\' Spray', enemy: 'Undercover Cruiser', hazard: 'Heat Tracking Radar', loot: 'Vehicle Repair Kit', enemyMaxHp: 100, enemyAtk: 25, hazardDmg: 25 },
        { level: 8, name: 'Industrial Port Jump', enemy: 'Port Authority Guard', hazard: 'Stunt Ramp Water Gap', loot: 'Contraband Cache ($500k)', enemyMaxHp: 110, enemyAtk: 30, hazardDmg: 30 },
        { level: 9, name: 'Coastal Waterway Pursuit', enemy: 'Coast Guard Gunboat', hazard: 'Depth Mines', loot: 'Rocket Launcher', enemyMaxHp: 135, enemyAtk: 35, hazardDmg: 40 },
        { level: 10, name: 'Getaway Cargo Yacht (Final)', enemy: 'FIB Tactical Commander', hazard: 'Attack Chopper Missiles', loot: 'Heist Bounty ($10,000,000)', enemyMaxHp: 180, enemyAtk: 45, hazardDmg: 50 },
      ]
    : isAC
    ? [
        { level: 1, name: 'Venetian Harbor Canal', enemy: 'Port Sentry', hazard: 'Water Patrol Skiff', loot: 'Throwing Knives', enemyMaxHp: 40, enemyAtk: 12, hazardDmg: 15 },
        { level: 2, name: 'Rooftop Clotheslines', enemy: 'Crossbow Scout', hazard: 'Shaky Slate Tiles', loot: 'Animus Fragment #1', enemyMaxHp: 50, enemyAtk: 15, hazardDmg: 20 },
        { level: 3, name: 'Fortress Outer Gate', enemy: 'Gate Pikeman', hazard: 'Hay Bale Skip', loot: 'Smoke Bombs', enemyMaxHp: 60, enemyAtk: 18, hazardDmg: 22 },
        { level: 4, name: 'Courtyard Patrol', enemy: 'Elite Templar', hazard: 'Torchlight Cones', loot: 'Master Citadel Key', enemyMaxHp: 75, enemyAtk: 22, hazardDmg: 28 },
        { level: 5, name: 'Cathedral Cloister', enemy: 'Inquisitor Guard', hazard: 'Alarm Bells', loot: 'Health Flask (+35 HP)', enemyMaxHp: 90, enemyAtk: 28, hazardDmg: 32 },
        { level: 6, name: 'Cathedral Rooftops (Hotspot)', enemy: 'Sniper Captain', hazard: '45m Laser Sightline & Spikes', loot: 'Animus Fragment #2', enemyMaxHp: 120, enemyAtk: 38, hazardDmg: 45 },
        { level: 7, name: 'Animus Archive', enemy: 'Heavy Brute', hazard: 'Obscured Wall Ledge', loot: 'Ancient Codex Page', enemyMaxHp: 100, enemyAtk: 26, hazardDmg: 26 },
        { level: 8, name: 'Clocktower Spire', enemy: 'Steeple Guard', hazard: 'High Altitude Gale Winds', loot: 'Viewpoint Synchronization', enemyMaxHp: 110, enemyAtk: 30, hazardDmg: 30 },
        { level: 9, name: 'Inner Keep Balcony', enemy: 'Assassin Hunter', hazard: 'Poison Dart Trap', loot: 'Master Assassin Cloak', enemyMaxHp: 125, enemyAtk: 35, hazardDmg: 38 },
        { level: 10, name: 'Grand Templar Vault (Final)', enemy: 'Grand Master Rodrigo', hazard: 'Fire Cauldrons & Glyph Traps', loot: 'Piece of Eden Artifact', enemyMaxHp: 180, enemyAtk: 45, hazardDmg: 50 },
      ]
    : [
        { level: 1, name: 'Entrance Vestibule', enemy: 'Goblin Scout', hazard: 'None', loot: 'Torch', enemyMaxHp: 40, enemyAtk: 10, hazardDmg: 10 },
        { level: 2, name: 'Submerged Armory', enemy: 'Cave Crawler', hazard: 'Spike Grid', loot: 'Iron Greatsword', enemyMaxHp: 50, enemyAtk: 15, hazardDmg: 20 },
        { level: 3, name: 'Scriptorium', enemy: 'Skeleton Scribe', hazard: 'Poison Mold Spores', loot: 'Arcane Scroll', enemyMaxHp: 65, enemyAtk: 18, hazardDmg: 25 },
        { level: 4, name: 'Crypt of Shadows', enemy: 'Shadow Stalker', hazard: 'Dart Traps', loot: 'Health Potion (+35 HP)', enemyMaxHp: 75, enemyAtk: 22, hazardDmg: 30 },
        { level: 5, name: 'Molten Crucible', enemy: 'Flame-Orc', hazard: 'Lava Eruption', loot: 'Flame Ward Shield', enemyMaxHp: 90, enemyAtk: 28, hazardDmg: 35 },
        { level: 6, name: 'The Crucible (Hotspot)', enemy: 'Blight Fiend', hazard: 'Acidic Bile & Spikes', loot: 'Dungeon Master Key', enemyMaxHp: 120, enemyAtk: 38, hazardDmg: 45 },
        { level: 7, name: 'Echoing Catacombs', enemy: 'Dungeon Stalker', hazard: 'Pitfall Trap', loot: 'Golden Reliquary', enemyMaxHp: 105, enemyAtk: 25, hazardDmg: 28 },
        { level: 8, name: 'Grand Colosseum', enemy: 'Dread Minotaur', hazard: 'Guillotine Blades', loot: 'Gladiator Helmet', enemyMaxHp: 115, enemyAtk: 32, hazardDmg: 32 },
        { level: 9, name: 'Sanctum of Void', enemy: 'Void Warden', hazard: 'Gravitational Rift', loot: 'Void Star Crystal', enemyMaxHp: 130, enemyAtk: 36, hazardDmg: 40 },
        { level: 10, name: 'Abyssal Throne (Final)', enemy: 'Abyssal Sovereign Boss', hazard: 'Hellfire Pillars', loot: 'Crown of OmniForge', enemyMaxHp: 180, enemyAtk: 45, hazardDmg: 50 },
      ];

  const currentLevelIndex = Math.min(
    Math.max((selectedAgent === 'manual' ? manualRoom : currentRoom || inspectedLevel || 1) - 1, 0),
    9
  );
  const activeLevelData = LEVEL_CATALOG[currentLevelIndex];

  // Reset HP and enemy stats when scenario or room changes
  useEffect(() => {
    setEnemyHp(activeLevelData.enemyMaxHp);
  }, [manualRoom, scenarioSeed, currentLevelIndex]);

  const triggerFeedback = (text: string) => {
    setActionEffect(text);
    setTimeout(() => setActionEffect(null), 1600);
  };

  const handleManualAction = (actionType: string) => {
    let logMsg = '';
    const currentEnemy = activeLevelData.enemy;

    if (actionType === 'attack') {
      const dmg = Math.floor(Math.random() * 20) + 25; // 25-45 damage
      const counterDmg = enemyHp > dmg ? Math.floor(Math.random() * 12) + activeLevelData.enemyAtk : 0;
      const nextEnemyHp = Math.max(0, enemyHp - dmg);
      const nextPlayerHp = Math.max(0, manualHp - counterDmg);

      setEnemyHp(nextEnemyHp);
      setManualHp(nextPlayerHp);
      if (counterDmg > 0) {
        setManualFrust((prev) => Math.min(100, prev + 8));
      }

      const atkLabel = isGTA ? '🔫 Submachine Gun Attack' : isAC ? '⚔️ Hidden Blade Strike' : '⚔️ Heavy Sword Slash';
      triggerFeedback(`${atkLabel}: Dealt ${dmg} DMG! (Received -${counterDmg} HP Counter)`);
      logMsg = `💥 [ATTACK] You executed ${atkLabel} dealing ${dmg} DMG to ${currentEnemy} (Enemy HP: ${enemyHp} -> ${nextEnemyHp} HP). Received ${counterDmg} counter-attack damage (Your HP: ${manualHp} -> ${nextPlayerHp}/100 HP | Frustration: +8%).`;
    } else if (actionType === 'heal') {
      const healAmt = 35;
      const nextHp = Math.min(100, manualHp + healAmt);
      const prevHp = manualHp;
      setManualHp(nextHp);
      setManualFrust((prev) => Math.max(0, prev - 15));

      const healLabel = isGTA ? '🛡️ Body Armor / First Aid' : isAC ? '🧪 Consumed Health Flask' : '🧪 Drank Health Potion';
      triggerFeedback(`${healLabel} (+${healAmt} HP, -15% Frustration)`);
      logMsg = `💚 [HEAL] Used ${healLabel}: Restored +${healAmt} HP (Player HP: ${prevHp} -> ${nextHp}/100 HP). AI Frustration decreased by -15%.`;
    } else if (actionType === 'special') {
      const specLabel = isGTA ? '🚗 Nitro Turbo Evasion' : isAC ? '💨 Smoke Bomb Screen' : '🛡️ Aegis Shield Guard';
      setEnemyHp((prev) => Math.max(0, prev - 15));
      setManualFrust((prev) => Math.max(0, prev - 10));
      triggerFeedback(`${specLabel}: Dodged Hazard & Dealt 15 Stun DMG!`);
      logMsg = `✨ [SPECIAL] Activated ${specLabel}: Avoided ${activeLevelData.hazard} hazard damage and stunned ${currentEnemy} for 15 DMG.`;
    } else if (actionType === 'hazard_trigger') {
      const dmg = activeLevelData.hazardDmg;
      const nextHp = Math.max(0, manualHp - dmg);
      setManualHp(nextHp);
      setManualFrust((prev) => Math.min(100, prev + 15));
      triggerFeedback(`⚠️ Triggered ${activeLevelData.hazard}! (-${dmg} HP Taken)`);
      logMsg = `⚠️ [HAZARD DAMAGE] Triggered ${activeLevelData.hazard}: Inflicted -${dmg} direct HP loss! (Player HP: ${manualHp} -> ${nextHp}/100 HP | Frustration spiked +15%).`;
    } else if (actionType === 'bypass') {
      const bypLabel = isGTA ? '⚡ Subway Shortcut / Stunt Jump' : isAC ? '⚡ Parkour Ledge Vault' : '⚡ Secret Dungeon Switch';
      triggerFeedback(`${bypLabel}: Bypassed Hazard (+25 Speed Score)`);
      logMsg = `⚡ [BYPASS] Used ${bypLabel}: Skipped active encounter hazard in Sector ${currentLevelIndex + 1}: ${activeLevelData.name}.`;
    } else if (actionType === 'next_level') {
      if (manualRoom < 10) {
        const nextR = manualRoom + 1;
        setManualRoom(nextR);
        setInspectedLevel(nextR);
        triggerFeedback(`🚪 Advanced to Level ${nextR}: ${LEVEL_CATALOG[nextR - 1].name}`);
        logMsg = `🎉 [PROGRESSION] Cleared Level ${manualRoom} -> Entered Level ${nextR}: ${LEVEL_CATALOG[nextR - 1].name}.`;
      } else {
        triggerFeedback('🏆 CONGRATULATIONS! ALL 10 LEVELS CLEARED!');
        logMsg = '🏆 [VICTORY] You completed all 10 Sectors of the campaign!';
      }
    } else if (actionType === 'prev_level') {
      const prevR = Math.max(1, manualRoom - 1);
      setManualRoom(prevR);
      setInspectedLevel(prevR);
      logMsg = `⏪ [NAV] Returned to Level ${prevR}: ${LEVEL_CATALOG[prevR - 1].name}.`;
    } else if (actionType === 'reset') {
      setManualHp(100);
      setManualFrust(0);
      setEnemyHp(activeLevelData.enemyMaxHp);
      triggerFeedback('🔄 Reset Player HP to 100 & Frustration to 0%');
      logMsg = '🔄 [RESET] Reset Player HP to 100/100 and AI Frustration to 0%.';
    }

    if (logMsg) {
      setCombatLog((prev) => [logMsg, ...prev.slice(0, 5)]);
    }
  };

  const currentAgentData =
    selectedAgent === 'casual'
      ? {
          name: isGTA ? 'Casual Driver' : isAC ? 'Casual Assassin' : 'Casual Adventurer',
          hp: casualState.player_hp || 85,
          maxHp: 100,
          frust: casualState.frustration || (isAC ? 58 : isGTA ? 52 : 48),
          room: currentRoom || 1,
          color: 'text-cyan-400 border-cyan-500',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
          desc: isGTA
            ? 'Gets spun out by SWAT roadblocks. Frustration spikes on heavy vehicle damage.'
            : isAC
            ? 'Struggles with 45m sniper sightlines on rooftops. Panics when detected.'
            : 'Heals cautiously at 45% HP. Frustrated by untelegraphed boss attacks.',
        }
      : selectedAgent === 'speedrunner'
      ? {
          name: isGTA ? 'Speedrun Driver' : isAC ? 'Speedrun Assassin' : 'Speedrunner AI',
          hp: speedrunnerState.player_hp || 95,
          maxHp: 100,
          frust: speedrunnerState.frustration || (isAC ? 14 : isGTA ? 10 : 12),
          room: currentRoom || 1,
          color: 'text-purple-400 border-purple-500',
          badge: 'bg-purple-950 text-purple-300 border-purple-500/40',
          desc: isGTA
            ? 'Drives motorcycle through subway tunnel to evade all police wanted stars.'
            : isAC
            ? 'Animation-cancels leap of faith to skip 90% of citadel guard encounters.'
            : 'Rushes room exits with burst attacks, ignoring 100% of side loot.',
        }
      : selectedAgent === 'explorer'
      ? {
          name: isGTA ? 'Contraband Explorer' : isAC ? 'Animus Explorer' : 'Relic Explorer',
          hp: explorerState.player_hp || 90,
          maxHp: 100,
          frust: explorerState.frustration || 18,
          room: currentRoom || 1,
          color: 'text-emerald-400 border-emerald-500',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
          desc: isGTA
            ? 'Finds all 32 hidden contraband packages and secret getaway supercars.'
            : isAC
            ? 'Synchronizes all viewpoints and collects 100% of ancient Animus fragments.'
            : 'Inspects all puzzle mechanisms, secret doors, and hidden chests.',
        }
      : {
          name: 'You (Interactive Playtest Mode)',
          hp: manualHp,
          maxHp: 100,
          frust: manualFrust,
          room: manualRoom,
          color: 'text-amber-400 border-amber-500',
          badge: 'bg-amber-950 text-amber-300 border-amber-500/40',
          desc: 'Test the level difficulty, damage mechanics, and HP balance yourself!',
        };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      {/* 1. Quick Game Preset Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Gamepad2 className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-black text-white tracking-wider">
                {isGTA
                  ? 'GTA VI: VICE CITY HEIST PURSUIT'
                  : isAC
                  ? "ASSASSIN'S CREED: SHADOWS OF THE CITADEL"
                  : 'OMNIFORGE: 10-ROOM DUNGEON GAUNTLET'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                LEVEL {currentLevelIndex + 1} / 10
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">{scenarioName}</p>
          </div>
        </div>

        {/* Instant Game Select Buttons */}
        {onGameChange && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-xs">
            <span className="text-[10px] text-slate-400 px-1.5 font-bold">SELECT GAME:</span>
            <button
              onClick={() => onGameChange(108)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                isAC
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🗡️ Assassin&apos;s Creed
            </button>
            <button
              onClick={() => onGameChange(777)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                isGTA
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🚗 GTA VI Heist
            </button>
            <button
              onClick={() => onGameChange(42)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                isDungeon
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              ⚔️ Dungeon Gauntlet
            </button>
          </div>
        )}
      </div>

      {/* 2. Persona / Play Yourself Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <span className="text-[10px] text-slate-400 px-2 font-bold">MODE:</span>
          {(['casual', 'speedrunner', 'explorer', 'manual'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSelectedAgent(mode);
                if (mode === 'manual') {
                  setInspectedLevel(manualRoom);
                }
              }}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                selectedAgent === mode
                  ? mode === 'manual'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {mode === 'manual' ? '🎮 PLAY YOURSELF' : mode.toUpperCase() + ' STREAM'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>Active Sector:</span>
          <span className="text-cyan-300 font-bold">{activeLevelData.name}</span>
        </div>
      </div>

      {/* 3. 10-Level Visual Progression Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>SELECT ANY LEVEL (1–10) TO TEST OR INSPECT:</span>
          <span className="text-amber-400">Level 6 = Friction Hotspot</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-mono text-[11px]">
          {LEVEL_CATALOG.map((lvl) => {
            const isActive = lvl.level === currentLevelIndex + 1;
            const isHotspot = lvl.level === 6;
            return (
              <button
                key={lvl.level}
                onClick={() => {
                  setInspectedLevel(lvl.level);
                  if (selectedAgent === 'manual') {
                    setManualRoom(lvl.level);
                  }
                  triggerFeedback(`📍 Switched to Level ${lvl.level}: ${lvl.name}`);
                }}
                className={`py-2 px-1 rounded border text-center transition-all cursor-pointer transform hover:scale-[1.03] ${
                  isActive
                    ? 'bg-cyan-500/30 border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
                    : isHotspot
                    ? 'bg-red-950/40 border-red-500/70 text-red-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">LVL {lvl.level}</div>
                <div className="truncate text-[9px] mt-0.5">
                  {isHotspot ? '🔥 HOTSPOT' : lvl.name.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 2D Canvas Visual Stage */}
      <div className="relative h-64 w-full rounded-xl bg-gradient-to-b from-slate-900 via-[#080b12] to-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 select-none">
        {/* Floating Action Feedback */}
        {actionEffect && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-cyan-950/95 border border-cyan-400 text-cyan-200 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.7)] animate-bounce">
            {actionEffect}
          </div>
        )}

        {/* Top Stage Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-cyan-300 font-bold">
              SECTOR {currentLevelIndex + 1}: {activeLevelData.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-red-400 font-bold">HAZARD: {activeLevelData.hazard} (-{activeLevelData.hazardDmg} HP)</span>
            <span className="text-amber-400">LOOT: {activeLevelData.loot}</span>
          </div>
        </div>

        {/* Arena Stage Sprites */}
        <div className="flex-1 flex items-center justify-between px-6 py-2 relative">
          {/* Player Unit */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${currentAgentData.color} bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform hover:scale-105`}
              >
                {selectedAgent === 'manual' ? (
                  <User className="w-8 h-8 text-amber-400" />
                ) : selectedAgent === 'casual' ? (
                  <Shield className="w-8 h-8 text-cyan-400" />
                ) : selectedAgent === 'speedrunner' ? (
                  <Zap className="w-8 h-8 text-purple-400" />
                ) : (
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-mono font-black text-amber-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-500" />
                {currentAgentData.frust}%
              </div>
            </div>
            <div className="text-center font-mono">
              <div className="text-xs font-bold text-white">{currentAgentData.name}</div>
              <div className="text-[11px] text-emerald-400 font-bold">
                {currentAgentData.hp} / {currentAgentData.maxHp} HP
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all ${
                    currentAgentData.hp > 50 ? 'bg-emerald-400' : currentAgentData.hp > 25 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentAgentData.hp / currentAgentData.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Hazard / Encounter Animation */}
          <div className="flex flex-col items-center justify-center gap-2 text-center font-mono px-4">
            <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              {currentLevelIndex === 5 ? (
                <span className="text-red-400 font-bold animate-pulse">
                  🔥 HOTSPOT: 85% Frustration Spike &amp; Double Hazard Damage
                </span>
              ) : currentLevelIndex === 3 ? (
                <span className="text-purple-400 font-bold">⚡ SPEEDRUN BYPASS AVAILABLE</span>
              ) : (
                <span className="text-slate-400">Sector Encounter Zone</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-3xl">
              <span>{isGTA ? '🏎️' : isAC ? '🗡️' : '⚔️'}</span>
              <span className="text-xs text-slate-500 animate-pulse">══════►</span>
              <span>{isGTA ? '🚔' : isAC ? '🏹' : '👹'}</span>
            </div>
          </div>

          {/* Enemy Unit */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                <Skull className="w-8 h-8 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-950 border border-red-500/60 text-[10px] font-mono font-bold text-red-400">
                LVL {currentLevelIndex + 1}
              </div>
            </div>
            <div className="text-center font-mono">
              <div className="text-xs font-bold text-red-300">{activeLevelData.enemy}</div>
              <div className="text-[11px] text-red-400 font-bold">
                {enemyHp > 0 ? `${enemyHp} / ${activeLevelData.enemyMaxHp} HP` : 'DEFEATED'}
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(100, (enemyHp / activeLevelData.enemyMaxHp) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 truncate max-w-md">{currentAgentData.desc}</span>
          <span className={`px-2 py-0.5 rounded border ${currentAgentData.badge}`}>
            {selectedAgent === 'manual' ? 'INTERACTIVE PLAYTEST' : 'AUTONOMOUS AI STREAM'}
          </span>
        </div>
      </div>

      {/* 5. Clear Damage, HP & Frustration Calculation Guide */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            HOW DAMAGE, HP LOSS &amp; FRUSTRATION ARE CALCULATED:
          </span>
          <button
            onClick={() => setShowDamageGuide(!showDamageGuide)}
            className="text-slate-400 hover:text-white underline cursor-pointer text-[11px]"
          >
            {showDamageGuide ? 'Hide Mechanics' : 'Show Mechanics'}
          </button>
        </div>

        {showDamageGuide && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] text-slate-300">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Sword className="w-3.5 h-3.5" /> 1. Combat Damage:
              </span>
              <p className="text-slate-400">
                Your attacks deal <strong>25–45 DMG</strong>. Enemies retaliate dealing <strong>{activeLevelData.enemyAtk}–{activeLevelData.enemyAtk + 12} HP</strong> damage.
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> 2. Sector Hazards:
              </span>
              <p className="text-slate-400">
                Failing a stealth/escape check or tripping traps inflicts <strong>-{activeLevelData.hazardDmg} HP</strong> direct damage.
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> 3. HP Recovery:
              </span>
              <p className="text-slate-400">
                Using Medkit / Health Flask restores <strong>+35 HP</strong> (capped at 100 HP) and reduces frustration by <strong>-15%</strong>.
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 4. AI Frustration:
              </span>
              <p className="text-slate-400">
                +15% on Critical HP (&lt;25%), +10% on action fail, +8% on damage received. Clearing rooms grants -10%.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 6. Manual Interactive Playtest Controls (Level 1–10 Progression + Combat Actions) */}
      {selectedAgent === 'manual' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 border border-amber-500/50 space-y-3 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              PLAYTEST CONTROLS — LEVEL {manualRoom} ({activeLevelData.name}):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleManualAction('prev_level')}
                disabled={manualRoom <= 1}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev Level
              </button>
              <button
                onClick={() => handleManualAction('next_level')}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer flex items-center gap-1 text-[11px] shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              >
                Next Level <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleManualAction('reset')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
                title="Reset HP and stats"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleManualAction('attack')}
              className="px-3 py-2.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            >
              {isGTA ? '🔫 SHOOT WEAPON' : isAC ? '⚔️ ASSASSINATE' : '⚔️ ATTACK'}
            </button>
            <button
              onClick={() => handleManualAction('heal')}
              className="px-3 py-2.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              {isGTA ? '🛡️ USE BODY ARMOR' : isAC ? '🧪 HEALTH FLASK (+35)' : '🧪 HEALTH POTION'}
            </button>
            <button
              onClick={() => handleManualAction('special')}
              className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isGTA ? '🚗 NITRO BOOST' : isAC ? '💨 SMOKE BOMB' : '🛡️ SHIELD BLOCK'}
            </button>
            <button
              onClick={() => handleManualAction('hazard_trigger')}
              className="px-3 py-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/60 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              ⚠️ TRIGGER HAZARD
            </button>
            <button
              onClick={() => handleManualAction('bypass')}
              className="px-3 py-2.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/60 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1"
            >
              {isGTA ? '⚡ SUBWAY SHORTCUT' : isAC ? '⚡ PARKOUR VAULT' : '⚡ LEVER BYPASS'}
            </button>
          </div>

          {/* Real-Time Detailed Combat Math Log */}
          {combatLog.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Real-Time Playtest Telemetry &amp; Damage Log:
              </div>
              {combatLog.map((log, i) => (
                <div key={i} className="text-slate-300 border-l-2 border-amber-500/60 pl-2">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
