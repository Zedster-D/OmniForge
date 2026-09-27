import { RunDetailResponse } from './types';

// =========================================================================
// 1. ASSASSIN'S CREED: SHADOWS OF THE CITADEL (Seed 108)
// =========================================================================
export const ASSASSINS_CREED_BENCHMARK: RunDetailResponse = {
  run: {
    id: 'run-demo-assassins-creed',
    seed: 108,
    ai_mode: 'HYBRID_DETERMINISTIC',
    status: 'completed',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    completed_at: new Date(Date.now() - 900000).toISOString(),
    health_score: 64,
    summary: "Assassin's Creed Swarm QA: Critical stealth failure in Sector 6 (Cathedral Rooftops) due to 360° sniper detection cone. Casual player detected 8 times in 2 minutes."
  },
  metrics: {
    casual: {
      agent_id: 'casual',
      name: 'Casual Assassin (Stealth Focus)',
      rooms_completed: 10,
      completion_time_ms: 22400,
      actions_taken: 64,
      failed_actions: 11,
      damage_taken: 140,
      damage_dealt: 210,
      heals_used: 7,
      bypasses_used: 0,
      items_collected: 5,
      avg_frustration: 58.5,
      peak_frustration: 92,
      efficiency_score: 48.0,
      exploration_score: 65.0,
      is_victory: true
    },
    speedrunner: {
      agent_id: 'speedrunner',
      name: 'Speedrunner (Parkour Blitz)',
      rooms_completed: 10,
      completion_time_ms: 6100,
      actions_taken: 18,
      failed_actions: 1,
      damage_taken: 25,
      damage_dealt: 320,
      heals_used: 0,
      bypasses_used: 5,
      items_collected: 0,
      avg_frustration: 14.0,
      peak_frustration: 20,
      efficiency_score: 96.0,
      exploration_score: 10.0,
      is_victory: true
    },
    explorer: {
      agent_id: 'explorer',
      name: 'Explorer (Animus Completionist)',
      rooms_completed: 10,
      completion_time_ms: 31000,
      actions_taken: 88,
      failed_actions: 3,
      damage_taken: 50,
      damage_dealt: 260,
      heals_used: 2,
      bypasses_used: 0,
      items_collected: 24,
      avg_frustration: 20.0,
      peak_frustration: 35,
      efficiency_score: 62.0,
      exploration_score: 100.0,
      is_victory: true
    }
  },
  anomalies: [
    {
      id: 'ac-anom-1',
      run_id: 'run-demo-assassins-creed',
      agent_id: 'casual',
      room: 6,
      type: 'UNFAIR_STEALTH_DETECTION',
      severity: 'critical',
      description: 'Rooftop crossbow snipers in Sector 6 detect casual player through smoke bomb fog at 45m range.',
      evidence: { sector: 'Sector 6 - Cathedral Rooftops', detections: 8, smoke_bombs_wasted: 4 },
      timestamp: new Date(Date.now() - 1000000).toISOString()
    },
    {
      id: 'ac-anom-2',
      run_id: 'run-demo-assassins-creed',
      agent_id: 'speedrunner',
      room: 3,
      type: 'LEDGE_WARP_EXPLOIT',
      severity: 'high',
      description: 'Speedrunner animation-canceled hay-bale leap of faith to clip directly into the High Commander chamber.',
      evidence: { sector: 'Sector 3 - Fortress Gate', time_saved_sec: 45, skip_guard_count: 12 },
      timestamp: new Date(Date.now() - 1100000).toISOString()
    }
  ],
  report: {
    run_id: 'run-demo-assassins-creed',
    health_score: 64,
    executive_summary: "OmniForge QA Swarm audited 'Assassin's Creed: Shadows of the Citadel'. Pacing across early parkour sectors (1-4) is smooth, but Sector 6 introduces severe stealth friction: rooftop guard sightlines overlap without blindspots, causing casual players to abandon stealth for frantic combat.",
    common_issues: [
      'Sector 6 Crossbow Snipers have instantaneous 0.2s alert meters, making stealth approaches mathematically impossible for casual reaction speeds.',
      'Hay bale leap-of-faith collision in Sector 3 allows speedrunners to bypass 12 fortress guards.'
    ],
    persona_specific_issues: {
      casual: [
        'Detected 8 times in Sector 6; forced into 1v5 melee combat while equipped with low-defense assassin robes.',
        'Eagle Vision recharge cooldown is too long (30s) during high-density patrol zones.'
      ],
      speedrunner: [
        'Bypasses 90% of assassination targets by chain-sprinting on rooftop clotheslines without stamina penalty.'
      ],
      explorer: [
        'Synchronized all 5 viewpoints and collected 24 Animus fragments, but Sector 8 puzzle chest had an obscured climb ledge.'
      ]
    },
    systemic_issues: [
      'Stealth detection cones do not account for night-time lighting or shadow concealment.',
      'Parry window in counter-combat is 120ms (pro gamer threshold), punishing casual players.'
    ],
    recommendations: [
      {
        room: 6,
        severity: 'critical',
        actionable_fix: 'Reduce Sector 6 rooftop sniper sightline range from 45m to 25m and increase detection meter fill time from 0.2s to 1.5s.',
        confidence: 0.98,
        evidence: { sector: 6, casual_frustration: 92, detections: 8 }
      },
      {
        room: 3,
        severity: 'high',
        actionable_fix: 'Add invisible boundary wall to Sector 3 hay bale landing to patch wall-clip skip.',
        confidence: 0.94,
        evidence: { sector: 3, bypass_used: true }
      },
      {
        room: 6,
        severity: 'medium',
        actionable_fix: 'Widen melee parry window from 120ms to 250ms when encircled by 3+ guards.',
        confidence: 0.89,
        evidence: { failed_parries: 6 }
      }
    ],
    created_at: new Date(Date.now() - 900000).toISOString()
  },
  patch: {
    version: '1.2.0-assassins-patch',
    simulation_id: 'run-demo-assassins-creed',
    summary: "Stealth sightline nerfing, leap-of-faith collision fix, and Eagle Vision cooldown reduction for Assassin's Creed level.",
    health_score: 64,
    generated_at: new Date(Date.now() - 900000).toISOString(),
    changes: [
      {
        id: 'ac-patch-1',
        room: 6,
        category: 'tuning',
        severity: 'critical',
        affected_agents: ['casual', 'explorer'],
        issue: 'Rooftop crossbow sniper eagle-eye detection cone is overtuned.',
        evidence: { sector: 6, casual_peak_frust: 92 },
        recommendation: 'Reduce vision cone from 45m to 25m and add 1.5s grace period before alarm sounding.',
        confidence: 0.98
      },
      {
        id: 'ac-patch-2',
        room: 3,
        category: 'layout',
        severity: 'high',
        affected_agents: ['speedrunner'],
        issue: 'Hay bale physics allows animation cancel wall-clip.',
        evidence: { sector: 3, skip_time_ms: 45000 },
        recommendation: 'Clamp player velocity on hay bale exit to prevent gate bypass.',
        confidence: 0.94
      },
      {
        id: 'ac-patch-3',
        room: 5,
        category: 'mechanics',
        severity: 'medium',
        affected_agents: ['casual'],
        issue: 'Eagle Vision recharge of 30s leaves stealth players blind in courtyard.',
        evidence: { smoke_bombs_wasted: 7 },
        recommendation: 'Reduce Eagle Vision cooldown from 30s to 12s.',
        confidence: 0.91
      }
    ]
  },
  analytics: {
    avg_frustration: 30.8,
    peak_frustration: 92,
    total_actions: 170,
    total_failures: 15,
    total_damage_taken: 215,
    total_damage_dealt: 790,
    total_items_collected: 29,
    total_bypasses_used: 5,
    avg_rooms_cleared: 10,
    game_health_score: 64,
    most_problematic_room: 6,
    most_explored_room: 8,
    total_anomalies: 2,
    room_heatmaps: {
      1: { room: 1, casual_frustration: 8, speedrunner_friction: 4, explorer_friction: 5, explorer_actions: 7, damage_taken: 0, failures: 0, anomalies_count: 0, friction_score: 6 },
      2: { room: 2, casual_frustration: 14, speedrunner_friction: 6, explorer_friction: 8, explorer_actions: 8, damage_taken: 0, failures: 0, anomalies_count: 0, friction_score: 10 },
      3: { room: 3, casual_frustration: 22, speedrunner_friction: 2, explorer_friction: 12, explorer_actions: 10, damage_taken: 10, failures: 1, anomalies_count: 1, friction_score: 18 },
      4: { room: 4, casual_frustration: 35, speedrunner_friction: 8, explorer_friction: 18, explorer_actions: 12, damage_taken: 20, failures: 2, anomalies_count: 0, friction_score: 25 },
      5: { room: 5, casual_frustration: 45, speedrunner_friction: 12, explorer_friction: 22, explorer_actions: 14, damage_taken: 25, failures: 2, anomalies_count: 0, friction_score: 32 },
      6: { room: 6, casual_frustration: 92, speedrunner_friction: 20, explorer_friction: 35, explorer_actions: 18, damage_taken: 95, failures: 7, anomalies_count: 1, friction_score: 88 },
      7: { room: 7, casual_frustration: 50, speedrunner_friction: 14, explorer_friction: 28, explorer_actions: 13, damage_taken: 30, failures: 2, anomalies_count: 0, friction_score: 36 },
      8: { room: 8, casual_frustration: 38, speedrunner_friction: 10, explorer_friction: 25, explorer_actions: 12, damage_taken: 15, failures: 1, anomalies_count: 0, friction_score: 26 },
      9: { room: 9, casual_frustration: 30, speedrunner_friction: 8, explorer_friction: 18, explorer_actions: 9, damage_taken: 10, failures: 0, anomalies_count: 0, friction_score: 20 },
      10: { room: 10, casual_frustration: 25, speedrunner_friction: 6, explorer_friction: 12, explorer_actions: 8, damage_taken: 10, failures: 0, anomalies_count: 0, friction_score: 15 }
    },
    persona_radar: [
      { subject: 'Parkour Speed', Casual: 40, Speedrunner: 99, Explorer: 45 },
      { subject: 'Stealth Execution', Casual: 35, Speedrunner: 80, Explorer: 95 },
      { subject: 'Combat Survivability', Casual: 50, Speedrunner: 92, Explorer: 88 },
      { subject: 'Animus Discovery', Casual: 45, Speedrunner: 10, Explorer: 100 },
      { subject: 'Frustration Composure', Casual: 28, Speedrunner: 88, Explorer: 82 }
    ],
    agent_summaries: {
      casual: {
        agent_id: 'casual',
        name: 'Casual Assassin',
        rooms_completed: 10,
        completion_time_ms: 22400,
        actions_taken: 64,
        failed_actions: 11,
        damage_taken: 140,
        damage_dealt: 210,
        heals_used: 7,
        bypasses_used: 0,
        items_collected: 5,
        avg_frustration: 58.5,
        peak_frustration: 92,
        efficiency_score: 48.0,
        exploration_score: 65.0
      },
      speedrunner: {
        agent_id: 'speedrunner',
        name: 'Speedrunner',
        rooms_completed: 10,
        completion_time_ms: 6100,
        actions_taken: 18,
        failed_actions: 1,
        damage_taken: 25,
        damage_dealt: 320,
        heals_used: 0,
        bypasses_used: 5,
        items_collected: 0,
        avg_frustration: 14.0,
        peak_frustration: 20,
        efficiency_score: 96.0,
        exploration_score: 10.0
      },
      explorer: {
        agent_id: 'explorer',
        name: 'Animus Explorer',
        rooms_completed: 10,
        completion_time_ms: 31000,
        actions_taken: 88,
        failed_actions: 3,
        damage_taken: 50,
        damage_dealt: 260,
        heals_used: 2,
        bypasses_used: 0,
        items_collected: 24,
        avg_frustration: 20.0,
        peak_frustration: 35,
        efficiency_score: 62.0,
        exploration_score: 100.0
      }
    }
  },
  event_count: 50
};

