# 🧪 Testing Guide - SafeTx Frontend & Backend Integration

## Pre-Flight Checklist

Before testing, ensure:
- ✅ Node.js 18+ installed
- ✅ Phantom wallet extension installed
- ✅ All dependencies installed (`npm install` in root and `safetx-backend/`)
- ✅ `.env` file exists with `VITE_API_URL=http://localhost:5000`

---

## Test Scenario 1: Backend Running (Live Data)

### 1. Start Backend
```bash
cd safetx-backend
node server.js
```

**Expected Output:**
```
🚀 SafeTx Backend running on http://localhost:5000
📊 Metrics endpoint: http://localhost:5000/api/metrics
❤️  Health check: http://localhost:5000/api/health
```

### 2. Verify Backend Endpoints

**Test Metrics Endpoint:**
```bash
curl http://localhost:5000/api/metrics
```

**Expected Response:**
```json
{
  "tps": 1243,
  "slot_time": 0.42,
  "success_rate": 98.4,
  "queue_size": 0,
  "retry_count": 0,
  "latest_slot": 245789235,
  "current_leader": "Val8x...K2p",
  "network_status": "green",
  "tps_history": [1200, 1150, ...],
  "recent_transactions": [...]
}
```

**Test Health Endpoint:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 42.5,
  "timestamp": "2025-10-13T..."
}
```

### 3. Start Frontend
```bash
# In new terminal
npm run dev
```

### 4. Open Dashboard

Navigate to: `http://localhost:5173`

**Landing Page Tests:**
- ✅ Page loads without errors
- ✅ "Connect Phantom Wallet" button visible
- ✅ All sections render (Hero, Features, Pricing, FAQ)

**Connect Wallet:**
- ✅ Click "Connect Phantom Wallet"
- ✅ Phantom popup appears
- ✅ Approve connection
- ✅ Redirects to `/dashboard`

### 5. Dashboard UI Tests

**Top Bar:**
- ✅ Shows "SafeTx Dashboard" title
- ✅ Shows "LIVE" badge with green pulsing dot
- ✅ Shows "📡 Live Data" button (highlighted)
- ✅ Shows "Health XX/100" score
- ✅ Shows wallet address (short format)

**Status Banner:**
- ✅ Shows network status (Green/Yellow/Red)
- ✅ Appropriate message displayed

**SafeTx Control Panel:**
- ✅ Queue Size displays (number)
- ✅ Retry Count displays (number)
- ✅ Latest Slot displays (formatted)
- ✅ Current Leader displays (short format)
- ✅ Auto-Retry toggle works
- ✅ "Retry Pending" button enabled
- ✅ "Flush Queue" button enabled

**Metrics Cards:**
- ✅ TPS card shows live value
- ✅ Slot Time card shows live value
- ✅ Success Rate card shows live percentage
- ✅ Queue card shows live count
- ✅ Cards update every 5 seconds

**Charts:**
- ✅ TPS chart updates with live data
- ✅ Success rate line animates
- ✅ Timeline shows recent events

**Transactions Table:**
- ✅ Shows recent transactions
- ✅ Transaction IDs display
- ✅ Status badges show (queued/processed/failed)
- ✅ Timestamps display

### 6. Interactive Tests

**Toggle Live/Mock Data:**
- ✅ Click "📡 Live Data" button
- ✅ Changes to "🔄 Mock Data"
- ✅ "LIVE" badge disappears
- ✅ Data stops updating from backend
- ✅ Click again to re-enable live data
- ✅ Toast shows "✅ Backend Connected"

**Retry Pending Transactions:**
- ✅ Click "Retry Pending" button
- ✅ Toast notification appears: "Transactions Retried"
- ✅ Retry count increases
- ✅ Queue size decreases to 0
- ✅ Metrics refresh automatically

**Flush Queue:**
- ✅ Click "Flush Queue" button
- ✅ Toast notification appears: "Queue Flushed"
- ✅ Queue size becomes 0
- ✅ Metrics refresh automatically

### 7. Auto-Refresh Test

**Watch for 30 seconds:**
- ✅ "Updating..." appears briefly
- ✅ Metrics change every 5 seconds
- ✅ TPS fluctuates (based on Solana devnet)
- ✅ Latest slot increments
- ✅ No console errors

---

## Test Scenario 2: Backend NOT Running (Mock Data Fallback)

### 1. Stop Backend
```bash
# Ctrl+C in backend terminal
```

### 2. Reload Dashboard
```bash
# In browser: Ctrl+R (or F5)
```

**Expected Behavior:**
- ✅ Shows "DISCONNECTED" badge
- ✅ Error banner appears at top
- ✅ Error message: "Backend Connection Error"
- ✅ Shows code snippet to start backend
- ✅ "Retry" button visible in error banner
- ✅ Dashboard continues showing last cached data

### 3. Click "Retry" Button
- ✅ Attempts to reconnect
- ✅ Shows "Updating..." briefly
- ✅ Error persists (backend still offline)

### 4. Switch to Mock Data
- ✅ Click "📡 Live Data" to switch to "🔄 Mock Data"
- ✅ Error banner disappears
- ✅ "DISCONNECTED" badge disappears
- ✅ Dashboard uses mock data from `mockMetrics.json`

---

## Test Scenario 3: Backend Crashes During Use

### 1. Start Both Servers
```bash
# Backend
cd safetx-backend && node server.js

# Frontend
npm run dev
```

### 2. Open Dashboard
- ✅ Connect wallet
- ✅ Verify "LIVE" badge shows
- ✅ Metrics updating every 5 seconds

