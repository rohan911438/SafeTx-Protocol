# 🎯 SafeTx API - Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         SAFETX API QUICK START                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  📍 Base URL (Local):  http://localhost:5000                             ║
║  📍 Base URL (Prod):   https://api.safetx.io (Coming Soon)              ║
║                                                                          ║
║  🔑 API Key:           Optional for local dev                            ║
║                        Required for production                           ║
║                        Header: x-api-key: YOUR_KEY                       ║
║                        Query: ?key=YOUR_KEY (SSE only)                   ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📦 INSTALLATION                                                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  npm install @safetx/client                                              ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  🚀 QUICK EXAMPLE                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  import { SafeTxApiClient } from '@safetx/client';                       ║
║                                                                          ║
║  const client = new SafeTxApiClient({                                    ║
║    baseURL: 'http://localhost:5000',                                     ║
║    apiKey: 'optional-key-here'                                           ║
║  });                                                                     ║
║                                                                          ║
║  const metrics = await client.getMetrics();                              ║
║  console.log('TPS:', metrics.tps);                                       ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📡 ENDPOINTS                                                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  GET  /api/health              Health check (no auth)                    ║
║  GET  /api/metrics             Current network metrics                   ║
║  GET  /api/queue               View transaction queue                    ║
║  POST /api/queue               Add to queue                              ║
║  POST /api/retry               Retry pending transactions                ║
║  POST /api/flush               Clear queue                               ║
║  GET  /api/events/stream       Live SSE stream (real-time)               ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📊 RESPONSE FORMAT                                                      ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  {                                                                       ║
║    "tps": 1243,                    // Transactions per second            ║
║    "slot_time": 0.42,              // Average slot time (seconds)        ║
║    "success_rate": 98.4,           // Success rate (%)                   ║
║    "queue_size": 2,                // Queued transactions                ║
║    "retry_count": 0,               // Retry attempts                     ║
║    "latest_slot": 245789235,       // Latest Solana slot                 ║
║    "current_leader": "Val8x...K2p",// Current validator                  ║
║    "network_status": "green",      // green | yellow | red               ║
║    "tps_history": [1200, 1150...], // Last 6 TPS values                  ║
║    "recent_transactions": [...]    // Recent tx details                  ║
║  }                                                                       ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  💡 COMMON USE CASES                                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ✅ dApp checkout flow monitoring                                        ║
║  ✅ Wallet network health indicator                                      ║
║  ✅ NFT mint congestion detection                                        ║
║  ✅ DevOps network alerts                                                ║
║  ✅ Transaction retry logic                                              ║
║  ✅ Real-time dashboards                                                 ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📈 RATE LIMITS                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Free:        60 requests/minute       $0                                ║
║  Pro:         600 requests/minute      $49/month                         ║
║  Business:    3,000 requests/minute    $199/month                        ║
║  Enterprise:  Unlimited                Custom pricing                    ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📚 DOCUMENTATION                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  📖 Getting Started:   docs/GETTING_STARTED.md                           ║
║  📖 API Reference:     docs/API.md                                       ║
║  📖 API Keys:          docs/API_KEYS.md                                  ║
║  📖 OpenAPI Spec:      docs/openapi.yaml                                 ║
║  📖 TypeScript SDK:    packages/safetx-client/README.md                  ║
║  📖 All Docs:          docs/README.md                                    ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  🆘 SUPPORT                                                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  📧 Email:    hello@safetx.io                                            ║
║  💬 Discord:  Coming soon                                                ║
║  🐛 Issues:   github.com/yourusername/neon-solana-watch/issues           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎬 1-Minute Integration

### REST API
```bash
curl http://localhost:5000/api/metrics
```

### JavaScript/TypeScript
```typescript
import { SafeTxApiClient } from '@safetx/client';
const client = new SafeTxApiClient({ baseURL: 'http://localhost:5000' });
const metrics = await client.getMetrics();
```

### Python
```python
import requests
response = requests.get('http://localhost:5000/api/metrics')
metrics = response.json()
```

### Real-Time Streaming (SSE)
```javascript
const es = new EventSource('http://localhost:5000/api/events/stream');
es.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 🔥 Popular Code Snippets

### Check Network Health Before Transaction
```typescript
const metrics = await client.getMetrics();
if (metrics.success_rate < 90) {
  alert('Network congestion! Transaction may fail.');
} else {
  await sendTransaction();
}
```

### Live Dashboard Updates
```typescript
client.subscribe((metrics) => {
  updateUI({
    tps: metrics.tps,
    health: metrics.network_status
  });
});
```

### DevOps Alerts
```typescript
client.subscribe((metrics) => {
  if (metrics.success_rate < 95) {
    sendSlackAlert(`⚠️ Success rate: ${metrics.success_rate}%`);
  }
});
```

---

**Print this for quick reference!** 📄
