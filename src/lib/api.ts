// API service to fetch metrics from SafeTx backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

/**
 * Fetch real-time Solana metrics from backend
 */
export async function fetchMetrics(): Promise<MetricsData> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Queue a transaction
 */
export async function queueTransaction(tx: QueueTransaction): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${API_BASE_URL}/api/queue`);
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
