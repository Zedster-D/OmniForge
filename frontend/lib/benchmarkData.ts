import { RunDetailResponse } from './types';

export const FALLBACK_BENCHMARK_DATA: RunDetailResponse = {
  run: {
    id: 'run-demo-benchmark-01',
    seed: 42,
    ai_mode: 'HYBRID_DETERMINISTIC',
    status: 'completed',
    created_at: new Date(Date.now() - 900000).toISOString(),
    completed_at: new Date(Date.now() - 600000).toISOString(),
    health_score: 68,
    summary: 'High friction identified in Room 6 (The Crucible). Casual player reached 85% frustration due to spike traps. Speedrunner bypassed Room 4 lock.'
  },
  metrics: {
    casual: {
      agent_id: 'casual',
      name: 'Casual Player',
      rooms_completed: 10,
      completion_time_ms: 14200,
      actions_taken: 38,
      failed_actions: 6,
      damage_taken: 115,
      damage_dealt: 180,
      heals_used: 5,
      bypasses_used: 0,
      items_collected: 7,
      avg_frustration: 48.5,
      peak_frustration: 85,
      efficiency_score: 62.0,
      exploration_score: 70.0,
      is_victory: true
    },
    speedrunner: {
      agent_id: 'speedrunner',
      name: 'Speedrunner',
      rooms_completed: 10,
      completion_time_ms: 5800,
      actions_taken: 16,
      failed_actions: 1,
      damage_taken: 35,
      damage_dealt: 210,
      heals_used: 0,
      bypasses_used: 4,
      items_collected: 1,
      avg_frustration: 12.0,
      peak_frustration: 25,
      efficiency_score: 94.5,
      exploration_score: 15.0,
      is_victory: true
    },
    explorer: {
      agent_id: 'explorer',
      name: 'Explorer',
      rooms_completed: 10,
      completion_time_ms: 18500,
      actions_taken: 52,
      failed_actions: 2,
      damage_taken: 60,
      damage_dealt: 195,
      heals_used: 2,
      bypasses_used: 0,
      items_collected: 15,
      avg_frustration: 22.0,
      peak_frustration: 40,
      efficiency_score: 58.0,
      exploration_score: 100.0,
      is_victory: true
    }
  },
  anomalies: [
    {
      id: 'anom-1',
      run_id: 'run-demo-benchmark-01',
      agent_id: 'casual',
      room: 6,
      type: 'HIGH_FRUSTRATION_SPIKE',
      severity: 'high',
      description: 'Casual player frustration peaked at 85% after consecutive trap damage and heavy attack counter-strikes.',
      evidence: { room: 6, damage_taken: 45, failed_heals: 1 },
      timestamp: new Date(Date.now() - 720000).toISOString()
    },
    {
      id: 'anom-2',
      run_id: 'run-demo-benchmark-01',
      agent_id: 'speedrunner',
      room: 4,
      type: 'MECHANIC_BYPASS_EXPLOIT',
      severity: 'medium',
      description: 'Speedrunner bypassed the locking puzzle mechanism in 1 action, skipping intended combat encounter.',
      evidence: { room: 4, bypass_used: true, actions_taken: 1 },
      timestamp: new Date(Date.now() - 840000).toISOString()
    }
  ],
  report: {
    run_id: 'run-demo-benchmark-01',
    health_score: 68,
    executive_summary: 'OmniForge swarm analysis reveals significant difficulty disparity between player personas. Room 6 (The Crucible) exhibits severe friction for casual players with an 85% frustration spike, while Speedrunners effortlessly exploit puzzle bypasses in Room 4.',
    common_issues: [
      'Room 6 boss encounter attacks deal untelegraphed damage exceeding casual player reaction windows.',
      'Bypass mechanics in Room 4 allow complete circumvention of puzzle gating.'
    ],
    persona_specific_issues: {
      casual: [
        'Low health triggers panic healing lock when enemy attacks interrupt potion use.',
        'Room 6 damage intake of 45 HP over 3 turns causes critical frustration.'
      ],
      speedrunner: [
        'Speedrunner clears 10 rooms in 16 actions, ignoring 93% of designed game items.',
        'Heavy attack burst DPS trivializes mini-boss encounters without resource penalty.'
      ],
      explorer: [
        'Explorer discovers 100% of lore objects but encounters minor pacing stagnation in Room 7.'
      ]
    },
    systemic_issues: [
      'Potion drop frequency in early rooms (1-3) is insufficient for low-skill survival buffers.',
      'Enemy stagger duration is too short for casual recovery.'
    ],
    recommendations: [
      {
        room: 6,
        severity: 'high',
        actionable_fix: 'Increase telegraph wind-up on Room 6 Boss Heavy Cleave by 300ms and reduce spike trap base damage from 25 to 15.',
        confidence: 0.95,
        evidence: { room: 6, peak_frustration: 85, damage_taken: 115 }
      },
      {
        room: 4,
        severity: 'medium',
        actionable_fix: 'Add a 1.5s channel requirement to the Room 4 bypass lever to prevent instant skips.',
        confidence: 0.90,
        evidence: { room: 4, bypasses_used: 4, speedrunner_time_ms: 5800 }
      },
      {
        room: 3,
        severity: 'medium',
        actionable_fix: 'Increase potion drop probability in Room 3 from 20% to 50% to provide casual survival buffer.',
        confidence: 0.88,
        evidence: { room: 3, casual_heals_used: 5 }
      }
    ],
    created_at: new Date(Date.now() - 600000).toISOString()
  },
  patch: {
    version: '1.1.0-auto-patch',
    simulation_id: 'run-demo-benchmark-01',
    summary: 'Tuning Room 6 hazard damage, extending stagger windows, and patching speedrunner bypass in Room 4.',
    health_score: 68,
    generated_at: new Date(Date.now() - 600000).toISOString(),
    changes: [
      {
        id: 'patch-1',
        room: 6,
        category: 'difficulty',
        severity: 'high',
        affected_agents: ['casual'],
        issue: 'Casual player 85% peak frustration spike due to Room 6 boss heavy cleave.',
        evidence: { room: 6, damage_taken: 115, peak_frustration: 85 },
        recommendation: 'Reduce Room 6 boss heavy attack damage from 35 to 24 and extend telegraph window.',
        confidence: 0.95
      },
      {
        id: 'patch-2',
        room: 6,
        category: 'tuning',
        severity: 'high',
        affected_agents: ['casual', 'explorer'],
        issue: 'Spike trap base damage deals 25 unavoidable damage.',
        evidence: { room: 6, trap_damage: 45 },
        recommendation: 'Reduce Room 6 spike trap base damage from 25 to 15.',
        confidence: 0.92
      },
      {
        id: 'patch-3',
        room: 4,
        category: 'mechanics',
        severity: 'medium',
        affected_agents: ['speedrunner'],
        issue: 'Instant bypass lever trivializes Room 4 puzzle lock.',
        evidence: { room: 4, actions_taken: 1 },
        recommendation: 'Add a 1.5s channel requirement to prevent zero-action skip exploit.',
        confidence: 0.90
      }
    ]
  },
  analytics: {
    avg_frustration: 27.5,
    peak_frustration: 85,
    total_actions: 106,
    total_failures: 9,
    total_damage_taken: 210,
    total_damage_dealt: 585,
    total_items_collected: 23,
    total_bypasses_used: 4,
    avg_rooms_cleared: 10,
    game_health_score: 68,
    most_problematic_room: 6,
    most_explored_room: 7,
    total_anomalies: 2,
    room_heatmaps: {
      1: { room: 1, casual_frustration: 10, speedrunner_friction: 5, explorer_friction: 8, explorer_actions: 6, damage_taken: 0, failures: 0, anomalies_count: 0, friction_score: 8 },
      2: { room: 2, casual_frustration: 18, speedrunner_friction: 10, explorer_friction: 12, explorer_actions: 7, damage_taken: 5, failures: 0, anomalies_count: 0, friction_score: 13 },
      3: { room: 3, casual_frustration: 25, speedrunner_friction: 12, explorer_friction: 15, explorer_actions: 9, damage_taken: 10, failures: 1, anomalies_count: 0, friction_score: 18 },
      4: { room: 4, casual_frustration: 32, speedrunner_friction: 5, explorer_friction: 20, explorer_actions: 10, damage_taken: 15, failures: 2, anomalies_count: 1, friction_score: 22 },
      5: { room: 5, casual_frustration: 38, speedrunner_friction: 15, explorer_friction: 22, explorer_actions: 11, damage_taken: 20, failures: 1, anomalies_count: 0, friction_score: 28 },
      6: { room: 6, casual_frustration: 85, speedrunner_friction: 30, explorer_friction: 45, explorer_actions: 15, damage_taken: 95, failures: 5, anomalies_count: 1, friction_score: 75 },
      7: { room: 7, casual_frustration: 45, speedrunner_friction: 18, explorer_friction: 35, explorer_actions: 12, damage_taken: 15, failures: 1, anomalies_count: 0, friction_score: 32 },
      8: { room: 8, casual_frustration: 35, speedrunner_friction: 12, explorer_friction: 25, explorer_actions: 9, damage_taken: 10, failures: 0, anomalies_count: 0, friction_score: 24 },
      9: { room: 9, casual_frustration: 28, speedrunner_friction: 10, explorer_friction: 20, explorer_actions: 8, damage_taken: 5, failures: 0, anomalies_count: 0, friction_score: 19 },
      10: { room: 10, casual_frustration: 20, speedrunner_friction: 8, explorer_friction: 15, explorer_actions: 7, damage_taken: 0, failures: 0, anomalies_count: 0, friction_score: 14 }
    },
    persona_radar: [
      { subject: 'Speed', Casual: 45, Speedrunner: 98, Explorer: 40 },
      { subject: 'Exploration', Casual: 60, Speedrunner: 15, Explorer: 100 },
      { subject: 'Survival', Casual: 55, Speedrunner: 85, Explorer: 90 },
      { subject: 'Combat Efficiency', Casual: 50, Speedrunner: 95, Explorer: 65 },
      { subject: 'Composure', Casual: 35, Speedrunner: 90, Explorer: 80 }
    ],
    agent_summaries: {
      casual: {
        agent_id: 'casual',
        name: 'Casual Player',
        rooms_completed: 10,
        completion_time_ms: 14200,
        actions_taken: 38,
        failed_actions: 6,
        damage_taken: 115,
        damage_dealt: 180,
        heals_used: 5,
        bypasses_used: 0,
        items_collected: 7,
        avg_frustration: 48.5,
        peak_frustration: 85,
        efficiency_score: 62.0,
        exploration_score: 70.0
      },
      speedrunner: {
        agent_id: 'speedrunner',
        name: 'Speedrunner',
        rooms_completed: 10,
        completion_time_ms: 5800,
        actions_taken: 16,
        failed_actions: 1,
        damage_taken: 35,
        damage_dealt: 210,
        heals_used: 0,
        bypasses_used: 4,
        items_collected: 1,
        avg_frustration: 12.0,
        peak_frustration: 25,
        efficiency_score: 94.5,
        exploration_score: 15.0
      },
      explorer: {
        agent_id: 'explorer',
        name: 'Explorer',
        rooms_completed: 10,
        completion_time_ms: 18500,
        actions_taken: 52,
        failed_actions: 2,
        damage_taken: 60,
        damage_dealt: 195,
        heals_used: 2,
        bypasses_used: 0,
        items_collected: 15,
        avg_frustration: 22.0,
        peak_frustration: 40,
        efficiency_score: 58.0,
        exploration_score: 100.0
      }
    }
  },
  event_count: 30
};
