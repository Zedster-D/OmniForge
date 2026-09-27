import { TelemetryEvent } from './types';

function getWsBaseUrl(): string {
  const envWs = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envWs && (envWs.startsWith('wss://') || envWs.startsWith('ws://'))) {
    return envWs.replace(/\/+$/, '');
  }
  if (envWs && envWs.startsWith('https://')) {
    return envWs.replace(/^https:\/\//, 'wss://').replace(/\/+$/, '');
  }
  if (envWs && envWs.startsWith('http://')) {
    return envWs.replace(/^http:\/\//, 'ws://').replace(/\/+$/, '');
  }
  if (envWs && envWs.trim().length > 0) {
    return `wss://${envWs.replace(/\/+$/, '')}`;
  }
  // Dynamic browser detection for Render vs Localhost
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com')) {
      return 'wss://omniforge-backend.onrender.com';
    }
  }
  return 'ws://localhost:8000';
}

const WS_BASE_URL = getWsBaseUrl();

export class SimulationWebSocket {
  private ws: WebSocket | null = null;
  private runId: string;
  private onMessageCallback: (event: TelemetryEvent) => void;
  private onStatusCallback?: (connected: boolean) => void;
  private reconnectTimeout: any = null;
  private shouldReconnect: boolean = true;
  private pingInterval: any = null;

  constructor(
    runId: string,
    onMessage: (event: TelemetryEvent) => void,
    onStatus?: (connected: boolean) => void
  ) {
    this.runId = runId;
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
    this.connect();
  }

  private connect() {
    if (!this.runId) return;

    try {
      const url = `${WS_BASE_URL}/ws/runs/${this.runId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        if (this.onStatusCallback) this.onStatusCallback(true);
        // Keepalive ping every 10s
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'ping' }));
          }
        }, 10000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return;
          this.onMessageCallback(data as TelemetryEvent);
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      this.ws.onclose = () => {
        if (this.onStatusCallback) this.onStatusCallback(false);
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.shouldReconnect) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 2000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WS socket error:', err);
      };
    } catch (err) {
      console.error('Error establishing websocket:', err);
      if (this.shouldReconnect) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      }
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
