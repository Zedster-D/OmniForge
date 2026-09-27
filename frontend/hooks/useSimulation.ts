'use client';

import { useState, useEffect, useCallback } from 'react';
import { SimulationRun, RunDetailResponse, AIMode, SimulationStatus } from '../lib/types';
import { fetchHealth, createRun, startRun, stopRun, replayRun, fetchRunDetails, listRuns, seedMockData } from '../lib/api';
import { FALLBACK_BENCHMARK_DATA } from '../lib/benchmarkData';

export const DEMO_PRESETS = [
  { name: 'Default Swarm Gauntlet', seed: 42, description: 'Standard 10-room scenario balancing combat, traps, and secrets.' },
  { name: 'Infernal Crucible (Lethal Spikes)', seed: 108, description: 'High hazard density, high-damage Room 6 combat friction.' },
  { name: 'Speedrunner Labyrinth (Shortcuts)', seed: 777, description: 'High bypass route availability across mid-tier rooms.' },
  { name: 'Explorer Alcove (Lore Heavy)', seed: 999, description: 'Multiple hidden side chambers, relic caches, and puzzles.' },
];

export function useSimulation() {
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(FALLBACK_BENCHMARK_DATA.run);
  const [runsList, setRunsList] = useState<SimulationRun[]>([FALLBACK_BENCHMARK_DATA.run]);
  const [status, setStatus] = useState<SimulationStatus>('completed');
  const [aiMode, setAiMode] = useState<AIMode>('LOCAL DEMO');
  const [seed, setSeed] = useState<number>(42);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [runDetails, setRunDetails] = useState<RunDetailResponse | null>(FALLBACK_BENCHMARK_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check system health and AI mode
  const refreshHealth = useCallback(async () => {
    try {
      const health = await fetchHealth();
      setAiMode(health.ai_mode as AIMode);
      setError(null);
    } catch (e) {
      console.warn('Backend waking up or connecting...');
    }
  }, []);

  // Fetch past runs
  const refreshRuns = useCallback(async () => {
    try {
      const runs = await listRuns();
      if (runs && runs.length > 0) {
        setRunsList(runs);
        const details = await fetchRunDetails(runs[0].id);
        setRunDetails(details);
        setActiveRun(details.run);
        setStatus(details.run.status);
      }
      setError(null);
    } catch (e) {
      console.warn('Using client benchmark dataset while server initializes:', e);
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

  const handleLoadDemoBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      await seedMockData();
      await refreshRuns();
      const details = await fetchRunDetails('run-demo-benchmark-01');
      setRunDetails(details);
      setActiveRun(details.run);
      setStatus(details.run.status);
    } catch (err: any) {
      console.warn('Loading client benchmark dataset directly into dashboard:', err);
      setRunDetails(FALLBACK_BENCHMARK_DATA);
      setActiveRun(FALLBACK_BENCHMARK_DATA.run);
      setStatus(FALLBACK_BENCHMARK_DATA.run.status);
      setRunsList((prev) => (prev.length > 0 ? prev : [FALLBACK_BENCHMARK_DATA.run]));
      setError(null);
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
    handleLoadDemoBenchmark,
    loadRunDetails,
    refreshRuns
  };
}
