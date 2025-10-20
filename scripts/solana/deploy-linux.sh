#!/usr/bin/env bash
set -euo pipefail

# SafeTx Solana program deploy helper for Linux/macOS shells.
# - Builds the program with cargo build-sbf
# - Deploys with Solana CLI (upgradeable behavior depends on CLI defaults)
# - Records the Program ID into contracts/solana/PROGRAM_ID and updates README

# Defaults
RPC_URL="https://api.testnet.solana.com"
KEYPAIR="${HOME}/.config/solana/id.json"
PROGRAM_REL="contracts/solana/safetx-program"
SO_PATH=""

usage() {
  cat <<EOF
Usage: $(basename "$0") [--url <rpc_url>] [--keypair <path>] [--program-dir <path>] [--so <path>]

Options:
  --url         Solana RPC URL (default: ${RPC_URL})
  --keypair     Path to deployer keypair JSON (default: ${KEYPAIR})
  --program-dir Path to the program crate (default: ${PROGRAM_REL})
  --so          Path to pre-built .so to deploy (skips build)

Examples:
  $(basename "$0") --url https://api.testnet.solana.com
  $(basename "$0") --url https://api.devnet.solana.com --keypair ~/.config/solana/id.json
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      RPC_URL="$2"; shift 2;;
    --keypair)
      KEYPAIR="$2"; shift 2;;
    --program-dir)
      PROGRAM_REL="$2"; shift 2;;
    --so)
      SO_PATH="$2"; shift 2;;
    -h|--help)
      usage; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if ! command -v solana >/dev/null 2>&1; then
  echo "Error: solana CLI not found in PATH." >&2
  echo "Install: https://docs.solana.com/cli/install-solana-cli-tools" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")"/../.. && pwd)"
cd "$ROOT_DIR"

echo "==> Using RPC: $RPC_URL"
echo "==> Using keypair: $KEYPAIR"

if [[ -z "$SO_PATH" ]]; then
  if ! command -v cargo >/dev/null 2>&1; then
    echo "Error: cargo not found. Install Rust toolchain: https://rustup.rs" >&2
    exit 1
  fi
  echo "==> Building program with cargo build-sbf..."
  (cd "$PROGRAM_REL" && cargo build-sbf)

  # Try modern SBF output path first, then fallback
  CANDIDATES=(
    "$PROGRAM_REL/target/sbf-solana-solana/release/safetx_program.so"
    "$PROGRAM_REL/target/deploy/safetx_program.so"
    "$PROGRAM_REL/target/bpfel-unknown-unknown/release/safetx_program.so"
  )
  for c in "${CANDIDATES[@]}"; do
    if [[ -f "$c" ]]; then
      SO_PATH="$c"; break
    fi
  done
fi

if [[ -z "$SO_PATH" || ! -f "$SO_PATH" ]]; then
  echo "Error: compiled .so not found. Looked at common paths; you can pass --so <path>." >&2
  exit 1
fi

echo "==> Program artifact: $SO_PATH"

echo "==> Deploying via Solana CLI..."
set +e
DEPLOY_OUTPUT=$(solana program deploy --url "$RPC_URL" --keypair "$KEYPAIR" "$SO_PATH" 2>&1)
DEPLOY_EXIT=$?
set -e
echo "$DEPLOY_OUTPUT"

if [[ $DEPLOY_EXIT -ne 0 ]]; then
  echo "Error: solana program deploy failed." >&2
  exit $DEPLOY_EXIT
fi

# Extract Program Id (case-insensitive match)
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | sed -n 's/.*[Pp]rogram [Ii]d: \([A-Za-z0-9]\{32,44\}\).*/\1/p' | tail -n1)
if [[ -z "$PROGRAM_ID" ]]; then
  echo "Error: could not parse Program Id from deploy output." >&2
  exit 1
fi

echo "==> Program deployed: $PROGRAM_ID"

# Persist Program ID and update README using the existing Node helper when available
if command -v node >/dev/null 2>&1; then
  echo "==> Recording Program ID via Node helper..."
  node ./scripts/solana/deploy-contract.cjs "$PROGRAM_ID" || true
else
  echo "==> Recording Program ID via shell fallback..."
  echo "$PROGRAM_ID" > "$ROOT_DIR/contracts/solana/PROGRAM_ID"
  RMD="$ROOT_DIR/contracts/solana/README.md"
  if grep -q "Deployed Program ID:" "$RMD"; then
    sed -i.bak "s/Deployed Program ID:.*/Deployed Program ID: $PROGRAM_ID/" "$RMD" && rm -f "$RMD.bak"
  else
    # Insert after title line
    awk -v pid="$PROGRAM_ID" 'NR==1{print; print ""; print "Deployed Program ID: " pid; print ""; next}1' "$RMD" > "$RMD.tmp" && mv "$RMD.tmp" "$RMD"
  fi
fi

echo "✅ Done. PROGRAM_ID saved and README updated."
