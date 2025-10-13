# 🚀 Quick Start Guide

## Option 1: Auto Start (Recommended for Windows)

Double-click `start-all.bat` to launch both backend and frontend automatically!

This will open 2 terminal windows:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

## Option 2: Manual Start

### Terminal 1 - Backend
```bat
cd safetx-backend
npm start
```

### Terminal 2 - Frontend
```bat
npm run dev
```

## Access the Dashboard

1. Open `http://localhost:5173` in your browser
2. Click **"Connect Phantom Wallet"**
3. Approve the connection
4. You'll see the dashboard with **live Solana devnet metrics**! 🎉

## Toggle Live Data

In the dashboard header, click the **📡 Live Data** button to switch between:
- **Live Data** - Real metrics from Solana devnet (requires backend running)
- **Mock Data** - Simulated data for testing

## Backend API Endpoints

Test the backend directly:

```bash
# Get metrics
curl http://localhost:5000/api/metrics

# Health check
curl http://localhost:5000/api/health

# Queue a transaction
curl -X POST http://localhost:5000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"tx_id":"test123","sender":"7Xk2p...9Bv3"}'

# Retry pending
curl -X POST http://localhost:5000/api/retry

# Flush queue
curl -X POST http://localhost:5000/api/flush
```

## Troubleshooting

### Backend won't start
- Make sure you ran `cd safetx-backend && npm install`
- Check if port 5000 is available

### Frontend shows "Backend Connection Error"
- Make sure the backend is running on port 5000
- Check the `.env` file has `VITE_API_URL=http://localhost:5000`

### No wallet detected
- Install Phantom wallet browser extension
- Make sure you're using a Chromium-based browser (Chrome, Edge, Brave)

## Development Tips

- Backend auto-fetches metrics every time `/api/metrics` is called
- Frontend refreshes metrics every 5 seconds when Live Data is enabled
- Use Mock Data mode for faster UI development
- Check browser console and terminal logs for debugging
