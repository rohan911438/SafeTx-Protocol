# SafeTx Protocol — Solana Network Reliability Dashboard

SafeTx is a testnet-focused Solana dashboard that detects network congestion, monitors transaction reliability, and showcases a retry/queue mechanism designed to improve UX during heavy load.

This repo contains both the **frontend dashboard** (React + Tailwind + shadcn + Recharts) and the **backend API** (Node.js + Express + @solana/web3.js) that fetches real-time metrics from Solana devnet.

## 🚀 For Developers & Companies

Want to integrate SafeTx metrics into your app? Check out our guides:

- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - How to get API keys and start integrating
- **[API Reference](./docs/API.md)** - Complete endpoint documentation
- **[OpenAPI Spec](./docs/openapi.yaml)** - Machine-readable API specification
- **[TypeScript SDK](./packages/safetx-client/README.md)** - Official JavaScript/TypeScript client

**Quick Start:**
```bash
npm install @safetx/client
```

```typescript
import { SafeTxApiClient } from '@safetx/client';
const client = new SafeTxApiClient({ baseURL: 'http://localhost:5000' });
const metrics = await client.getMetrics();
```

---

## Deployed Addresses (Devnet)

- Program ID: `GHurqnc1CCe9NaBvwvWgBz3qmRP9rePDxNwf5eEgqCD`
- Admin Wallet (PDA authority): `FUaf11NppCyRCCQtHAEaG8Q11KQnE8SJzbebrWnc6P1M`
- Cluster: `devnet` (RPC: https://api.devnet.solana.com)

Quick start with Phantom (devnet):

```bat
:: Connect Phantom in the app, then you can initialize and push directly from the UI
:: Or run the client from terminal using your local keypair

:: Initialize the registry PDA (admin = your wallet)
npm run sol:program:init:devnet

:: Push a sample metric into the on-chain ring buffer
npm run sol:program:push:devnet

:: (Optional) Check your balance on devnet
npm run sol:balance:me:devnet
```

Environment overrides (optional):

```env
VITE_SAFETX_PROGRAM_ID=GHurqnc1CCe9NaBvwvWgBz3qmRP9rePDxNwf5eEgqCD
VITE_SOLANA_RPC=https://api.devnet.solana.com
```

See the full on-chain program notes in `contracts/solana/README.md`.

## Visual Overview

For a diagram of the system and data flow, see:

- DIAGRAMS.md → “SafeTx Protocol - Visual Overview”

This shows the user journey, dashboard layout, API request flow, and performance targets.

---

## Appendix: Visual Diagrams (Embedded)

### SafeTx Protocol - Visual Overview

#### 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SAFETX PROTOCOL                                 │
│                    Solana Network Reliability Dashboard                  │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────┐
│         USER JOURNEY              │
├───────────────────────────────────┤
│                                   │
│  1. Visit Landing Page            │
│  2. Read Features & Pricing       │
│  3. Connect Phantom Wallet        │
│  4. Redirected to Dashboard       │
│  5. View Live Solana Metrics      │
│  6. Manage Transaction Queue      │
│                                   │
└───────────────────────────────────┘
```

#### 📊 Dashboard Features

```
╔═══════════════════════════════════════════════════════════════╗
║                    SAFETX DASHBOARD                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  📡 Live Data    Health 87/100    Wallet: Ab3x...K2p    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  ✅ Network Healthy                                      │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │  SafeTx Control Panel                                  │   ║
║  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │   ║
║  │  │Queue │ │Retry │ │ Slot │ │Leader│                  │   ║
║  │  │  2   │ │  0   │ │245.7M│ │Val8x │                  │   ║
║  │  └──────┘ └──────┘ └──────┘ └──────┘                  │   ║
║  │  [🔄 Retry Pending]  [🗑️ Flush Queue]                 │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ║
║  │   TPS    │ │Slot Time │ │ Success  │ │  Queue   │        ║
║  │  1,243   │ │ 0.42s    │ │  98.4%   │ │    2     │        ║
║  │  ⚡      │ │  ⏱️     │ │   ✅     │ │   📦     │        ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         📈 TPS & Success Rate Chart                      │  ║
║  │  1400 ┤              ╭──╮                               │  ║
║  │  1200 ┤         ╭────╯  ╰──╮                            │  ║
║  │  1000 ┤    ╭────╯          ╰──╮                         │  ║
║  │   800 ┤╭───╯                  ╰──                       │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  📋 Recent Transactions                                  │  ║
║  │  4Ghs1..K7X  | Queued    | 12:45:20 | Transfer          │  ║
║  │  5Nxy3..T2A  | Processed | 12:44:15 | Smart Contract    │  ║
║  │  9Zae7..L0F  | Queued    | 12:43:02 | Transfer          │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
```

#### 🔄 API Request Flow

```
┌─────────────┐
│  Dashboard  │
│  (Frontend) │
└──────┬──────┘
		 │
		 │ fetch('http://localhost:5000/api/metrics')
		 │ Every 5 seconds
		 ↓
┌──────────────────────────────────────────────────┐
│          Backend Server (Express)                │
│  ┌────────────────────────────────────────────┐  │
│  │  API Endpoints                             │  │
│  │  • GET  /api/metrics  → Live metrics       │  │
│  │  • POST /api/queue    → Add to queue       │  │
│  │  • POST /api/retry    → Retry pending      │  │
│  │  • POST /api/flush    → Clear queue        │  │
│  └────────────────────────────────────────────┘  │
│                     │                            │
│                     ↓                            │
│  ┌────────────────────────────────────────────┐  │
│  │  Solana Web3.js Client                     │  │
│  │  • connection.getSlot()                    │  │
│  │  • connection.getBlock(slot)               │  │
│  │  • connection.getBlockTime(slot)           │  │
│  │  • connection.getLeaderSchedule()          │  │
│  └────────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────────┘
						  │
						  │ HTTPS
						  ↓
┌────────────────────────────────────────────────────┐
│         Solana Devnet RPC                          │
│         https://api.devnet.solana.com              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Current slot: 245,789,235                   │  │
│  │  Latest block: [248 transactions]            │  │
│  │  Block time: 1679234567                      │  │
│  │  Leader: Val8x...K2p                         │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
						  │
						  │ Response
						  ↓
┌────────────────────────────────────────────────────┐
│  Backend Calculates:                               │
│  • TPS = avg(txCount) × 2.5 blocks/sec = 1,243    │
│  • Slot time = blockTime[n] - blockTime[n-1] = 0.42│
│  • Success = (success/total) × 100 = 98.4%        │
│  • Status = tps>1000 ? 'green' : 'yellow'/'red'   │
└────────────────────┬───────────────────────────────┘
							│
							│ JSON Response
							↓
┌────────────────────────────────────────────────────┐
│  {                                                 │
│    "tps": 1243,                                    │
│    "slot_time": 0.42,                              │
│    "success_rate": 98.4,                           │
│    "queue_size": 2,                                │
│    "retry_count": 0,                               │
│    "latest_slot": 245789235,                       │
│    "current_leader": "Val8x...K2p",                │
│    "network_status": "green",                      │
│    "tps_history": [1200, 1150, 1300, ...],         │
│    "recent_transactions": [...]                    │
│  }                                                 │
└────────────────────┬───────────────────────────────┘
							│
							│ setState(metrics)
							↓
┌────────────────────────────────────────────────────┐
│  Dashboard UI Updates:                             │
│  ✅ Metrics cards refresh                          │
│  ✅ Charts animate with new data                   │
│  ✅ Health score recalculates                      │
│  ✅ Transaction table updates                      │
│  ✅ Network status banner changes                  │
└────────────────────────────────────────────────────┘
```

#### 🎮 User Actions Flow

```
┌────────────────────────────────────────────────────────────┐
│  User clicks "Retry Pending"                               │
└──────────────────────────┬─────────────────────────────────┘
									│
									↓
┌────────────────────────────────────────────────────────────┐
│  handleRetryNow() → fetch('POST /api/retry')               │
└──────────────────────────┬─────────────────────────────────┘
									│
									↓
┌────────────────────────────────────────────────────────────┐
│  Backend:                                                  │
│  • retryCount += queueSize                                 │
│  • queueSize = 0                                           │
│  • return { success: true, retry_count: X }                │
└──────────────────────────┬─────────────────────────────────┘
									│
									↓
┌────────────────────────────────────────────────────────────┐
│  Frontend:                                                 │
│  • Show toast: "Transactions Retried"                      │
│  • Fetch fresh metrics                                     │
│  • Update UI with new counts                               │
└────────────────────────────────────────────────────────────┘
```

#### 📁 Project Structure

```
neon-solana-watch/
├── 📄 Frontend Files
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx         → Marketing page
│   │   │   └── Index.tsx           → Dashboard (updated with API)
│   │   ├── components/
│   │   │   ├── SafeTxPanel.tsx     → Queue controls
│   │   │   ├── MetricsCard.tsx     → Metric display
│   │   │   └── [other components]
│   │   └── lib/
│   │       ├── api.ts              → ⭐ API service (NEW)
│   │       └── wallet.ts           → Phantom wallet utils
│   ├── .env                        → ⭐ API URL config (NEW)
│   └── package.json
│
├── 🖥️ Backend Files (NEW)
│   └── safetx-backend/
│       ├── server.js               → ⭐ Express server with all endpoints
│       ├── package.json            → Dependencies (express, @solana/web3.js, cors)
│       ├── README.md               → Backend documentation
│       └── .gitignore
│
├── 🚀 Helper Scripts (NEW)
│   ├── start-backend.bat           → Start backend only
│   └── start-all.bat               → Start both frontend & backend
│
└── 📚 Documentation (NEW)
	 ├── README.md                   → Updated with backend instructions
	 ├── QUICKSTART.md               → Quick start guide
	 ├── ARCHITECTURE.md             → System architecture & design
	 ├── DEPLOYMENT.md               → Production deployment guide
	 ├── IMPLEMENTATION_SUMMARY.md   → What we built summary
	 └── DIAGRAMS.md                 → This file (visual diagrams)
```

#### 🔢 Metrics Calculation Explained

##### TPS (Transactions Per Second)

```
Step 1: Fetch last 5 blocks
┌─────────────────────────────────────────────────┐
│ Block N:   248 transactions                     │
│ Block N-1: 312 transactions                     │
│ Block N-2: 195 transactions                     │
│ Block N-3: 267 transactions                     │
│ Block N-4: 223 transactions                     │
└─────────────────────────────────────────────────┘
				  ↓
Step 2: Average transactions per block
	Total = 1,245 transactions
	Average = 1,245 ÷ 5 = 249 tx/block
				  ↓
Step 3: Multiply by blocks per second
	Solana: ~2.5 blocks/second
	TPS = 249 × 2.5 = 622.5 ≈ 623
```

##### Success Rate

```
Step 1: Get latest block
┌─────────────────────────────────────────────────┐
│ Total transactions: 248                         │
│ Failed (meta.err): 4                            │
│ Successful: 244                                 │
└─────────────────────────────────────────────────┘
				  ↓
Step 2: Calculate percentage
	Success Rate = (244 ÷ 248) × 100 = 98.4%
```

##### Network Status

```
TPS Value         → Status
─────────────────────────────
> 1,000 TPS       → 🟢 Green (Healthy)
500 - 1,000 TPS   → 🟡 Yellow (Moderate Congestion)
< 500 TPS         → 🔴 Red (Severe Congestion)

Success Rate      → Adjustment
─────────────────────────────
< 95%             → Downgrade status by one level
```

##### Health Score (Composite)

```
┌─────────────────────────────────────────────┐
│  Component       Weight    Value   Score    │
├─────────────────────────────────────────────┤
│  TPS Normalized   40%      0.83    33.2    │
│  Success Rate     40%      0.98    39.2    │
│  Slot Time        20%      0.85    17.0    │
│  Queue Penalty    -        0.10   -10.0    │
├─────────────────────────────────────────────┤
│  Total Health Score                79.4    │
└─────────────────────────────────────────────┘

Where:
• TPS Norm = min(tps/1500, 1)
• Success Norm = successRate / 100
• Slot Norm = 1 - (slotTime - 0.4)
• Penalty = min(queueSize/20, 0.25)
```

#### 🎨 Color Coding

```
Health Score Ranges:
┌────────────────────────────────────────────┐
│  86-100  │ 🟢 Green   │ border-success     │
│  66-85   │ 🟡 Yellow  │ border-warning     │
│  0-65    │ 🔴 Red     │ border-destructive │
└────────────────────────────────────────────┘

Queue Size Severity:
┌────────────────────────────────────────────┐
│  0-4     │ 🟢 Normal  │ text-success       │
│  5-9     │ 🟡 Warning │ text-warning       │
│  10+     │ 🔴 Critical│ text-destructive   │
└────────────────────────────────────────────┘
```

#### 📊 Performance Metrics

```
┌───────────────────────────────────────────────────────┐
│  Metric                  │  Target  │  Current       │
├───────────────────────────────────────────────────────┤
│  Backend Response Time   │  <2s     │  ~500ms-2s     │
│  Frontend Initial Load   │  <3s     │  ~1-2s         │
│  Metric Refresh Interval │  5s      │  5s ✅         │
│  UI Update Time          │  <16ms   │  <16ms ✅      │
│  API Requests/min        │  12      │  12 ✅         │
└───────────────────────────────────────────────────────┘
```

#### 🚦 Development Workflow

```
┌──────────────────────────────────────────────────────┐
│  1. Clone Repo                                       │
│     git clone <repo-url>                             │
├──────────────────────────────────────────────────────┤
│  2. Install Dependencies                             │
│     npm install                                      │
│     cd safetx-backend && npm install                 │
├──────────────────────────────────────────────────────┤
│  3. Start Backend                                    │
│     cd safetx-backend                                │
│     node server.js                                   │
│     → Running on http://localhost:5000               │
├──────────────────────────────────────────────────────┤
│  4. Start Frontend (new terminal)                    │
│     npm run dev                                      │
│     → Running on http://localhost:5173               │
├──────────────────────────────────────────────────────┤
│  5. Open Browser                                     │
│     → http://localhost:5173                          │
│     → Connect Phantom                                │
│     → View Dashboard with Live Data!                 │
└──────────────────────────────────────────────────────┘
```

## Core Components

- **Backend API** (safetx-backend/) — Node.js server that fetches real Solana testnet metrics via RPC
- **Contracts** (contracts/solana) — SafeTx on-chain program with a PDA metrics registry and ring buffer
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
- ✅ Minimal on-chain integration for storing summarized metrics

## Tech Stack

**Frontend:**
- Vite, TypeScript, React
- Tailwind CSS, shadcn/ui
- Recharts

**Backend:**
## On-chain program quickstart

Build and deploy the Solana program (Windows-friendly):

1) Install Solana CLI (v1.18+), set to testnet, and ensure Rust toolchain is set up.
2) Build the program:

```
cd contracts/solana/safetx-program
cargo build-sbf
```

3) Deploy:

```
solana program deploy target/sbf-solana-solana/release/safetx_program.so
```

4) Use the helper client (replace SAFETX_PROGRAM_ID env var with your deployed program id):

```
set SAFETX_PROGRAM_ID=<YourProgramId>
npm run sol:program:init
npm run sol:program:push
```

The client uses your ~/.config/solana/id.json keypair.
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
2. Click "Connect Phantom Wallet" (or "Connect Wallet" in top bar)
3. Approve the connection
4. You'll be on `/dashboard` with **live Solana devnet metrics**!
5. Toggle "SSE ON" to switch to real-time streaming (via `/api/events/stream`)

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

For company integrations:
- Full API guide: `docs/API.md`
- OpenAPI spec: `docs/openapi.yaml`
- SDK (TypeScript): `packages/safetx-client` published as `@safetx/client`

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
