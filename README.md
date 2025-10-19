# SafeTx Protocol — Solana Network Reliability Dashboard

SafeTx is a testnet-focused Solana dashboard that detects network congestion, monitors transaction reliability, and showcases a retry/queue mechanism designed to improve UX during heavy load.

This repo contains both the **frontend dashboard** (React + Tailwind + shadcn + Recharts) and the **backend API** (Node.js + Express + @solana/web3.js) that fetches real-time metrics from Solana devnet.

## Core Components

- **Backend API** (safetx-backend/) — Node.js server that fetches real Solana testnet metrics via RPC
- **Network Monitor** — Real-time TPS, slot time, success rate, queue size tracking
- **Smart Contract Layer** — Represented conceptually by queued tx metadata and leader/slot visuals
- **Frontend Dashboard** (src/) — Health indicator, queue size, retry count, latest slots, validator stats, charts
- **SafeTx SDK** — Modeled via Auto-Retry toggle and Retry/Flush actions

## MVP Features (Hackathon-ready)

- ✅ **Live Solana Devnet Metrics** (via backend API)
- ✅ Network Health Indicator (green/yellow/red) and Health Score 0–100
- ✅ Live metrics: TPS, Slot Time, Success Rate, Queue Size
- ✅ SafeTx Control Panel: Auto-Retry toggle, Retry Pending, Flush Queue
- ✅ Block Monitor and Validator Stats
- ✅ Transaction Explorer with filtering and statuses (processed/queued/failed)
- ✅ Activity Timeline and composite analytics charts
- ✅ Transaction Queue API endpoints
- ✅ Toggle between Live and Mock data

## Tech Stack

**Frontend:**
- Vite, TypeScript, React
- Tailwind CSS, shadcn/ui
- Recharts

**Backend:**
- Node.js, Express.js
- @solana/web3.js
- CORS

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Phantom wallet browser extension (for dashboard access)

### Optional: MagicBlock Streaming (SSE)
To enable real-time streaming from the MagicBlock server, ensure:

1) MagicBlock server is running
	- Open a terminal:
	  - cd safetx-backend
	  - node magicblock-server.js
	- Default port is 5001 (configured in `safetx-backend/.env.magicblock`)

2) Frontend knows the MagicBlock URL
	- Root `.env` contains:
	  - VITE_MAGICBLOCK_URL=http://localhost:5001

3) In the dashboard, toggle the “SSE ON/OFF” button in the top bar
	- When ON, the dashboard streams metrics via Server-Sent Events from `/metrics/stream`

### 1️⃣ Install Frontend Dependencies

```bat
npm i
```

### 2️⃣ Install Backend Dependencies

```bat
cd safetx-backend
npm install
cd ..
```

### 3️⃣ Start the Backend Server

Open a **new terminal** and run:

```bat
cd safetx-backend
npm start
```

The backend will start on `http://localhost:5000`

### 4️⃣ Start the Frontend

In your **main terminal**, run:

```bat
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5️⃣ Access the Dashboard

1. Navigate to `http://localhost:5173`
2. Click "Connect Phantom Wallet"
3. Approve the connection
4. You'll be redirected to `/dashboard` with **live Solana devnet metrics**!

## API Endpoints

The backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | Get real-time Solana metrics |
| `/api/queue` | GET | View current transaction queue |
| `/api/queue` | POST | Add transaction to queue |
| `/api/retry` | POST | Retry all pending transactions |
| `/api/flush` | POST | Flush transaction queue |
| `/api/health` | GET | Health check endpoint |

See `safetx-backend/README.md` for detailed API documentation.

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

## Build for Production

**Frontend:**
```bat
npm run build
npm run preview
```

**Backend:**
```bat
cd safetx-backend
npm start
```

## 🧪 Testing & Verification

**Quick Health Check:**
```bash
# 1. Test backend
curl http://localhost:5000/api/health

# 2. Test metrics endpoint
curl http://localhost:5000/api/metrics

# 3. Access frontend
# Open http://localhost:5173 and connect wallet
```

**Comprehensive Testing:**
- See `TESTING.md` for full test suite
- See `ALIGNMENT_VERIFICATION.md` for frontend-backend alignment verification

**Expected Behavior:**
- ✅ "LIVE" badge appears when backend connected
- ✅ "DISCONNECTED" badge appears when backend offline
- ✅ Metrics update every 5 seconds
- ✅ Toggle between Live/Mock data works
- ✅ Retry and Flush buttons functional

## Notes

- Metrics are simulated in the UI and driven from `src/data/mockMetrics.json` plus periodic random updates.
- The SafeTx panel shows queue size, retry count, latest slot, and current leader with interactive controls.
- To integrate with a real off-chain monitor or Anchor program, replace the mock data and update the state logic in `src/pages/Index.tsx`.

## Folder Structure

- `src/pages/Index.tsx` — main dashboard
- `src/components/SafeTxPanel.tsx` — SafeTx controls and status
- `src/components/*` — reusable cards, charts, tables
- `src/data/mockMetrics.json` — initial mock metrics
