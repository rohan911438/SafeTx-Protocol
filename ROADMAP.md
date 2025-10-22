# SafeTx — Product Vision, Value, and Roadmap

SafeTx is a Solana reliability layer: it helps dApps and wallets deliver successful transactions even when the network is congested. Today, the repo ships a live metrics backend, a polished dashboard, and a compact on-chain ring buffer program. This doc turns it into a focused product plan.

## Value Proposition

- Reduce failed/slow transactions by adding a smart queue + retry strategy tuned to live network state.
- Give teams and users real-time visibility of health (TPS, slot time, success rates) and clear actionability.
- Offer APIs and a lightweight SDK so any dApp can embed SafeTx reliability without rebuilding core infra.

## Who Benefits

- Companies (dApps, wallets, infra): higher conversion, fewer support tickets, lower RPC burn, SLA proofs.
- Individuals (retail users, traders): fewer stuck txs, clearer status, informed fee/priority choices.
- Infra providers (RPC/validators): visibility, alerts, usage-based upsell.

## Differentiators

- Live signal → action loop: metrics drive queue/retry/backoff decisions automatically.
- Hybrid design: off-chain orchestrator + minimal on-chain registry for auditable snapshots.
- Works anywhere: Devnet/testnet/mainnet; integrates with existing wallets and backends.

## Product Modules (Naming)

- SafeTx Insight (dashboard + APIs): health, TPS, success, leaders, timelines.
- SafeTx Queue (client/server): backoff, batch, retry, flush, priority lanes.
- SafeTx Router: choose RPC/leader windows/priority fee for best confirmation likelihood.
- SafeTx Guard: preflight checks, risk flags, min success thresholds before submit.
- SafeTx Stream: SSE/WebSocket stream for live metrics and alerts.
- SafeTx SDK: TypeScript library and React hooks for dApps and wallets.

## Core Use Cases

- dApp checkout succeeds under load (queue + adaptive retry + optimal fees).
- Wallet shows live congestion score and suggests priority fees or delays.
- NFT mint/IDO guardrails: throttle and batch submits, warn users before failure streaks.
- Ops teams get alerts when success rate drops or slot time spikes; auto switch RPC.
- Quant/MEV bots tune behavior to live TPS and leader schedule windows.
- Post-incident RCA with on-chain snapshots for audits and SLA proofs.

## 30/60/90 Roadmap

### Next 30 days (Foundation)
- Frontend
  - Wire MagicBlock SSE into UI with a persistent connection and toggle (already scaffolded in `src/lib/api.ts`).
  - Add alerts panel (toasts + banner) for threshold breaches.
- Backend
  - Add WebSocket/SSE push from the main Express server (in addition to polling).
  - Pluggable RPC strategy (primary + failover, rolling health checks).
- On-chain
  - Add program versioning and range queries helper in client to read snapshots.
- SDK
  - Publish `src/lib/safetx.ts` as `@safetx/client` alpha on npm (browser + Node ESM build).
- Ops
  - Deploy a public demo (Railway + Vercel). Add status page and uptime monitor.

### 60 days (Reliability features)
- Queue
  - Persistence (Redis/Postgres) + exponential backoff strategies.
  - Priority lanes: high/medium/low with budget caps.
- Router
  - RPC scoring (latency, error rate) and automatic failover.
  - Leader-aware timing for latency-sensitive submits.
- Analytics
  - Historical store + daily aggregates; basic cohort charts; CSV export.
- Security
  - JWT for queue operations; rate limits; request signing.

### 90 days (Productization)
- SDK
  - Full TS API, React hooks, examples (Next.js demo, wallet adapter integration).
- Alerts
  - Email/Webhook/Slack/Discord; user-defined rules.
- Monetization
  - API keys, tiered quotas, usage metering, billing events.
- Enterprise
  - Org accounts, multi-projects, audit logs, SSO/SAML (stretch).

## Monetization (Indicative)

- Free: Live dashboard + SSE; limited history; 1 project; 60 RPM.
- Pro ($49/mo): API keys, 7-day history, priority queue, 10 projects, alerting, 600 RPM.
- Team ($199/mo): 30-day history, router + auto-failover, webhooks, 5k RPM, role-based access.
- Enterprise (custom): Dedicated deployment, SSO/SAML, on-prem options, 90-day+ history.

Optional add-ons: Dedicated RPC bundling, managed Redis, incident RCA report.

## KPIs

- North Star: Confirmed tx rate uplift for integrated dApps (% reduction in failed txs).
- Activation: Time-to-first metrics and first queued tx (<10 minutes).
- Reliability: p95 queue-to-confirm time, retry success delta.
- Adoption: SDK installs, active API keys, projects, MAUs.
- Revenue: Paid conversions, ARPA, churn.

## Go-To-Market

- Integrations: Phantom/Solflare wallet adapters; Anchor/Helius/QuickNode guides.
- Channels: Solana DevRel, ecosystem forums, hackathons, X/Discord content, validator/rpc partners.
- Proof: Public demo with a live “network stress” playground and before/after reliability stats.

## Risks & Mitigations

- RPC variance → multi-provider router with health scoring and backoff.
- Wallet friction → keep SDK minimal; no custody; sign in user’s wallet; graceful fallbacks.
- On-chain costs → keep registry snapshots compact; off-chain store for heavy analytics.

## Immediate Issues to Open (suggested)

1. Frontend: add SSE live toggle and badge (wire `subscribeMagicblockSSE`) and new Alerts panel.
2. Backend: add `/api/events/stream` SSE with the same structure as `/api/metrics` for one entry point.
3. SDK: package `src/lib/safetx.ts` with rollup/tsup, publish as `@safetx/client` (alpha).
4. Queue: add Redis persistence behind a feature flag; fallback to in-memory.
5. Router: implement RPC health check + failover list in backend config.
6. On-chain: add client read of PDA buffer and simple CLI to dump last N snapshots.

---

This roadmap is pragmatic: ship reliability first, then persistence + router, then SDK + monetization. PRs welcome.
