# 🚀 Getting Started with SafeTx API

This guide shows developers how to integrate SafeTx API into their applications.

## 📋 Quick Links

- **Live API**: Coming soon (currently in development)
- **Local Development**: `http://localhost:5000`
- **Full API Reference**: [API.md](./API.md)
- **OpenAPI Spec**: [openapi.yaml](./openapi.yaml)
- **TypeScript SDK**: [@safetx/client](../packages/safetx-client/README.md)

---

## 🔑 Getting Your API Key

### For Development (Local)

When running the backend locally, **API keys are optional** by default:

```bash
# No API key needed for local development
cd safetx-backend
node server.js
```

The server will run without authentication, making it easy to test.

### For Production (With API Key)

To enable API key authentication, set the `API_KEY` environment variable:

```bash
# Backend with API key enabled
cd safetx-backend
API_KEY=your-secret-key-here node server.js
```

Or create a `.env` file:

```env
# safetx-backend/.env
API_KEY=your-secret-api-key-here
PORT=5000
```

### For Companies & Integrators

**Coming Soon**: We'll provide a dashboard where you can:
- Sign up for a free API key (60 req/min)
- Upgrade to Pro ($49/mo, 600 req/min)
- View usage analytics
- Manage multiple keys

**For now**: Contact us at `hello@safetx.io` to get a production API key.

---

## 🛠️ Integration Methods

### Option 1: TypeScript/JavaScript SDK (Recommended)

Install the official SDK:

```bash
npm install @safetx/client
```

**Example - REST API:**

```typescript
import { SafeTxApiClient } from '@safetx/client';

// Initialize client
const client = new SafeTxApiClient({
  baseURL: 'http://localhost:5000',
  apiKey: 'your-api-key-here' // Optional for local dev
});

// Get current metrics
const metrics = await client.getMetrics();
console.log('TPS:', metrics.tps);
console.log('Success Rate:', metrics.success_rate);

// Retry pending transactions
await client.retryPending();

// Flush queue
await client.flushQueue();
```

**Example - Live Streaming (SSE):**

```typescript
import { SafeTxApiClient } from '@safetx/client';

const client = new SafeTxApiClient({
  baseURL: 'http://localhost:5000',
  apiKey: 'your-api-key-here'
});

// Subscribe to live metrics
const unsubscribe = client.subscribe(
  (metrics) => {
    console.log('Live update:', metrics);
    // Update your UI with real-time data
  },
  (error) => {
    console.error('Stream error:', error);
  }
);

// Later, clean up
unsubscribe();
```

**Example - Solana On-Chain Integration:**

```typescript
import { buildInitRegistryIx, buildPushMetricIx, sendWithProvider } from '@safetx/client/solana';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('GHurqnc1CCe9NaBvwvWgBz3qmRP9rePDxNwf5eEgqCD');

// Initialize registry (one-time setup)
const initIx = buildInitRegistryIx(wallet.publicKey, programId);
const sig1 = await sendWithProvider(window.solana, connection, initIx);

// Push metrics to on-chain storage
const pushIx = buildPushMetricIx(wallet.publicKey, programId, {
  tps: 1200,
  slot: BigInt(Date.now()),
  slot_time_ms: 420,
  success_bps: 9840, // 98.40%
  ts: BigInt(Date.now())
});
const sig2 = await sendWithProvider(window.solana, connection, pushIx);
```

---

### Option 2: Direct HTTP/REST (Any Language)

**Without API Key (Local Development):**

```bash
# Get metrics
curl http://localhost:5000/api/metrics

# Get queue status
curl http://localhost:5000/api/queue

# Retry pending transactions
curl -X POST http://localhost:5000/api/retry

# Flush queue
curl -X POST http://localhost:5000/api/flush
```

**With API Key (Production):**

```bash
# Add x-api-key header
curl -H "x-api-key: your-api-key-here" \
  https://api.safetx.io/api/metrics

# Post to queue
curl -X POST \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"tx_id":"abc123","sender":"wallet123"}' \
  https://api.safetx.io/api/queue
```

**Python Example:**

```python
import requests

API_KEY = "your-api-key-here"
BASE_URL = "http://localhost:5000"

headers = {
    "x-api-key": API_KEY  # Optional for local dev
}

# Get metrics
response = requests.get(f"{BASE_URL}/api/metrics", headers=headers)
metrics = response.json()
print(f"TPS: {metrics['tps']}")
print(f"Success Rate: {metrics['success_rate']}%")

# Retry transactions
retry_response = requests.post(f"{BASE_URL}/api/retry", headers=headers)
print(retry_response.json())
```

---

### Option 3: Server-Sent Events (SSE) Stream

