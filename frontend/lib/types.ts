export type AIMode = 'OPENAI' | 'LOCAL DEMO';

export type SimulationStatus = 'idle' | 'created' | 'running' | 'completed' | 'stopped' | 'error' | 'replaying';

export interface GameStateSummary {
  room: number;
  player_hp: number;
  max_player_hp: number;
  potions: number;
  enemy_type: string | null;
  enemy_hp: number | null;
  available_actions: string[];
  items_present: string[];
  hazards_present: string[];
  bypass_available: boolean;
  optional_path_available: boolean;
  room_completed: boolean;
  inventory: string[];
  turns_in_room: number;
}

export interface Anomaly {
  id: string;
  type: string;
  run_id: string;
  agent_id: string;
  room: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, any>;
  timestamp: string;
}

export interface TelemetryEvent {
  id?: string;
  timestamp: string;
  run_id: string;
  agent_id?: string | null;
  event_type: string;
  room: number;
  observation?: string;
  decision_summary?: string;
  tool?: string;
  tool_args?: Record<string, any>;
  tool_result?: {
    success: boolean;
    message: string;
    room_advanced?: boolean;
    [key: string]: any;
  };
  player_hp?: number;
  enemy_hp?: number;
  frustration?: number;
  frustration_delta?: number;
  damage_taken?: number;
  damage_dealt?: number;
  anomaly?: Anomaly;
  payload?: Record<string, any>;
}

export interface AgentMetrics {
  agent_id: string;
  name: string;
  rooms_completed: number;
  completion_time_ms: number;
  actions_taken: number;
  failed_actions: number;
  damage_taken: number;
  damage_dealt: number;
  heals_used: number;
  bypasses_used: number;
  items_collected: number;
  avg_frustration: number;
  peak_frustration: number;
  efficiency_score?: number;
  exploration_score?: number;
  frustration_history?: Array<{
    step: number;
    room: number;
    frustration: number;
    delta: number;
    hp: number;
  }>;
  is_victory?: boolean;
  is_dead?: boolean;
}

export interface RoomHeatmapData {
  room: number;
  casual_frustration: number;
  speedrunner_friction: number;
  explorer_friction: number;
  explorer_actions: number;
  damage_taken: number;
  failures: number;
  anomalies_count: number;
  friction_score: number;
}

export interface PersonaRadarPoint {
  subject: string;
  Casual: number;
  Speedrunner: number;
  Explorer: number;
}

export interface RunAnalytics {
  avg_frustration: number;
  peak_frustration: number;
  total_actions: number;
  total_failures: number;
  total_damage_taken: number;
  total_damage_dealt: number;
  total_items_collected: number;
  total_bypasses_used: number;
  avg_rooms_cleared: number;
  game_health_score: number;
  most_problematic_room: number;
  most_explored_room: number;
  total_anomalies: number;
  room_heatmaps: Record<string | number, RoomHeatmapData>;
  persona_radar: PersonaRadarPoint[];
  agent_summaries: Record<string, AgentMetrics>;
}

export interface PatchChange {
  id: string;
  room: number;
  category: 'difficulty' | 'pacing' | 'layout' | 'rewards' | 'mechanics' | 'tuning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_agents: string[];
  issue: string;
  evidence: Record<string, any>;
  recommendation: string;
  confidence: number;
}

export interface BalancePatch {
  version: string;
  simulation_id: string;
  summary: string;
  health_score: number;
  changes: PatchChange[];
  generated_at: string;
}

export interface DirectorReport {
  run_id: string;
  health_score: number;
  executive_summary: string;
  common_issues: string[];
  persona_specific_issues: {
    casual: string[];
    speedrunner: string[];
    explorer: string[];
  };
  systemic_issues: string[];
  recommendations: Array<{
    room: number;
    severity: string;
    actionable_fix: string;
    confidence: number;
    evidence: Record<string, any>;
  }>;
  created_at: string;
}

export interface SimulationRun {
  id: string;
  seed: number;
  ai_mode: string;
  status: SimulationStatus;
  created_at: string;
  completed_at?: string;
  health_score?: number;
  summary?: string;
}

export interface RunDetailResponse {
  run: SimulationRun;
  metrics: Record<string, AgentMetrics>;
  anomalies: Anomaly[];
  report: DirectorReport | null;
  patch: BalancePatch | null;
  analytics: RunAnalytics | null;
  event_count: number;
}