### 3. Kill Backend
```bash
# In backend terminal: Ctrl+C
```

### 4. Wait 5 Seconds

**Expected Behavior:**
- ✅ "DISCONNECTED" badge appears
- ✅ Error banner appears
- ✅ Console shows error: "Failed to fetch metrics"
- ✅ Last fetched data still displayed
- ✅ No page crash or blank screen

### 5. Restart Backend
```bash
cd safetx-backend && node server.js
```

### 6. Wait 5 Seconds

**Expected Behavior:**
- ✅ Auto-reconnects on next refresh cycle
- ✅ "LIVE" badge reappears
- ✅ Error banner disappears
- ✅ Toast shows: "✅ Backend Connected"
- ✅ Metrics resume updating

---

## Browser Console Tests

### Open DevTools (F12)

**Console Tab:**
- ✅ No red errors (except during offline test)
- ✅ Logs show: "Fetching Solana metrics..." (backend)
- ✅ Logs show: "✓ Metrics fetched: {...}" (backend)

**Network Tab:**
- ✅ Requests to `http://localhost:5000/api/metrics` every 5s
- ✅ Status: 200 OK (when backend running)
- ✅ Response contains valid JSON
- ✅ Response time: < 2s

**Application Tab:**
- ✅ localStorage has `safetx_pubkey` (after wallet connect)
- ✅ Value is wallet public key string

---

## Mobile Responsive Tests

### Resize Browser Window

**Desktop (>1024px):**
- ✅ All cards in grid layout
- ✅ Side-by-side components
- ✅ Full navigation visible

**Tablet (768-1024px):**
- ✅ Cards stack appropriately
- ✅ Charts remain readable
- ✅ No horizontal scroll

**Mobile (<768px):**
- ✅ Single column layout
- ✅ Top bar wraps gracefully
- ✅ Buttons accessible
- ✅ No text overflow

---

## Performance Tests

### Lighthouse Audit

Run in Chrome DevTools:
```
1. F12 → Lighthouse tab
2. Select "Desktop" or "Mobile"
3. Click "Analyze page load"
```

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### Memory Leaks

**Test for 5 minutes:**
- ✅ Memory usage stable (no continuous growth)
- ✅ No console warnings about re-renders
- ✅ Browser remains responsive

---

## Error Handling Tests

### 1. Invalid API Response

**Modify backend to return invalid JSON:**
```javascript
// In server.js /api/metrics
res.json({ invalid: "data" }); // Missing required fields
```

**Expected:**
- ✅ Error caught gracefully
- ✅ Error message shown
- ✅ No page crash

### 2. Network Timeout

**Throttle network in DevTools:**
```
1. F12 → Network tab
2. Set throttling to "Slow 3G"
3. Watch metrics load
```

**Expected:**
- ✅ Longer load times (acceptable)
- ✅ "Updating..." shows during fetch
- ✅ Eventually loads or shows error

### 3. CORS Error

**Wrong API URL in .env:**
```env
VITE_API_URL=http://wrong-domain.com
```

**Expected:**
- ✅ CORS error in console
- ✅ Error banner appears
- ✅ Suggests checking backend URL

---

## API Integration Tests

### Test All Endpoints

**1. GET /api/metrics**
```bash
curl http://localhost:5000/api/metrics | jq
```
✅ Returns metrics object

**2. POST /api/queue**
```bash
curl -X POST http://localhost:5000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"tx_id":"test123","sender":"ABC...XYZ"}' | jq
```
✅ Returns success with queue_size

**3. GET /api/queue**
```bash
curl http://localhost:5000/api/queue | jq
```
✅ Returns queue status

**4. POST /api/retry**
```bash
curl -X POST http://localhost:5000/api/retry | jq
```
✅ Returns retry count

**5. POST /api/flush**
```bash
curl -X POST http://localhost:5000/api/flush | jq
```
✅ Returns flushed count

**6. GET /api/health**
```bash
curl http://localhost:5000/api/health | jq
```
✅ Returns health status

---

## Troubleshooting Common Issues

### Issue: "Backend Connection Error"
**Solution:**
1. Check backend is running: `ps aux | grep node` (Mac/Linux) or Task Manager (Windows)
2. Verify port 5000 is free: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
3. Check `.env` has correct URL
4. Verify backend logs for errors

### Issue: "CORS Error"
**Solution:**
1. Ensure backend has `app.use(cors())`
2. Restart backend after changes
3. Clear browser cache (Ctrl+Shift+Del)

### Issue: Data Not Updating
**Solution:**
1. Check "Live Data" toggle is enabled
2. Verify backend terminal shows "Fetching Solana metrics..."
3. Check Network tab in DevTools for 200 responses
4. Ensure interval is set (should see requests every 5s)

### Issue: Wallet Won't Connect
**Solution:**
1. Install Phantom extension
2. Use Chrome, Edge, or Brave browser
3. Check Phantom is unlocked
4. Refresh page and try again

---

## Success Criteria Summary

All tests must pass for production readiness:

- ✅ Backend starts without errors
- ✅ All 6 API endpoints respond correctly
- ✅ Frontend connects to backend automatically
- ✅ Live data updates every 5 seconds
- ✅ Toggle between Live/Mock works
- ✅ Error handling graceful (no crashes)
- ✅ Auto-reconnect after backend restart
- ✅ Wallet connection works
- ✅ Retry and Flush buttons functional
- ✅ Mobile responsive
- ✅ No console errors during normal operation
- ✅ Performance acceptable (<2s load time)

---

**✨ If all tests pass, your SafeTx integration is production-ready!**
