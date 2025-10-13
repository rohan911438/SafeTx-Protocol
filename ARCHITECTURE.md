# SafeTx Protocol - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                  │
│                   (Phantom Wallet)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Connect Wallet
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Landing Page (Marketing)                              │ │
│  │  - Features, Pricing, FAQ                              │ │
│  │  - Phantom Connect Button                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                    │
│                         │ After Connect → /dashboard         │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Dashboard (Protected Route)                           │ │
│  │  - Health Score                                        │ │
│  │  - SafeTx Control Panel                                │ │
│  │  - Metrics Cards (TPS, Success Rate, etc.)             │ │
│  │  - Charts & Timeline                                   │ │
│  │  - Transaction Table                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests (fetch)
                         │ /api/metrics (GET)
                         │ /api/queue (POST)
                         │ /api/retry (POST)
                         │ /api/flush (POST)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Endpoints                                         │ │
│  │  - GET  /api/metrics   → Fetch live metrics            │ │
│  │  - GET  /api/queue     → View queue status             │ │
│  │  - POST /api/queue     → Add transaction to queue      │ │
│  │  - POST /api/retry     → Retry pending transactions    │ │
│  │  - POST /api/flush     → Clear queue                   │ │
│  │  - GET  /api/health    → Health check                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Metrics Calculation Logic                             │ │
│  │  - calculateTPS() - Average tx across recent blocks    │ │
│  │  - getSlotTime() - Time between slots                  │ │
│  │  - getSuccessRate() - % of successful transactions     │ │
│  │  - getCurrentLeader() - Current validator leader       │ │
│  │  - getRecentTransactions() - Latest block txs          │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  In-Memory State                                       │ │
│  │  - transactionQueue[] - Queued transactions            │ │
│  │  - retryCount - Number of retry attempts               │ │
│  │  - tpsHistory[] - Recent TPS values (chart)            │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ @solana/web3.js SDK
                         │ connection.getSlot()
                         │ connection.getBlock()
                         │ connection.getBlockTime()
                         │ connection.getLeaderSchedule()
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              SOLANA DEVNET RPC                               │
│           https://api.devnet.solana.com                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - Current slot number                                 │ │
│  │  - Block data with transactions                        │ │
│  │  - Block timestamps                                    │ │
│  │  - Leader schedule                                     │ │
│  │  - Network state                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Connects Wallet
```
User clicks "Connect" 
  → Phantom wallet popup
  → User approves
  → Public key stored in localStorage
  → Redirect to /dashboard
```

### 2. Dashboard Loads Live Metrics
```
Dashboard mounts
  → useEffect triggers fetchMetrics()
  → fetch('http://localhost:5000/api/metrics')
  → Backend calls Solana RPC
  → Backend calculates TPS, success rate, etc.
  → Returns JSON response
  → Frontend updates state
  → UI re-renders with live data
```

### 3. User Retries Transactions
```
User clicks "Retry Pending"
  → handleRetryNow() calls retryPendingTransactions()
  → POST /api/retry
  → Backend increments retry count
  → Backend clears queue
  → Returns updated counts
  → Frontend shows toast notification
  → Metrics refresh automatically
```

### 4. Auto-Refresh Cycle
```
Every 5 seconds:
  → fetchMetrics()
  → Backend fetches latest Solana data
  → Frontend updates dashboard
  → Charts animate with new data
  → Health score recalculates
```

## Technology Choices

### Frontend
| Tech | Why |
|------|-----|
| **React** | Component-based UI, large ecosystem |
| **TypeScript** | Type safety, better DX |
| **Vite** | Fast dev server, optimized builds |
| **Tailwind CSS** | Utility-first styling, fast iteration |
| **shadcn/ui** | Beautiful pre-built components |
| **Recharts** | Declarative charts, React-first |

