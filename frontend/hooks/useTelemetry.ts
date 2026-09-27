'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TelemetryEvent, GameStateSummary, Anomaly, DirectorReport, BalancePatch, RoomHeatmapData } from '../lib/types';
import { SimulationWebSocket } from '../lib/websocket';

export interface AgentLiveState {
  room: number;
  player_hp: number;
  max_player_hp: number;
  frustration: number;
  is_finished: boolean;
  last_action: string;
  last_decision: string;
  recent_events: TelemetryEvent[];
}

export function useTelemetry(runId: string | null) {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  
  // Real-time chart data points for rooms 1-10
  const [frustrationTimeline, setFrustrationTimeline] = useState<Array<{
    room: number;
    Casual: number;
    Speedrunner: number;
    Explorer: number;
  }>>([
    { room: 1, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 2, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 3, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 4, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 5, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 6, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 7, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 8, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 9, Casual: 0, Speedrunner: 0, Explorer: 0 },
    { room: 10, Casual: 0, Speedrunner: 0, Explorer: 0 },
  ]);

  // Live agent states
  const [casualState, setCasualState] = useState<AgentLiveState>({
    room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: []
  });
  const [speedrunnerState, setSpeedrunnerState] = useState<AgentLiveState>({
    room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: []
  });
  const [explorerState, setExplorerState] = useState<AgentLiveState>({
    room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: []
  });

  // Current global game room & state snapshot
  const [currentRoom, setCurrentRoom] = useState<number>(1);
  const [activeGameState, setActiveGameState] = useState<any>({
    room: 1,
    player_hp: 100,
    max_player_hp: 100,
    enemy_type: 'Goblin Scout',
    enemy_hp: 40,
    available_actions: ['inspect', 'attack', 'heavy_attack', 'dodge', 'bypass'],
    items: ['Minor Health Potion'],
    hazards: [],
    bypass_available: true
  });

  // Director report & patch when ready
  const [directorReport, setDirectorReport] = useState<DirectorReport | null>(null);
  const [balancePatch, setBalancePatch] = useState<BalancePatch | null>(null);
  const [isSimulationFinished, setIsSimulationFinished] = useState<boolean>(false);

  const wsRef = useRef<SimulationWebSocket | null>(null);

  const resetState = useCallback(() => {
    setEvents([]);
    setAnomalies([]);
    setDirectorReport(null);
    setBalancePatch(null);
    setIsSimulationFinished(false);
    setCurrentRoom(1);
    setCasualState({ room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: [] });
    setSpeedrunnerState({ room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: [] });
    setExplorerState({ room: 1, player_hp: 100, max_player_hp: 100, frustration: 0, is_finished: false, last_action: 'None', last_decision: 'Awaiting start...', recent_events: [] });
    setFrustrationTimeline([
      { room: 1, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 2, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 3, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 4, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 5, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 6, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 7, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 8, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 9, Casual: 0, Speedrunner: 0, Explorer: 0 },
      { room: 10, Casual: 0, Speedrunner: 0, Explorer: 0 },
    ]);
  }, []);

  const handleEvent = useCallback((event: TelemetryEvent) => {
    setEvents((prev) => [...prev.slice(-300), event]);

    const roomNum = event.room || 1;
    if (roomNum > 0) {
      setCurrentRoom((prev) => Math.max(prev, roomNum));
    }

    // Anomaly handling
    if (event.event_type === 'ANOMALY_DETECTED' && event.anomaly) {
      setAnomalies((prev) => {
        if (prev.some((a) => a.id === event.anomaly?.id)) return prev;
        return [...prev, event.anomaly!];
      });
    }

    // Patch & Director Events
    if (event.event_type === 'PATCH_GENERATED' && event.payload?.patch) {
      setBalancePatch(event.payload.patch as BalancePatch);
    }
    if (event.event_type === 'DIRECTOR_FINISHED' && event.payload?.report) {
      setDirectorReport(event.payload.report as DirectorReport);
    }
    if (event.event_type === 'SIMULATION_FINISHED') {
      setIsSimulationFinished(true);
    }

    // Agent specific updates
    const agentId = event.agent_id;
    if (!agentId) return;

    const updater = (prev: AgentLiveState): AgentLiveState => {
      const next = { ...prev };
      if (event.room && event.room > 0) next.room = Math.max(next.room, event.room);
      if (event.player_hp !== undefined && event.player_hp !== null) next.player_hp = event.player_hp;
      if (event.frustration !== undefined && event.frustration !== null) next.frustration = event.frustration;
      if (event.tool) next.last_action = event.tool;
      if (event.decision_summary) next.last_decision = event.decision_summary;
      if (event.event_type === 'AGENT_FINISHED') next.is_finished = true;
      next.recent_events = [...prev.recent_events.slice(-60), event];
      return next;
    };

    if (agentId === 'casual') setCasualState(updater);
    else if (agentId === 'speedrunner') setSpeedrunnerState(updater);
    else if (agentId === 'explorer') setExplorerState(updater);

    // Update Frustration Timeline
    if (event.frustration !== undefined && roomNum >= 1 && roomNum <= 10) {
      setFrustrationTimeline((prev) =>
        prev.map((item) => {
          if (item.room !== roomNum) return item;
          if (agentId === 'casual') return { ...item, Casual: event.frustration! };
          if (agentId === 'speedrunner') return { ...item, Speedrunner: event.frustration! };
          if (agentId === 'explorer') return { ...item, Explorer: event.frustration! };
          return item;
        })
      );
    }

    // Update Telemetry Panel Active Game State
    if (event.event_type === 'ACTION_RESULT' || event.event_type === 'AGENT_OBSERVATION') {
      setActiveGameState((prev: any) => ({
        ...prev,
        room: roomNum,
        player_hp: event.player_hp !== undefined ? event.player_hp : prev.player_hp,
        enemy_hp: event.enemy_hp !== undefined ? event.enemy_hp : prev.enemy_hp,
        last_event: event.event_type,
        tool: event.tool
      }));
    }
  }, []);

  useEffect(() => {
    if (!runId) return;
    resetState();

    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    wsRef.current = new SimulationWebSocket(
      runId,
      handleEvent,
      (connected) => setIsConnected(connected)
    );

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [runId, handleEvent, resetState]);

  return {
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
    resetState
  };
}
