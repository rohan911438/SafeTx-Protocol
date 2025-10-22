export {};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      publicKey?: { toString(): string };
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signAndSendTransaction?: (transaction: any) => Promise<{ signature: string }>;
      signTransaction?: (transaction: any) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      off?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
