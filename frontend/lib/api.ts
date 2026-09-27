import { SimulationRun, RunDetailResponse, DirectorReport, BalancePatch } from './types';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    return envUrl.replace(/\/+$/, '');
  }
  if (envUrl && envUrl.trim().length > 0) {
    return `https://${envUrl.replace(/\/+$/, '')}`;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com')) {
      return 'https://omniforge-backend.onrender.com';
    }
    // In local browser, use relative path (Next.js proxy) or direct localhost
    return '';
  }
  return 'http://127.0.0.1:8000';
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const primaryUrl = `${baseUrl}${endpoint}`;
  
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;
    // If not ok on relative path, fallback to direct port 8000 if running locally
    if (baseUrl === '' && typeof window !== 'undefined') {
      const fallbackUrl = `http://${window.location.hostname || '127.0.0.1'}:8000${endpoint}`;
      const fallbackRes = await fetch(fallbackUrl, options);
      if (fallbackRes.ok) return fallbackRes;
      return res; // return original if fallback also failed
    }
    return res;
  } catch (err) {
    // If relative proxy failed (e.g. during dev server restart), try direct port 8000
    if (typeof window !== 'undefined') {
      const directUrl = `http://${window.location.hostname || '127.0.0.1'}:8000${endpoint}`;
      try {
        return await fetch(directUrl, options);
      } catch (innerErr) {
        throw err;
      }
    }
    throw err;
  }
}

export async function fetchHealth(): Promise<{ status: string; ai_mode: string; version: string }> {
  const res = await apiFetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function createRun(seed: number = 42): Promise<SimulationRun> {
  const res = await apiFetch('/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed }),
  });
  if (!res.ok) throw new Error('Failed to create simulation run');
  return res.json();
}

export async function listRuns(): Promise<SimulationRun[]> {
  const res = await apiFetch('/api/runs');
  if (!res.ok) throw new Error('Failed to list runs');
  return res.json();
}

export async function fetchRunDetails(runId: string): Promise<RunDetailResponse> {
  const res = await apiFetch(`/api/runs/${runId}`);
  if (!res.ok) throw new Error(`Failed to fetch run details for ${runId}`);
  return res.json();
}

export async function startRun(runId: string, seed?: number, speedMultiplier: number = 1.0): Promise<any> {
  const res = await apiFetch(`/api/runs/${runId}/start`, {
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
  const res = await apiFetch(`/api/runs/${runId}/stop`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to stop run');
  return res.json();
}

export async function replayRun(runId: string, speedMultiplier: number = 1.0): Promise<any> {
  const res = await apiFetch(`/api/runs/${runId}/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speed_multiplier: speedMultiplier }),
  });
  if (!res.ok) throw new Error('Failed to replay run');
  return res.json();
}

export async function fetchDirectorReport(runId: string): Promise<DirectorReport> {
  const res = await apiFetch(`/api/runs/${runId}/report`);
  if (!res.ok) throw new Error('Director report not available yet');
  return res.json();
}

export async function fetchBalancePatch(runId: string): Promise<BalancePatch> {
  const res = await apiFetch(`/api/runs/${runId}/patch`);
  if (!res.ok) throw new Error('Balance patch not available yet');
  return res.json();
}

export async function seedMockData(): Promise<any> {
  const res = await apiFetch('/api/runs/seed/mock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to seed mock datasets');
  return res.json();
}