// =========================================================================
// 2. GRAND THEFT AUTO: VICE CITY HEIST SWARM (Seed 777)
// =========================================================================
export const GTA_HEIST_BENCHMARK: RunDetailResponse = {
  run: {
    id: 'run-demo-gta-vice-heist',
    seed: 777,
    ai_mode: 'HYBRID_DETERMINISTIC',
    status: 'completed',
    created_at: new Date(Date.now() - 600000).toISOString(),
    completed_at: new Date(Date.now() - 300000).toISOString(),
    health_score: 72,
    summary: 'GTA VI Heist Swarm QA: Sector 6 (Freeway 4-Star Pursuit) has excessive SWAT roadblocks resulting in 3 casual getaway car flips and critical heat.'
  },
  metrics: {
    casual: {
      agent_id: 'casual',
      name: 'Casual Driver (Standard Getaway)',
      rooms_completed: 10,
      completion_time_ms: 19800,
      actions_taken: 55,
      failed_actions: 9,
      damage_taken: 185,
      damage_dealt: 340,
      heals_used: 6,
      bypasses_used: 0,
      items_collected: 6,
      avg_frustration: 52.0,
      peak_frustration: 89,
      efficiency_score: 55.0,
      exploration_score: 60.0,
      is_victory: true
    },
    speedrunner: {
      agent_id: 'speedrunner',
      name: 'Speedrunner (Nitro Highway Skips)',
      rooms_completed: 10,
      completion_time_ms: 5400,
      actions_taken: 14,
      failed_actions: 0,
      damage_taken: 30,
      damage_dealt: 420,
      heals_used: 0,
      bypasses_used: 6,
      items_collected: 1,
      avg_frustration: 10.0,
      peak_frustration: 18,
      efficiency_score: 98.0,
      exploration_score: 15.0,
      is_victory: true
    },
    explorer: {
      agent_id: 'explorer',
      name: 'Explorer (Hidden Weapon Stashes)',
      rooms_completed: 10,
      completion_time_ms: 28000,
      actions_taken: 76,
      failed_actions: 2,
      damage_taken: 65,
      damage_dealt: 390,
      heals_used: 3,
      bypasses_used: 0,
      items_collected: 32,
      avg_frustration: 18.0,
      peak_frustration: 32,
      efficiency_score: 68.0,
      exploration_score: 100.0,
      is_victory: true
    }
  },
  anomalies: [
    {
      id: 'gta-anom-1',
      run_id: 'run-demo-gta-vice-heist',
      agent_id: 'casual',
      room: 6,
      type: 'VEHICLE_PIT_LOCK',
      severity: 'high',
      description: 'SWAT armored Bearcats box in casual getaway car on Ocean Drive Freeway with 0m turning radius.',
      evidence: { sector: 'Sector 6 - Ocean Drive Freeway', vehicle_flips: 3, armor_loss: 100 },
      timestamp: new Date(Date.now() - 450000).toISOString()
    },
    {
      id: 'gta-anom-2',
      run_id: 'run-demo-gta-vice-heist',
      agent_id: 'speedrunner',
      room: 4,
      type: 'METRO_TUNNEL_BYPASS',
      severity: 'medium',
      description: 'Speedrunner used motorcycle to drive inside subway rail tunnel, avoiding 100% of 4-star police patrol spawns.',
      evidence: { sector: 'Sector 4 - Downtown Bank Vault', cops_evaded: 28, time_saved_sec: 75 },
      timestamp: new Date(Date.now() - 500000).toISOString()
    }
  ],
  report: {
    run_id: 'run-demo-gta-vice-heist',
    health_score: 72,
    executive_summary: "OmniForge QA Swarm simulated 'GTA: Vice City Heist Mission'. The Bank Infiltration and Safe Cracking phases demonstrate high player satisfaction. However, the Phase 6 Freeway Pursuit has an overly aggressive SWAT AI PIT maneuver that frequently spins out casual drivers.",
    common_issues: [
      'Freeway SWAT barricade spawns 4 armored vans simultaneously, blocking all 3 lanes without a ramp opening.',
      'Subway train tunnel in Sector 4 lacks barrier gates, enabling speedrunners to bypass the entire police chase.'
    ],
    persona_specific_issues: {
      casual: [
        'Spike strips on Freeway bridge are invisible at high speeds (>90mph) during night lighting.',
        'Body armor depletes in under 2 seconds when targeted by police helicopter mini-gun.'
      ],
      speedrunner: [
        'Uses nitro boost on motorcycle into subway tunnel to clear heist in 5.4 seconds simulation time.'
      ],
      explorer: [
        'Discovered all 32 hidden contraband packages and 4 secret supercars in alleyway garages.'
      ]
    },
    systemic_issues: [
      'Police helicopter spotlight blinding effect impairs driving controls by 40%.',
      'Vehicle repair Pay \'n\' Spray in Sector 7 is placed too far from the main pursuit route.'
    ],
    recommendations: [
      {
        room: 6,
        severity: 'high',
        actionable_fix: 'Add a billboard stunt ramp on the Sector 6 freeway barricade to provide an escape vector.',
        confidence: 0.96,
        evidence: { sector: 6, vehicle_wrecks: 3 }
      },
      {
        room: 4,
        severity: 'medium',
        actionable_fix: 'Install police subway blockade gates during 4-star wanted level.',
        confidence: 0.92,
        evidence: { sector: 4, subway_bypass: true }
      },
      {
        room: 6,
        severity: 'medium',
        actionable_fix: 'Reduce police chopper mini-gun accuracy from 85% to 50% on moving sports cars.',
        confidence: 0.89,
        evidence: { armor_dps: 50 }
      }
    ],
    created_at: new Date(Date.now() - 300000).toISOString()
  },
  patch: {
    version: '1.3.0-gta-heist-patch',
    simulation_id: 'run-demo-gta-vice-heist',
    summary: 'Highway pursuit balancing, helicopter accuracy nerf, and subway exploit patching for GTA Vice Heist.',
    health_score: 72,
    generated_at: new Date(Date.now() - 300000).toISOString(),
    changes: [
      {
        id: 'gta-patch-1',
        room: 6,
        category: 'tuning',
        severity: 'high',
        affected_agents: ['casual'],
        issue: 'SWAT Freeway roadblock completely walls all 3 traffic lanes.',
        evidence: { sector: 6, crashes: 3 },
        recommendation: 'Spawn a tilted construction flatbed ramp on the center lane for cinematic jump escape.',
        confidence: 0.96
      },
      {
        id: 'gta-patch-2',
        room: 6,
        category: 'tuning',
        severity: 'medium',
        affected_agents: ['casual', 'explorer'],
        issue: 'Helicopter sniper laser shreds armor before player reaches Pay \'n\' Spray.',
        evidence: { armor_loss: 185 },
        recommendation: 'Reduce helicopter mini-gun damage per bullet from 12 to 6.',
        confidence: 0.91
      },
      {
        id: 'gta-patch-3',
        room: 4,
        category: 'mechanics',
        severity: 'medium',
        affected_agents: ['speedrunner'],
        issue: 'Subway rail tracks allow complete evasion of wanted stars.',
        evidence: { sector: 4, police_skipped: 28 },
        recommendation: 'Spawn active train hazard inside subway when wanted level >= 3.',
        confidence: 0.88
      }
    ]
  },
  analytics: {
    avg_frustration: 26.6,
    peak_frustration: 89,
    total_actions: 145,
    total_failures: 11,
    total_damage_taken: 280,
    total_damage_dealt: 1150,
    total_items_collected: 39,
    total_bypasses_used: 6,
    avg_rooms_cleared: 10,
    game_health_score: 72,
    most_problematic_room: 6,
    most_explored_room: 5,
    total_anomalies: 2,
    room_heatmaps: {
      1: { room: 1, casual_frustration: 5, speedrunner_friction: 2, explorer_friction: 4, explorer_actions: 6, damage_taken: 0, failures: 0, anomalies_count: 0, friction_score: 4 },
      2: { room: 2, casual_frustration: 12, speedrunner_friction: 4, explorer_friction: 8, explorer_actions: 7, damage_taken: 5, failures: 0, anomalies_count: 0, friction_score: 8 },
      3: { room: 3, casual_frustration: 20, speedrunner_friction: 8, explorer_friction: 12, explorer_actions: 9, damage_taken: 15, failures: 1, anomalies_count: 0, friction_score: 15 },
      4: { room: 4, casual_frustration: 30, speedrunner_friction: 2, explorer_friction: 18, explorer_actions: 10, damage_taken: 20, failures: 1, anomalies_count: 1, friction_score: 22 },
      5: { room: 5, casual_frustration: 42, speedrunner_friction: 10, explorer_friction: 25, explorer_actions: 13, damage_taken: 35, failures: 2, anomalies_count: 0, friction_score: 30 },
      6: { room: 6, casual_frustration: 89, speedrunner_friction: 18, explorer_friction: 38, explorer_actions: 16, damage_taken: 110, failures: 5, anomalies_count: 1, friction_score: 82 },
      7: { room: 7, casual_frustration: 48, speedrunner_friction: 12, explorer_friction: 24, explorer_actions: 11, damage_taken: 45, failures: 1, anomalies_count: 0, friction_score: 34 },
      8: { room: 8, casual_frustration: 32, speedrunner_friction: 8, explorer_friction: 18, explorer_actions: 9, damage_taken: 25, failures: 1, anomalies_count: 0, friction_score: 22 },
      9: { room: 9, casual_frustration: 22, speedrunner_friction: 5, explorer_friction: 14, explorer_actions: 8, damage_taken: 15, failures: 0, anomalies_count: 0, friction_score: 16 },
      10: { room: 10, casual_frustration: 15, speedrunner_friction: 3, explorer_friction: 10, explorer_actions: 6, damage_taken: 10, failures: 0, anomalies_count: 0, friction_score: 10 }
    },
    persona_radar: [
      { subject: 'Driving Velocity', Casual: 50, Speedrunner: 100, Explorer: 45 },
      { subject: 'Heist Weaponry', Casual: 55, Speedrunner: 95, Explorer: 85 },
      { subject: 'Pursuit Survival', Casual: 42, Speedrunner: 90, Explorer: 88 },
      { subject: 'Stash Discovery', Casual: 40, Speedrunner: 12, Explorer: 100 },
      { subject: 'Heat Management', Casual: 30, Speedrunner: 92, Explorer: 84 }
    ],
    agent_summaries: {
      casual: {
        agent_id: 'casual',
        name: 'Casual Driver',
        rooms_completed: 10,
        completion_time_ms: 19800,
        actions_taken: 55,
        failed_actions: 9,
        damage_taken: 185,
        damage_dealt: 340,
        heals_used: 6,
        bypasses_used: 0,
        items_collected: 6,
        avg_frustration: 52.0,
        peak_frustration: 89,
        efficiency_score: 55.0,
        exploration_score: 60.0
      },
      speedrunner: {
        agent_id: 'speedrunner',
        name: 'Speedrun Driver',
        rooms_completed: 10,
        completion_time_ms: 5400,
        actions_taken: 14,
        failed_actions: 0,
        damage_taken: 30,
        damage_dealt: 420,
        heals_used: 0,
        bypasses_used: 6,
        items_collected: 1,
        avg_frustration: 10.0,
        peak_frustration: 18,
        efficiency_score: 98.0,
        exploration_score: 15.0
      },
      explorer: {
        agent_id: 'explorer',
        name: 'Contraband Explorer',
        rooms_completed: 10,
        completion_time_ms: 28000,
        actions_taken: 76,
        failed_actions: 2,
        damage_taken: 65,
        damage_dealt: 390,
        heals_used: 3,
        bypasses_used: 0,
        items_collected: 32,
        avg_frustration: 18.0,
        peak_frustration: 32,
        efficiency_score: 68.0,
        exploration_score: 100.0
      }
    }
  },
  event_count: 45
};

// Default export is the Assassin's Creed benchmark
export const FALLBACK_BENCHMARK_DATA = ASSASSINS_CREED_BENCHMARK;
