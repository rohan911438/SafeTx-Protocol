import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';

export interface MetricSnapshot {
  tps: number; // u32
  slot: bigint; // u64
  slot_time_ms: number; // u32
  success_bps: number; // u16 (0..10000)
  ts: bigint; // u64 unix millis
}

export interface WalletProviderLike {
  publicKey: PublicKey;
  signAndSendTransaction?: (tx: Transaction) => Promise<{ signature?: string } | string>;
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
}

export function deriveRegistryPDA(programId: PublicKey, admin: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('safetx'), admin.toBuffer()], programId);
  return pda;
}

function u64ToBytesLE(n: bigint): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Number(n & 0xffffffffn), true);
  view.setUint32(4, Number((n >> 32n) & 0xffffffffn), true);
  return new Uint8Array(buf);
}

/** Build InitRegistry instruction */
export function buildInitRegistryIx(programId: PublicKey, feePayer: PublicKey): TransactionInstruction {
  const registryPda = deriveRegistryPDA(programId, feePayer);
  const data = Buffer.from([0]); // SafetxIx::InitRegistry
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

/** Build PushMetric instruction */
export function buildPushMetricIx(
  programId: PublicKey,
  feePayer: PublicKey,
  snap: Partial<MetricSnapshot> = {}
): TransactionInstruction {
  const registryPda = deriveRegistryPDA(programId, feePayer);
  const tps = snap.tps ?? 1200;
  const slot = snap.slot ?? BigInt(Date.now());
  const slot_time_ms = snap.slot_time_ms ?? 420;
  const success_bps = snap.success_bps ?? 9840;
  const ts = snap.ts ?? BigInt(Date.now());

  const buf = new Uint8Array(1 + 4 + 8 + 4 + 2 + 8);
  let o = 0;
  buf[o++] = 1; // SafetxIx::PushMetric
  // tps u32
  buf[o++] = tps & 0xff; buf[o++] = (tps >>> 8) & 0xff; buf[o++] = (tps >>> 16) & 0xff; buf[o++] = (tps >>> 24) & 0xff;
  // slot u64
  buf.set(u64ToBytesLE(slot), o); o += 8;
  // slot_time_ms u32
  buf[o++] = slot_time_ms & 0xff; buf[o++] = (slot_time_ms >>> 8) & 0xff; buf[o++] = (slot_time_ms >>> 16) & 0xff; buf[o++] = (slot_time_ms >>> 24) & 0xff;
  // success_bps u16
  buf[o++] = success_bps & 0xff; buf[o++] = (success_bps >>> 8) & 0xff;
  // ts u64
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

/**
 * Send a single-instruction transaction using a wallet-like provider.
 */
export async function sendWithProvider(provider: WalletProviderLike, connection: Connection, ix: TransactionInstruction): Promise<string> {
  const tx = new Transaction().add(ix);
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  if (provider.signAndSendTransaction) {
    const res = await provider.signAndSendTransaction(tx);
    const sig = (res as any)?.signature || (res as any);
    await connection.confirmTransaction(sig, 'confirmed');
    return sig as string;
  }
  if (provider.signTransaction) {
    const signed = await provider.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  }
  throw new Error('Wallet provider does not support signing');
}
