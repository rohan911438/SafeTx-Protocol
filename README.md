# SafeTx Protocol — Solana Network Reliability Dashboard

SafeTx is a testnet-focused Solana dashboard that detects network congestion, monitors transaction reliability, and showcases a retry/queue mechanism designed to improve UX during heavy load.

This repo contains the frontend dashboard portion of the stack (React + Tailwind + shadcn + Recharts). Off-chain services, Anchor programs, and SDK are out of scope for this UI demo but are represented in the UI via metrics and controls.

## Core Components

- Network Monitor (Off-Chain Service) — simulated via live-updating metrics (TPS, slot time, success rate, queue size)
- Smart Contract (Anchor Program) — represented conceptually by queued tx metadata and leader/slot visuals
- Frontend Dashboard (this repo) — health indicator, queue size, retry count, latest slots, validator stats, charts
- SafeTx SDK (Optional) — modeled via Auto-Retry toggle and Retry/Flush actions

## MVP Features (Hackathon-ready)

- Network Health Indicator (green/yellow/red) and Health Score 0–100
- Live metrics: TPS, Slot Time, Success Rate, Queue Size
- SafeTx Control Panel: Auto-Retry toggle, Retry Pending, Flush Queue
- Block Monitor and Validator Stats
- Transaction Explorer with filtering and statuses (processed/queued/failed)
- Activity Timeline and composite analytics charts

## Tech Stack

- Vite, TypeScript, React
- Tailwind CSS, shadcn/ui
- Recharts

## Getting Started

Prereqs: Node.js 18+ and npm

```bat
npm i
npm run dev
```

Build for production:

```bat
npm run build
npm run preview
```

## Notes

- Metrics are simulated in the UI and driven from `src/data/mockMetrics.json` plus periodic random updates.
- The SafeTx panel shows queue size, retry count, latest slot, and current leader with interactive controls.
- To integrate with a real off-chain monitor or Anchor program, replace the mock data and update the state logic in `src/pages/Index.tsx`.

## Folder Structure

- `src/pages/Index.tsx` — main dashboard
- `src/components/SafeTxPanel.tsx` — SafeTx controls and status
- `src/components/*` — reusable cards, charts, tables
- `src/data/mockMetrics.json` — initial mock metrics