### Backend
| Tech | Why |
|------|-----|
| **Node.js** | JavaScript everywhere, async I/O |
| **Express.js** | Simple, minimal web framework |
| **@solana/web3.js** | Official Solana SDK |
| **CORS** | Allow frontend to fetch from backend |

### Blockchain
| Tech | Why |
|------|-----|
| **Solana Devnet** | Free testnet, real-world conditions |
| **RPC API** | Direct access to blockchain state |

## Key Features

### 1. Real-Time Metrics
- TPS calculated from recent blocks (average tx count × blocks/sec)
- Slot time measured between consecutive block timestamps
- Success rate = successful txs / total txs in latest block
- Current leader from validator schedule
- Recent transactions from latest block

### 2. Network Health Score
Composite algorithm:
```javascript
tpsNorm = min(tps / 1500, 1)              // 40% weight
successNorm = min(successRate / 100, 1)   // 40% weight
slotNorm = 1 - (slotTime - 0.4)           // 20% weight
penalty = min(queueSize / 20, 0.25)       // Queue penalty
score = (tpsNorm × 0.4 + successNorm × 0.4 + slotNorm × 0.2 - penalty) × 100
```

### 3. Transaction Queue
- In-memory storage (future: Redis/database)
- POST /api/queue to add transactions
- Retry mechanism clears queue and increments counter
- Flush removes all without retry

### 4. Wallet-Gated Access
- Landing page is public
- Dashboard requires connected Phantom wallet
- Wallet public key displayed in header
- RequireWallet HOC checks localStorage

## Future Enhancements

### Phase 2 (Post-MVP)
- [ ] Persistent queue with Redis/PostgreSQL
- [ ] WebSocket for real-time push updates
- [ ] Historical data storage and analysis
- [ ] Alert system (email/webhook on congestion)
- [ ] Multi-wallet support (Solflare, Backpack)

### Phase 3 (Production)
- [ ] On-chain program for queue management
- [ ] Smart transaction routing based on leader
- [ ] Gas fee optimization
- [ ] Transaction priority system
- [ ] Analytics dashboard with historical trends

### Phase 4 (SDK)
- [ ] npm package for developers
- [ ] React hooks library
- [ ] TypeScript SDK
- [ ] Documentation site
- [ ] Sample integrations

## Security Considerations

✅ **Current:**
- CORS configured (frontend can access backend)
- No sensitive data in localStorage (only public key)
- Input validation on API endpoints
- Error handling with try-catch

⚠️ **For Production:**
- Add rate limiting (prevent API abuse)
- Implement API authentication (JWT tokens)
- Use HTTPS for all requests
- Add request signing for queue operations
- Database encryption for stored transactions
- Security audit of smart contracts

## Performance Optimization

### Backend
- Connection pooling for RPC calls
- Cache leader schedule (changes infrequently)
- Batch block fetches for TPS calculation
- Implement request debouncing

### Frontend
- Lazy load components
- Memoize expensive calculations
- Virtual scrolling for transaction table
- Optimize re-renders with React.memo

## Deployment

### Backend
```bash
# Option 1: VPS (DigitalOcean, AWS EC2)
npm run build  # If using TypeScript
node server.js
# Use PM2 for process management

# Option 2: Serverless (Vercel, Railway)
# Deploy via Git push
```

### Frontend
```bash
# Option 1: Static hosting (Vercel, Netlify)
npm run build
# Deploy dist/ folder

# Option 2: IPFS (decentralized)
npm run build
ipfs add -r dist/
```

## Monitoring

Recommended tools:
- **Backend:** Logtail, Sentry
- **Frontend:** Sentry, Google Analytics
- **Uptime:** UptimeRobot, Pingdom
- **RPC:** Custom health checks

## Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| Backend VPS | $5-10 (1GB RAM) |
| Frontend Hosting | $0 (Vercel free tier) |
| Solana RPC | $0 (devnet is free) |
| Domain | $10/year |
| **Total** | **~$5-10/month** |

---

Built with ❤️ for Solana builders
