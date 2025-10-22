# SafeTx Public API (v1)

This document describes the SafeTx backend API for companies and integrators. It includes REST endpoints and a unified Server‑Sent Events (SSE) stream.

Base URL examples:
- Local: http://localhost:5000
- Prod: https://api.yourdomain.com

If `API_KEY` is set in the backend environment, requests must include:
- HTTP header: `x-api-key: <your-key>`
- For SSE only, you may also pass `?key=<your-key>` as a query param (EventSource limitation)

## Endpoints

### GET /api/health
- Public (no key required)
- Returns service uptime/timestamp

Response:
```
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-10-22T10:00:00.000Z"
}
```

### GET /api/metrics
Returns the latest metrics snapshot.

Response:
```
{
  "tps": 1243,
  "slot_time": 0.42,
  "success_rate": 98.4,
  "queue_size": 2,
  "retry_count": 0,
  "latest_slot": 245789235,
  "current_leader": "Val8x...K2p",
  "network_status": "green",
  "tps_history": [1200, 1150, 1300, 1100, 1250, 1400],
  "recent_transactions": [
    { "tx_id": "4Ghs1..K7X", "status": "processed", "time": "12:44:15" }
  ]
}
```

### GET /api/queue
Returns current queue content and counters.

### POST /api/queue
Adds a transaction to the queue.

Body:
```
{
  "tx_id": "string",   // required
  "sender": "string",  // required
  "type": "Transfer",  // optional
  "fee": "0.000005 SOL"// optional
}
```

### POST /api/retry
Retries all queued transactions (simulation in MVP). Returns counts.

### POST /api/flush
Clears the queue.

### GET /api/events/stream (SSE)
Unified live metrics stream. Emits a `data: { ...metrics }` message every 2 seconds by default.

Headers/Query for auth when API_KEY enabled:
- `x-api-key: <key>` or `?key=<key>`

Example (browser):
```js
const source = new EventSource('https://api.yourdomain.com/api/events/stream?key=YOUR_KEY');
source.onmessage = (ev) => {
  const metrics = JSON.parse(ev.data);
  console.log('Metrics:', metrics);
};
```

## OpenAPI
A machine-readable spec is available at `docs/openapi.yaml`.

## Rate Limits & Terms (suggested defaults)
- 60 requests/minute on Free tier
- 600 requests/minute on Pro tier
- Bursting allowed to 2x
- Contact for higher limits and enterprise SLAs

## Changelog
- 0.1.0: Added /api/events/stream (SSE), optional API key auth
