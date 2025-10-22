# SafeTx Backend

Real-time Solana testnet metrics API for the SafeTx Protocol dashboard.

## Features

✅ **Live Solana Metrics**
- TPS (Transactions Per Second) calculated from recent blocks
- Slot time monitoring
- Transaction success rate tracking
- Current slot and leader information
- Network health status (green/yellow/red)

✅ **Transaction Queue Management**
- Queue transactions with metadata
- Retry mechanism for pending transactions
- Flush queue functionality
- Track retry counts

✅ **Server-Sent Events (SSE)**
- Real-time streaming of metrics via `/api/events/stream`
- Automatic updates every 2 seconds
- Compatible with EventSource API

✅ **Optional API Key Authentication**
- Secure your API with optional API_KEY environment variable
- Support for both header (`x-api-key`) and query param (`?key=`) auth

✅ **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | Get real-time Solana metrics |
| `/api/queue` | GET | View current transaction queue |
| `/api/queue` | POST | Add transaction to queue |
| `/api/retry` | POST | Retry all pending transactions |
| `/api/flush` | POST | Flush transaction queue |
| `/api/health` | GET | Health check endpoint (no auth required) |
| `/api/events/stream` | GET | SSE stream of live metrics (text/event-stream) |

## Installation

```bash
cd safetx-backend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `safetx-backend` directory (optional):

```env
# Server Configuration
PORT=5000                           # Default: 5000

# Optional: API Key Authentication
# If set, clients must include x-api-key header or ?key= query param
API_KEY=your-secret-api-key-here    # Optional, leave empty for no auth

# Solana RPC (uses devnet by default)
SOLANA_RPC=https://api.devnet.solana.com
```

### API Key Setup

**Option 1: No Authentication (Development)**
```bash
# Just run the server - no API key needed
node server.js
```

**Option 2: With API Key (Production)**
```bash
# Set API_KEY environment variable
API_KEY=my-secret-key-12345 node server.js

# Or use .env file
echo "API_KEY=my-secret-key-12345" > .env
node server.js
```

When API_KEY is set, clients must authenticate:
- **HTTP Header**: `x-api-key: your-key-here`
- **Query Param** (SSE only): `?key=your-key-here`

## Run the Backend

**Development mode (no auth):**
```bash
npm start
# or
node server.js
```

**Production mode (with API key):**
```bash
API_KEY=your-secret-key node server.js
# or set in .env file
```

The server will start on `http://localhost:5000`

## API Usage Examples

### Without API Key (Local Development)

**Get Metrics:**
```bash
curl http://localhost:5000/api/metrics
```

**SSE Stream:**
```bash
curl http://localhost:5000/api/events/stream
```

### With API Key (Production)

**Get Metrics:**
```bash
curl -H "x-api-key: your-secret-key" \
  http://localhost:5000/api/metrics
```

**SSE Stream:**
```bash
# Option 1: Query parameter (recommended for EventSource)
curl "http://localhost:5000/api/events/stream?key=your-secret-key"

# Option 2: Header (works with curl, not EventSource)
curl -H "x-api-key: your-secret-key" \
  http://localhost:5000/api/events/stream
```

**JavaScript Client:**
```javascript
// Without API key
const eventSource = new EventSource('http://localhost:5000/api/events/stream');

// With API key (use query param)
const eventSource = new EventSource(
  'http://localhost:5000/api/events/stream?key=your-secret-key'
);

eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  console.log('Live metrics:', metrics);
};
```

### Response Format
```json
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
  "recent_transactions": [...]
}
```

### Queue a Transaction
```bash
curl -X POST http://localhost:5000/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "tx_id": "4Ghs1..K7X",
    "sender": "7Xk2p...9Bv3",
    "type": "Transfer",
    "fee": "0.000005 SOL"
  }'
```

### Retry Pending Transactions
```bash
curl -X POST http://localhost:5000/api/retry
```

### Flush Queue
```bash
curl -X POST http://localhost:5000/api/flush
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `API_KEY` - Optional API key to secure endpoints. If set, send `x-api-key: <key>`. For SSE, you may also pass `?key=<key>` in the query string (useful with EventSource).

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **@solana/web3.js** - Solana SDK
- **CORS** - Cross-origin resource sharing

## Network Configuration

Currently connected to **Solana Devnet**. To switch networks, modify the connection in `server.js`:

```javascript
// For mainnet-beta:
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// For testnet:
const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

// For devnet (default):
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
```

## Notes

- Metrics are fetched in real-time from Solana devnet RPC
- TPS is calculated by averaging transactions across recent blocks
- Queue and retry functionality is stored in-memory (not persisted)
- For production, consider adding a database for queue persistence
 - Unified SSE stream is available at `/api/events/stream` for a push model.
