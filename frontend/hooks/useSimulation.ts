'use client';

import { useState, useEffect, useCallback } from 'react';
import { SimulationRun, RunDetailResponse, AIMode, SimulationStatus } from '../lib/types';
import { fetchHealth, createRun, startRun, stopRun, replayRun, fetchRunDetails, listRuns } from '../lib/api';

export const DEMO_PRESETS = [
  { name: 'Default Swarm Gauntlet', seed: 42, description: 'Standard 10-room scenario balancing combat, traps, and secrets.' },
  { name: 'Infernal Crucible (Lethal Spikes)', seed: 108, description: 'High hazard density, high-damage Room 6 combat friction.' },
  { name: 'Speedrunner Labyrinth (Shortcuts)', seed: 777, description: 'High bypass route availability across mid-tier rooms.' },
  { name: 'Explorer Alcove (Lore Heavy)', seed: 999, description: 'Multiple hidden side chambers, relic caches, and puzzles.' },
];

export function useSimulation() {
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(null);
  const [runsList, setRunsList] = useState<SimulationRun[]>([]);
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [aiMode, setAiMode] = useState<AIMode>('LOCAL DEMO');
  const [seed, setSeed] = useState<number>(42);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [runDetails, setRunDetails] = useState<RunDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check system health and AI mode
  const refreshHealth = useCallback(async () => {
    try {
      const health = await fetchHealth();
      setAiMode(health.ai_mode as AIMode);
    } catch (e) {
      console.warn('Backend not responding yet:', e);
    }
  }, []);

  // Fetch past runs
  const refreshRuns = useCallback(async () => {
    try {
      const runs = await listRuns();
      setRunsList(runs);
    } catch (e) {
      console.error('Failed to load runs:', e);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshRuns();
  }, [refreshHealth, refreshRuns]);

  const handleCreateNewRun = async (customSeed?: number) => {
    setLoading(true);
    setError(null);
    try {
      const targetSeed = customSeed !== undefined ? customSeed : seed;
      const newRun = await createRun(targetSeed);
      setActiveRun(newRun);
      setStatus('created');
      setRunDetails(null);
      await refreshRuns();
      return newRun;
    } catch (err: any) {
      setError(err.message || 'Failed to create run');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (customSeed?: number) => {
    setError(null);
    setLoading(true);
    try {
      let currentRun = activeRun;
      if (!currentRun || currentRun.status === 'completed' || currentRun.status === 'stopped') {
        currentRun = await handleCreateNewRun(customSeed);
        if (!currentRun) return;
      }

      await startRun(currentRun.id, customSeed ?? seed, speedMultiplier);
      setStatus('running');
    } catch (err: any) {
      setError(err.message || 'Failed to start simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeRun) return;
    try {
      await stopRun(activeRun.id);
      setStatus('stopped');
    } catch (err: any) {
      setError(err.message || 'Failed to stop simulation');
    }
  };

  const handleReplay = async (runId?: string) => {
    const targetId = runId || activeRun?.id;
    if (!targetId) return;
    try {
      setStatus('replaying');
      await replayRun(targetId, speedMultiplier);
    } catch (err: any) {
      setError(err.message || 'Failed to replay simulation');
    }
  };

  const loadRunDetails = async (runId: string) => {
    setLoading(true);
    try {
      const details = await fetchRunDetails(runId);
      setRunDetails(details);
      setActiveRun(details.run);
      setStatus(details.run.status);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch run details');
    } finally {
      setLoading(false);
    }
  };

  return {
    activeRun,
    runsList,
    status,
    setStatus,
    aiMode,
    seed,
    setSeed,
    speedMultiplier,
    setSpeedMultiplier,
    runDetails,
    loading,
    error,
    handleCreateNewRun,
    handleStart,
    handleStop,
    handleReplay,
    loadRunDetails,
    refreshRuns
  };
}
