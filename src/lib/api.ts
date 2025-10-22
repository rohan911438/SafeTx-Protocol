// API service to fetch metrics from SafeTx backend and MagicBlock streaming server

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const MAGICBLOCK_BASE_URL = (import.meta as any).env?.VITE_MAGICBLOCK_URL || 'http://localhost:5001';
const API_KEY = (import.meta as any).env?.VITE_API_KEY || undefined;

export interface MetricsData {
  tps: number;
  slot_time: number;
  success_rate: number;
  queue_size: number;
  retry_count: number;
  latest_slot: number;
  current_leader: string;
  network_status: "green" | "yellow" | "red";
  tps_history: number[];
  recent_transactions: Array<{
    tx_id: string;
    status: "queued" | "processed" | "failed";
    time: string;
  }>;
}

export interface QueueTransaction {
  tx_id: string;
  sender: string;
  type?: string;
  fee?: string;
}

// MagicBlock streaming metrics shape
export interface MagicblockMetrics {
  tps: number;
  slot: number;
  blockTime: number; // unix seconds
  slotTime: number;  // seconds
  successRate: number;
  timestamp: number; // ms
  magicblockStatus?: string;
  lastMagicBlockRoute?: string | null;
  routesAvailable?: number;
}

// Map MagicBlock metrics into our dashboard MetricsData (best-effort)
export function mapMagicblockToMetricsData(mb: MagicblockMetrics, prev: MetricsData): MetricsData {
  return {
    ...prev,
    tps: mb.tps ?? prev.tps,
    slot_time: typeof mb.slotTime === 'number' ? Number(mb.slotTime.toFixed(2)) : prev.slot_time,
    success_rate: mb.successRate ?? prev.success_rate,
    latest_slot: mb.slot ?? prev.latest_slot,
    // keep existing values for fields not provided by MagicBlock
  };
}

/**
 * Fetch real-time Solana metrics from backend
 */
export async function fetchMetrics(): Promise<MetricsData> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Queue a transaction
 */
export async function queueTransaction(tx: QueueTransaction): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const response = await fetch(`${API_BASE_URL}/api/queue`, {
    method: 'POST',
    headers,
    body: JSON.stringify(tx),
  });
  if (!response.ok) {
    throw new Error(`Failed to queue transaction: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Retry all pending transactions
 */
export async function retryPendingTransactions(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/retry`, {
    method: 'POST',
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to retry transactions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Flush transaction queue
 */
export async function flushQueue(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/flush`, {
    method: 'POST',
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to flush queue: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get current queue status
 */
export async function getQueueStatus(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/queue`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to get queue status: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.statusText}`);
  }
  return response.json();
}

// ===================== MagicBlock server client =====================

export async function getMagicblockHealth(): Promise<any> {
  const res = await fetch(`${MAGICBLOCK_BASE_URL}/health`);
  if (!res.ok) throw new Error(`MagicBlock health failed: ${res.statusText}`);
  return res.json();
}

export async function getMagicblockRoutes(): Promise<{ success: boolean; count: number; routes: string[]; raw?: any[]; lastRefresh?: string; router: string; }>{
  const res = await fetch(`${MAGICBLOCK_BASE_URL}/magicblock/routes`);
  if (!res.ok) throw new Error(`MagicBlock routes failed: ${res.statusText}`);
  return res.json();
}

export async function getMagicblockMetrics(): Promise<MagicblockMetrics> {
  const res = await fetch(`${MAGICBLOCK_BASE_URL}/metrics`);
  if (!res.ok) throw new Error(`MagicBlock metrics failed: ${res.statusText}`);
  return res.json();
}

export function subscribeMagicblockSSE(
  onMessage: (data: MagicblockMetrics) => void,
  onError?: (err: any) => void
) {
  const source = new EventSource(`${MAGICBLOCK_BASE_URL}/metrics/stream`);
  source.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch (e) {
      onError?.(e);
    }
  };
  source.onerror = (err) => {
    onError?.(err);
  };
  return () => {
    try { source.close(); } catch {}
  };
}

// Backend SSE (unified events stream)
export function subscribeBackendSSE(
  onMessage: (data: MetricsData) => void,
  onError?: (err: any) => void
) {
  const url = new URL(`${API_BASE_URL}/api/events/stream`);
  if (API_KEY) url.searchParams.set('key', API_KEY);
  const source = new EventSource(url.toString());
  source.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch (e) {
      onError?.(e);
    }
  };
  source.onerror = (err) => onError?.(err);
  return () => { try { source.close(); } catch {} };
}
