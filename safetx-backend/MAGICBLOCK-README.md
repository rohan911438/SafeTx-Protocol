# SafeTx + MagicBlock Ephemeral Rollups Integration

Real-time Solana metrics streaming to MagicBlock Ephemeral Rollups using public endpoints (no API keys required).

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd safetx-backend
npm install
```

### 2. Configure Environment

The `.env.magicblock` file is already configured with public endpoints:

```env
ENV=development
SOLANA_RPC_URL=https://api.devnet.solana.com
MAGICBLOCK_ROUTER=https://devnet-router.magicblock.app
PORT=5000
METRICS_INTERVAL=2000
```

No changes needed! 🎉

### 3. Start the Server

**Option A: Using batch file (Windows)**
```bash
start-magicblock.bat
```

**Option B: Using node directly**
```bash
node magicblock-server.js
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### `GET /health`
Health check with system status and MagicBlock connectivity

**Example Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-10-19T12:00:00.000Z",
  "environment": "development",
  "magicblock": {
    "router": "https://devnet-router.magicblock.app",
    "routesAvailable": 5,
    "lastRefresh": "2025-10-19T12:00:00.000Z",
    "status": "connected"
  },
  "solana": {
    "rpc": "https://api.devnet.solana.com",
    "network": "devnet"
  },
  "sseClients": 2
}
```

### `GET /metrics`
Get current Solana metrics snapshot

**Example Response:**
```json
{
  "tps": 1250,
  "slot": 234567890,
  "blockTime": 1697712000,
  "slotTime": 0.42,
  "successRate": 98.5,
  "timestamp": 1697712000000,
  "magicblockStatus": "connected",
  "lastMagicBlockRoute": "https://node1.magicblock.app",
  "routesAvailable": 5
}
```

### `GET /metrics/stream`
**Server-Sent Events (SSE)** endpoint for real-time metric streaming

**Usage Example (JavaScript):**
```javascript
const eventSource = new EventSource('http://localhost:5000/metrics/stream');

eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  console.log('Real-time metrics:', metrics);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```

**Usage Example (curl):**
```bash
curl -N http://localhost:5000/metrics/stream
```

### `GET /metrics/history`
Get historical metrics (last 20 by default)

**Query Parameters:**
- `limit` - Number of records to return (default: 20, max: 100)

**Example:**
```bash
curl http://localhost:5000/metrics/history?limit=50
```

### `GET /magicblock/routes`
Get available MagicBlock Ephemeral Rollup routes

**Query Parameters:**
- `refresh=true` - Force refresh routes from router

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "routes": [
    "https://node1.magicblock.app",
    "https://node2.magicblock.app",
    "https://node3.magicblock.app"
  ],
  "lastRefresh": "2025-10-19T12:00:00.000Z",
  "router": "https://devnet-router.magicblock.app"
}
```

## 🔮 How It Works

1. **Route Discovery**: On startup, the server fetches available MagicBlock Ephemeral Rollup nodes from the public router using the `getRoutes` JSON-RPC method

2. **Metric Collection**: Every 2 seconds, the server:
   - Fetches real-time Solana devnet metrics (TPS, slot, block time, etc.)
   - Calculates derived metrics (success rate, slot time)
   - Stores metrics in history (last 100 records)

3. **MagicBlock Streaming**: Metrics are sent to a randomly selected MagicBlock ER node via JSON-RPC

4. **Real-time Broadcasting**: Connected SSE clients receive metrics instantly

5. **Route Refresh**: Routes are automatically refreshed every 5 minutes

## 🛠️ Technology Stack

- **Express.js** - Web server framework
- **@solana/web3.js** - Solana blockchain interaction
- **axios** - HTTP client for MagicBlock API
- **dotenv** - Environment variable management
- **Server-Sent Events (SSE)** - Real-time metric streaming

## 📊 Metrics Explained

| Metric | Description |
|--------|-------------|
| **TPS** | Transactions per second (calculated from recent blocks) |
| **Slot** | Current Solana slot number |
| **Block Time** | Unix timestamp of the current block |
| **Slot Time** | Time between consecutive blocks (in seconds) |
| **Success Rate** | Percentage of successful transactions |
| **MagicBlock Status** | Connection status to MagicBlock ER (`connected` or `error`) |

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test Metrics Endpoint
```bash
curl http://localhost:5000/metrics
```

### Test MagicBlock Routes
```bash
curl http://localhost:5000/magicblock/routes
```

### Test Real-time Streaming (SSE)
```bash
curl -N http://localhost:5000/metrics/stream
```

Press `Ctrl+C` to stop.

## 🔧 Configuration

All configuration is in `.env.magicblock`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `development` | Environment name |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `MAGICBLOCK_ROUTER` | `https://devnet-router.magicblock.app` | MagicBlock public router |
| `PORT` | `5000` | Server port |
| `METRICS_INTERVAL` | `2000` | Metric fetch interval (ms) |

## 🌐 Frontend Integration

### Fetch Current Metrics
```javascript
async function getMetrics() {
  const response = await fetch('http://localhost:5000/metrics');
  const metrics = await response.json();
  console.log(metrics);
}
```

### Real-time Updates with SSE
```javascript
const eventSource = new EventSource('http://localhost:5000/metrics/stream');

eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  updateDashboard(metrics);
};
```

### Fetch MagicBlock Routes
```javascript
async function getMagicBlockRoutes() {
  const response = await fetch('http://localhost:5000/magicblock/routes');
  const data = await response.json();
  console.log(`${data.count} routes available:`, data.routes);
}
```

## 🐛 Troubleshooting

### "No MagicBlock routes available"
- Check if `https://devnet-router.magicblock.app` is accessible
- Try manually refreshing routes: `curl http://localhost:5000/magicblock/routes?refresh=true`

### "Failed to fetch metrics"
- Verify Solana RPC URL is accessible: `curl https://api.devnet.solana.com`
- Check your internet connection

### SSE connection keeps disconnecting
- This is normal browser behavior for inactive tabs
- Implement reconnection logic in your frontend

## 📝 Logs

The server logs all activities to console:

```
✅ Fetched 5 MagicBlock routes
📊 [12:00:00] TPS: 1250, Slot: 234567890, MB: ✅
📡 SSE client connected (total: 2)
✅ Sent to MagicBlock ER [https://node1.magicblock.app]: { tps: 1250, slot: 234567890, status: 200 }
```

## 🚀 Production Deployment

For production, update `.env.magicblock`:

```env
ENV=production
PORT=5000
METRICS_INTERVAL=2000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

And use a process manager like PM2:

```bash
npm install -g pm2
pm2 start magicblock-server.js --name safetx-magicblock
pm2 logs safetx-magicblock
```

## 📚 Resources

- [MagicBlock Documentation](https://docs.magicblock.gg/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Server-Sent Events (SSE) Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## ❤️ Built With

- Solana Devnet
- MagicBlock Ephemeral Rollups
- Node.js + Express.js
- No authentication required - fully public!

---

**Happy streaming! 🎉**
