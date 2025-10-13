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

✅ **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | Get real-time Solana metrics |
| `/api/queue` | GET | View current transaction queue |
| `/api/queue` | POST | Add transaction to queue |
| `/api/retry` | POST | Retry all pending transactions |
| `/api/flush` | POST | Flush transaction queue |
| `/api/health` | GET | Health check endpoint |

## Installation

```bash
cd safetx-backend
npm install
```

## Run the Backend

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Usage Examples

### Get Metrics
```bash
curl http://localhost:5000/api/metrics
```

Response:
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
