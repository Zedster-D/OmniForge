'use client';

import { useState, useEffect, useCallback } from 'react';
import { SimulationRun, RunDetailResponse, AIMode, SimulationStatus } from '../lib/types';
import { fetchHealth, createRun, startRun, stopRun, replayRun, fetchRunDetails, listRuns, seedMockData } from '../lib/api';
import { ASSASSINS_CREED_BENCHMARK, GTA_HEIST_BENCHMARK, FALLBACK_BENCHMARK_DATA } from '../lib/benchmarkData';

export const DEMO_PRESETS = [
  { name: "Assassin's Creed: Shadows of the Citadel", seed: 108, description: 'Stealth, parkour rooftop snipers, and Animus synchronization.' },
  { name: 'GTA VI: Vice City Heist Pursuit', seed: 777, description: 'Bank infiltration, 4-star freeway police chase, and getaway stunts.' },
  { name: 'OmniForge: Dungeon Gauntlet', seed: 42, description: 'Standard 10-room combat, puzzle, and hazard dungeon.' },
];

export function useSimulation() {
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(ASSASSINS_CREED_BENCHMARK.run);
  const [runsList, setRunsList] = useState<SimulationRun[]>([ASSASSINS_CREED_BENCHMARK.run, GTA_HEIST_BENCHMARK.run]);
  const [status, setStatus] = useState<SimulationStatus>('completed');
  const [aiMode, setAiMode] = useState<AIMode>('LOCAL DEMO');
  const [seed, setSeed] = useState<number>(108);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [runDetails, setRunDetails] = useState<RunDetailResponse | null>(ASSASSINS_CREED_BENCHMARK);
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

  const handleLoadDemoBenchmark = async (targetSeed?: number) => {
    setLoading(true);
    setError(null);
    const activeSeed = targetSeed ?? seed;
    const targetRunId =
      activeSeed === 777
        ? 'run-demo-gta-vice-heist'
        : activeSeed === 42
        ? 'run-demo-benchmark-01'
        : 'run-demo-assassins-creed';

    const fallbackDataset =
      activeSeed === 777
        ? GTA_HEIST_BENCHMARK
        : activeSeed === 42
        ? FALLBACK_BENCHMARK_DATA
        : ASSASSINS_CREED_BENCHMARK;

    try {
      await seedMockData();
      await refreshRuns();
      const details = await fetchRunDetails(targetRunId);
      setRunDetails(details);
      setActiveRun(details.run);
      setStatus(details.run.status);
    } catch (err: any) {
      console.warn(`Loading client fallback benchmark dataset for ${targetRunId}:`, err);
      setRunDetails(fallbackDataset);
      setActiveRun(fallbackDataset.run);
      setStatus(fallbackDataset.run.status);
      setRunsList([ASSASSINS_CREED_BENCHMARK.run, GTA_HEIST_BENCHMARK.run]);
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
