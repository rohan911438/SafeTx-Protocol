const STORAGE_KEY = "safetx_pubkey";

export function hasPhantom(): boolean {
  return typeof window !== "undefined" && !!window.solana && !!window.solana.isPhantom;
}

export async function connectPhantom(): Promise<string> {
  if (!hasPhantom()) throw new Error("Phantom wallet not found. Install Phantom to continue.");
  const res = await window.solana!.connect();
  const pubkey = res.publicKey.toString();
  localStorage.setItem(STORAGE_KEY, pubkey);
  return pubkey;
}

export function disconnectPhantom(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.solana?.disconnect?.();
  } catch {}
}

export function getStoredPubkey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
