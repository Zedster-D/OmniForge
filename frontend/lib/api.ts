import { SimulationRun, RunDetailResponse, DirectorReport, BalancePatch } from './types';

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return 'http://localhost:8000';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl.replace(/\/+$/, '');
  }
  return `https://${envUrl.replace(/\/+$/, '')}`;
}

const API_BASE_URL = getApiBaseUrl();

export async function fetchHealth(): Promise<{ status: string; ai_mode: string; version: string }> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function createRun(seed: number = 42): Promise<SimulationRun> {
  const res = await fetch(`${API_BASE_URL}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed }),
  });
  if (!res.ok) throw new Error('Failed to create simulation run');
  return res.json();
}

export async function listRuns(): Promise<SimulationRun[]> {
  const res = await fetch(`${API_BASE_URL}/api/runs`);
  if (!res.ok) throw new Error('Failed to list runs');
  return res.json();
}

export async function fetchRunDetails(runId: string): Promise<RunDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}`);
  if (!res.ok) throw new Error(`Failed to fetch run details for ${runId}`);
  return res.json();
}

export async function startRun(runId: string, seed?: number, speedMultiplier: number = 1.0): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, speed_multiplier: speedMultiplier }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start run' }));
    throw new Error(err.detail || 'Failed to start run');
  }
  return res.json();
}

export async function stopRun(runId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}/stop`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to stop run');
  return res.json();
}

export async function replayRun(runId: string, speedMultiplier: number = 1.0): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speed_multiplier: speedMultiplier }),
  });
  if (!res.ok) throw new Error('Failed to replay run');
  return res.json();
}

export async function fetchDirectorReport(runId: string): Promise<DirectorReport> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}/report`);
  if (!res.ok) throw new Error('Director report not available yet');
  return res.json();
}

export async function fetchBalancePatch(runId: string): Promise<BalancePatch> {
  const res = await fetch(`${API_BASE_URL}/api/runs/${runId}/patch`);
  if (!res.ok) throw new Error('Balance patch not available yet');
  return res.json();
}
