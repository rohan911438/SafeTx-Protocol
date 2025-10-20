import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

// Prefer env config but fall back to the recorded Program ID for convenience in dev
const DEFAULT_PROGRAM_ID = "GHurqnc1CCe9NaBvwvWgBz3qmRP9rePDxNwf5eEgqCD";
const DEFAULT_RPC = "https://api.devnet.solana.com";

export function getConnection(): Connection {
  const endpoint = (import.meta as any).env?.VITE_SOLANA_RPC || DEFAULT_RPC;
  return new Connection(endpoint, "confirmed");
}

export function getProgramId(): PublicKey {
  const pid = (import.meta as any).env?.VITE_SAFETX_PROGRAM_ID || DEFAULT_PROGRAM_ID;
  return new PublicKey(pid);
}

export function deriveRegistryPDA(admin: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([
    Buffer.from("safetx"),
    admin.toBuffer(),
  ], getProgramId());
  return pda;
}

// Helpers to build instructions (manual LE encoding to match on-chain Borsh layout)
function buildInitIx(feePayer: PublicKey): TransactionInstruction {
  const programId = getProgramId();
  const registryPda = deriveRegistryPDA(feePayer);
  const data = Buffer.from([0]); // SafetxIx::InitRegistry discriminant
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: feePayer, isSigner: true, isWritable: true },
      { pubkey: registryPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

function u64ToBytesLE(n: bigint): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Number(n & 0xffffffffn), true);
  view.setUint32(4, Number((n >> 32n) & 0xffffffffn), true);
  return new Uint8Array(buf);
}

function buildPushIx(feePayer: PublicKey, snap?: {
  tps?: number;
  slot?: bigint;
  slot_time_ms?: number;
  success_bps?: number;
  ts?: bigint;
}): TransactionInstruction {
  const programId = getProgramId();
  const registryPda = deriveRegistryPDA(feePayer);
  const tps = snap?.tps ?? 1200;
  const slot = snap?.slot ?? BigInt(Date.now());
  const slot_time_ms = snap?.slot_time_ms ?? 420;
  const success_bps = snap?.success_bps ?? 9840;
  const ts = snap?.ts ?? BigInt(Date.now());

  const buf = new Uint8Array(1 + 4 + 8 + 4 + 2 + 8);
  let o = 0;
  buf[o++] = 1; // SafetxIx::PushMetric discriminant
  // tps (u32 LE)
  buf[o++] = tps & 0xff; buf[o++] = (tps >>> 8) & 0xff; buf[o++] = (tps >>> 16) & 0xff; buf[o++] = (tps >>> 24) & 0xff;
  // slot (u64 LE)
  buf.set(u64ToBytesLE(slot), o); o += 8;
  // slot_time_ms (u32 LE)
  buf[o++] = slot_time_ms & 0xff; buf[o++] = (slot_time_ms >>> 8) & 0xff; buf[o++] = (slot_time_ms >>> 16) & 0xff; buf[o++] = (slot_time_ms >>> 24) & 0xff;
  // success_bps (u16 LE)
  buf[o++] = success_bps & 0xff; buf[o++] = (success_bps >>> 8) & 0xff;
  // ts (u64 LE)
  buf.set(u64ToBytesLE(ts), o); o += 8;

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: feePayer, isSigner: true, isWritable: true },
      { pubkey: registryPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.from(buf),
  });
}

async function signAndSend(provider: any, connection: Connection, tx: Transaction): Promise<string> {
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(tx);
    const sig = res?.signature || res; // some providers return { signature }
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }
  if (provider.signTransaction) {
    const signed = await provider.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }
  throw new Error("Wallet does not support signing transactions");
}

export async function initRegistryWithPhantom(): Promise<{ signature: string; registryPda: string; }>{
  const provider = (window as any).solana;
  if (!provider?.isPhantom) throw new Error("Phantom wallet not found");
  if (!provider.publicKey) await provider.connect();
  const connection = getConnection();
  const ix = buildInitIx(provider.publicKey);
  const tx = new Transaction().add(ix);
  const signature = await signAndSend(provider, connection, tx);
  const registryPda = deriveRegistryPDA(provider.publicKey).toString();
  return { signature, registryPda };
}

export async function pushMetricWithPhantom(snap?: Parameters<typeof buildPushIx>[1]): Promise<{ signature: string; }>{
  const provider = (window as any).solana;
  if (!provider?.isPhantom) throw new Error("Phantom wallet not found");
  if (!provider.publicKey) await provider.connect();
  const connection = getConnection();
  const ix = buildPushIx(provider.publicKey, snap);
  const tx = new Transaction().add(ix);
  const signature = await signAndSend(provider, connection, tx);
  return { signature };
}
