# @safetx/client

SafeTx SDK for companies and integrators. Provides:
- REST client for SafeTx backend
- Unified SSE metrics stream
- Solana helpers to interact with the SafeTx on-chain program (InitRegistry, PushMetric)

## Install

```bash
npm i @safetx/client @solana/web3.js
```

## Usage (REST)

```ts
import { SafeTxApiClient } from '@safetx/client';

const client = new SafeTxApiClient({ baseUrl: 'https://api.yourdomain.com', apiKey: 'YOUR_KEY' });
const health = await client.health();
const metrics = await client.metrics();
await client.enqueue({ tx_id: 'abc123', sender: '7Xk...' });
```

### SSE (Live metrics)
```ts
import { SafeTxApiClient } from '@safetx/client';
const client = new SafeTxApiClient({ baseUrl: 'https://api.yourdomain.com', apiKey: 'YOUR_KEY' });
const unsubscribe = client.subscribe((m) => console.log('metrics', m));
// later: unsubscribe();
```

## Usage (Solana program)

```ts
import { PublicKey, Connection } from '@solana/web3.js';
import { buildInitRegistryIx, buildPushMetricIx, sendWithProvider } from '@safetx/client';

const PROGRAM_ID = new PublicKey('GHurqnc1CCe9NaBvwvWgBz3qmRP9rePDxNwf5eEgqCD');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// provider: Phantom in browser or a custom object with publicKey + signTransaction/signAndSendTransaction
const initIx = buildInitRegistryIx(PROGRAM_ID, provider.publicKey);
await sendWithProvider(provider, connection, initIx);

const pushIx = buildPushMetricIx(PROGRAM_ID, provider.publicKey, {
  tps: 1200,
  slot: BigInt(Date.now()),
  slot_time_ms: 420,
  success_bps: 9840,
  ts: BigInt(Date.now()),
});
await sendWithProvider(provider, connection, pushIx);
```

## API Reference
See repository `docs/API.md` and `docs/openapi.yaml` for full REST/SSE specs.

## Build

```bash
npm run build
```

Outputs ESM + CJS + types in `dist/`.
