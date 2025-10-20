const fs = require('fs');
const path = require('path');
const borsh = require('borsh');
const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');

function readProgramId() {
  if (process.env.SAFETX_PROGRAM_ID) return process.env.SAFETX_PROGRAM_ID;
  try {
    const pidPath = path.join(process.cwd(), 'contracts', 'solana', 'PROGRAM_ID');
    if (fs.existsSync(pidPath)) {
      return fs.readFileSync(pidPath, 'utf-8').trim();
    }
  } catch {}
  return '11111111111111111111111111111111';
}

const PROGRAM_ID = readProgramId();

class MetricSnapshot {
  constructor(fields) { Object.assign(this, fields); }
}

class SafetxIxInit {}
class SafetxIxPush { constructor(s) { this.s = s; } }

const schema = new Map([
  [SafetxIxInit, { kind: 'struct', fields: [] }],
  [MetricSnapshot, { kind: 'struct', fields: [
    ['tps', 'u32'],
    ['slot', 'u64'],
    ['slot_time_ms', 'u32'],
    ['success_bps', 'u16'],
    // Rust expects u64 for ts; ensure schema matches to avoid decode errors
    ['ts', 'u64'],
  ]} ],
  [SafetxIxPush, { kind: 'struct', fields: [['s', MetricSnapshot]] }],
]);

function ixInit() {
  const data = borsh.serialize(schema, new SafetxIxInit());
  return Buffer.concat([Buffer.from([0]), Buffer.from(data)]);
}

function ixPush(snap) {
  const data = borsh.serialize(schema, new SafetxIxPush(new MetricSnapshot(snap)));
  return Buffer.concat([Buffer.from([1]), Buffer.from(data)]);
}

function getSolanaConfigDir() {
  const home = process.env.HOME || process.env.USERPROFILE || process.env.USERHOME || '';
  return path.join(home, '.config', 'solana');
}

async function loadPayer() {
  // Allow overriding the keypair path via SOLANA_KEYPAIR, else fall back to the default id.json
  const keyPath = process.env.SOLANA_KEYPAIR
    ? path.resolve(process.env.SOLANA_KEYPAIR)
    : path.join(getSolanaConfigDir(), 'id.json');
  const secretKey = JSON.parse(fs.readFileSync(keyPath));
  return Keypair.fromSecretKey(Buffer.from(secretKey));
}

function registryPDA(adminPubkey) {
  return PublicKey.findProgramAddressSync([Buffer.from('safetx'), adminPubkey.toBuffer()], new PublicKey(PROGRAM_ID));
}

async function cmdInit(endpoint='https://api.testnet.solana.com') {
  const connection = new Connection(endpoint, 'confirmed');
  const payer = await loadPayer();
  const [pda] = registryPDA(payer.publicKey);

  const data = ixInit();
  const tx = new Transaction().add({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });

  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log('✅ InitRegistry tx:', sig);
  console.log('🗄️ Registry PDA:', pda.toString());
}

async function cmdPush(endpoint='https://api.testnet.solana.com') {
  const connection = new Connection(endpoint, 'confirmed');
  const payer = await loadPayer();
  const [pda] = registryPDA(payer.publicKey);

  const snap = {
    tps: 1200,
    slot: 0n + Date.now(), // dummy
    slot_time_ms: 420,
    success_bps: 9840,
    ts: BigInt(Date.now()),
  };

  const data = ixPush(snap);
  const tx = new Transaction().add({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });

  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log('✅ PushMetric tx:', sig);
}

async function main() {
  const [cmd, endpoint] = process.argv.slice(2);
  if (cmd === 'init') return cmdInit(endpoint);
  if (cmd === 'push') return cmdPush(endpoint);
  if (cmd === 'pda') {
    const payer = await loadPayer();
    const [pda] = registryPDA(payer.publicKey);
    console.log('Registry PDA for admin', payer.publicKey.toString(), '=>', pda.toString());
    return;
  }
  console.log('Usage: node scripts/solana/safetx-client.cjs <init|push|pda> [endpoint]');
  console.log('Hint: set SAFETX_PROGRAM_ID env var or create contracts/solana/PROGRAM_ID');
}

main().catch(err => { console.error(err); process.exit(1); });
