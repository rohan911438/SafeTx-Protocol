# SafeTx Solana Program

This program stores compact network metrics in a PDA-backed ring buffer.

- PDA seeds: ["safetx", admin_pubkey]
- Instructions:
  - InitRegistry
  - PushMetric { tps, slot, slot_time_ms, success_bps, ts }

Build (preferred): requires Solana toolchain and SBF rust.

## Prereqs
- Rust + Cargo
- Solana CLI (v1.18+)
- On Windows: run from PowerShell, and install LLVM via Visual Studio Build Tools or use WSL for faster builds.

## Build

Option A (modern):
- solana --version should be >= 1.18
- Run:

```
solana config set -u testnet
cargo build-sbf
```

The shared object lands at:
```
target/sbf-solana-solana/release/safetx_program.so
```

Option B (legacy target):
```
cargo build --release --target bpfel-unknown-unknown
```

## Deploy

```
solana program deploy target/sbf-solana-solana/release/safetx_program.so
```

Record the Program ID and update your clients.

## PDAs
- Registry PDA = Pubkey::find_program_address(["safetx", admin])

## Note
This is a minimal custom program tailored to SafeTx, not a copy-paste template. It encodes metrics efficiently and enforces an admin-only writer.