**JavaScript/Browser:**

```javascript
// Without API key (local)
const eventSource = new EventSource('http://localhost:5000/api/events/stream');

// With API key (add as query param for EventSource)
const eventSource = new EventSource(
  'https://api.safetx.io/api/events/stream?key=your-api-key-here'
);

eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  console.log('Live metrics:', metrics);
  
  // Update your dashboard
  updateDashboard(metrics);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};

// Clean up when done
eventSource.close();
```

**Node.js:**

```javascript
const EventSource = require('eventsource');

const url = 'http://localhost:5000/api/events/stream?key=your-api-key-here';
const es = new EventSource(url);

es.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  console.log('Live update:', metrics);
};

es.onerror = (err) => {
  console.error('Error:', err);
};
```

---

## 📊 Response Format

All API endpoints return JSON. Here's the main metrics format:

```typescript
interface MetricsData {
  tps: number;                    // Transactions per second
  slot_time: number;              // Average slot time (seconds)
  success_rate: number;           // Success rate percentage (0-100)
  queue_size: number;             // Number of queued transactions
  retry_count: number;            // Number of retry attempts
  latest_slot: number;            // Latest Solana slot number
  current_leader: string;         // Current validator leader
  network_status: 'green' | 'yellow' | 'red';
  tps_history: number[];          // Last 6 TPS values
  recent_transactions: Array<{
    tx_id: string;
    status: 'queued' | 'processed' | 'failed';
    time: string;
    type?: string;
    fee?: string;
    sender?: string;
  }>;
}
```

---

## 🎯 Common Use Cases

### 1. **dApp Checkout Flow**
Monitor network conditions before submitting user transactions:

```typescript
const metrics = await client.getMetrics();

if (metrics.success_rate < 90 || metrics.slot_time > 0.6) {
  // Show warning to user
  showWarning('Network congestion detected. Transaction may be delayed.');
} else {
  // Proceed with transaction
  await submitTransaction();
}
```

### 2. **Wallet Dashboard**
Show live network health in your wallet UI:

```typescript
client.subscribe((metrics) => {
  updateNetworkIndicator({
    status: metrics.network_status,
    tps: metrics.tps,
    successRate: metrics.success_rate
  });
});
```

### 3. **DevOps Monitoring**
Set up alerts for network issues:

```typescript
client.subscribe((metrics) => {
  if (metrics.success_rate < 95) {
    sendAlert('Solana success rate dropped to ' + metrics.success_rate + '%');
  }
  
  if (metrics.queue_size > 10) {
    sendAlert('Queue size is high: ' + metrics.queue_size);
  }
});
```

### 4. **NFT Mint Launch**
Queue transactions during high-traffic mints:

```typescript
// Add failed transactions to queue
await client.addToQueue({
  tx_id: failedTxId,
  sender: userWallet,
  type: 'NFT Mint'
});

// Retry when network stabilizes
if (metrics.success_rate > 95) {
  await client.retryPending();
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API keys in environment variables (`.env` file)
- Use HTTPS in production
- Rotate API keys regularly
- Implement rate limiting on your side
- Monitor API usage

### ❌ DON'T:
- Commit API keys to version control
- Share API keys publicly
- Use the same key across multiple apps (get separate keys)
- Expose keys in client-side code (use a backend proxy)

**Example - Secure Setup:**

```typescript
// ❌ Bad - API key in code
const client = new SafeTxApiClient({
  apiKey: 'sk_live_abc123...'  // NEVER DO THIS
});

// ✅ Good - API key from environment
const client = new SafeTxApiClient({
  apiKey: process.env.SAFETX_API_KEY
});
```

---

## 📈 Rate Limits

| Tier | Requests/Minute | Price |
|------|----------------|-------|
| **Free** | 60 | $0 |
| **Pro** | 600 | $49/mo |
| **Business** | 3,000 | $199/mo |
| **Enterprise** | Custom | Contact Us |

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "limit": 60,
  "reset": "2025-10-22T10:15:00Z"
}
```

---

## 🆘 Support

- **Documentation**: [docs/API.md](./API.md)
- **SDK Issues**: [GitHub Issues](https://github.com/yourusername/neon-solana-watch/issues)
- **Email**: hello@safetx.io
- **Discord**: Coming soon

---

## 🚀 Next Steps

1. ✅ Install the SDK: `npm install @safetx/client`
2. ✅ Get an API key (optional for local dev)
3. ✅ Check out [API.md](./API.md) for full endpoint reference
4. ✅ See [openapi.yaml](./openapi.yaml) for machine-readable spec
5. ✅ Join our community for updates and support

Happy building! 🎉
