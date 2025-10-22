const STORAGE_KEY = "safetx_pubkey";

export function hasPhantom(): boolean {
  return typeof window !== "undefined" && !!window.solana && !!window.solana.isPhantom;
}

function setStoredPubkey(pubkey?: string) {
  if (!pubkey) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, pubkey);
  }
}

let listenersInitialized = false;
function initPhantomListeners() {
  if (!hasPhantom() || listenersInitialized) return;
  const provider = window.solana!;
  try {
    provider.on?.("connect", () => {
      try {
        // Phantom exposes publicKey after connect
        const pk = (provider as any).publicKey?.toString?.();
        if (pk) setStoredPubkey(pk);
      } catch {}
    });
    provider.on?.("accountChanged", (pk: any) => {
      const next = (pk && typeof pk.toString === 'function') ? pk.toString() : undefined;
      setStoredPubkey(next);
    });
    provider.on?.("disconnect", () => setStoredPubkey(undefined));
    listenersInitialized = true;
  } catch {}
}

export async function connectPhantom(): Promise<string> {
  if (!hasPhantom()) {
    console.error("Phantom wallet not detected");
    throw new Error("Phantom wallet not found. Please install Phantom browser extension.");
  }
  
  console.log("Connecting to Phantom wallet (frontend only - no backend)...");
  initPhantomListeners();
  const provider = window.solana! as any;

  // If already connected, use current publicKey
  if (provider.isConnected && provider.publicKey) {
    const pk = provider.publicKey.toString();
    console.log("Already connected to Phantom:", pk.slice(0, 4) + "...");
    setStoredPubkey(pk);
    return pk;
  }

  // Prompt connect (allow onlyIfTrusted fast-path on reloads)
  try {
    console.log("Requesting wallet connection from user...");
    const res = await provider.connect({ onlyIfTrusted: false });
    const pubkey = res?.publicKey?.toString?.() || provider.publicKey?.toString?.();
    if (!pubkey) {
      throw new Error("Wallet did not return a public key");
    }
    console.log("✅ Wallet connected successfully:", pubkey.slice(0, 4) + "...");
    setStoredPubkey(pubkey);
    return pubkey;
  } catch (e: any) {
    console.error("Phantom connection error:", e);
    // Common causes: user rejected, insecure context (non-https), popup blocked
    if (e?.message?.includes("User rejected")) {
      throw new Error("Connection rejected by user");
    }
    throw new Error(e?.message || "Failed to connect Phantom wallet");
  }
}

export function disconnectPhantom(): void {
  try {
    setStoredPubkey(undefined);
    window.solana?.disconnect?.();
  } catch {}
}

export function getStoredPubkey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
