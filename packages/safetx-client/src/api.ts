export type NetworkStatus = 'green' | 'yellow' | 'red';

export interface MetricsData {
  tps: number;
  slot_time: number;
  success_rate: number;
  queue_size: number;
  retry_count: number;
  latest_slot: number;
  current_leader: string;
  network_status: NetworkStatus;
  tps_history: number[];
  recent_transactions: Array<{ tx_id: string; status: 'queued' | 'processed' | 'failed'; time: string }>;
}

export interface QueueTransaction {
  tx_id: string;
  sender: string;
  type?: string;
  fee?: string;
}

export interface SafeTxClientOptions {
  baseUrl: string; // e.g. https://api.yourdomain.com
  apiKey?: string; // optional x-api-key when backend is secured
}

/**
 * REST/SSE client for SafeTx backend
 */
export class SafeTxApiClient {
  readonly baseUrl: string;
  readonly apiKey?: string;

  constructor(opts: SafeTxClientOptions) {
    if (!opts?.baseUrl) throw new Error('baseUrl is required');
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.apiKey = opts.apiKey;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['x-api-key'] = this.apiKey;
    return h;
  }

  async health(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/health`);
    if (!res.ok) throw new Error(`health failed: ${res.statusText}`);
    return res.json();
  }

  async metrics(): Promise<MetricsData> {
    const res = await fetch(`${this.baseUrl}/api/metrics`, { headers: this.headers() });
    if (!res.ok) throw new Error(`metrics failed: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async getQueue(): Promise<{ queue_size: number; retry_count: number; transactions: any[] }> {
    const res = await fetch(`${this.baseUrl}/api/queue`, { headers: this.headers() });
    if (!res.ok) throw new Error(`queue failed: ${res.statusText}`);
    return res.json();
  }

  async enqueue(tx: QueueTransaction): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/queue`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error(`enqueue failed: ${res.statusText}`);
    return res.json();
  }

  async retry(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/retry`, { method: 'POST', headers: this.headers() });
    if (!res.ok) throw new Error(`retry failed: ${res.statusText}`);
    return res.json();
  }

  async flush(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/flush`, { method: 'POST', headers: this.headers() });
    if (!res.ok) throw new Error(`flush failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Subscribe to unified metrics stream via SSE. Returns an unsubscribe fn.
   * Note: EventSource cannot send custom headers cross-origin; if apiKey is set,
   * the server accepts it via `?key=` query param.
   */
  subscribe(onMessage: (m: MetricsData) => void, onError?: (e: any) => void): () => void {
    const url = new URL(`${this.baseUrl}/api/events/stream`);
    if (this.apiKey) url.searchParams.set('key', this.apiKey);

    const source = new EventSource(url.toString());
    source.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data);
        onMessage(m);
      } catch (e) {
        onError?.(e);
      }
    };
    source.onerror = (e) => onError?.(e);
    return () => { try { source.close(); } catch {} };
  }
}
