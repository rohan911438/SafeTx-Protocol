# SafeTx Protocol - Visual Overview

## 🎯 System Overview

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

## 📊 Dashboard Features

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

## 🔄 API Request Flow

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

## 🎮 User Actions Flow

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

## 📁 Project Structure

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

## 🔢 Metrics Calculation Explained

### TPS (Transactions Per Second)

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

### Success Rate

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

### Network Status

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

### Health Score (Composite)

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

## 🎨 Color Coding

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

## 📊 Performance Metrics

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

## 🚦 Development Workflow

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

---

**Built with ❤️ for Solana developers**
