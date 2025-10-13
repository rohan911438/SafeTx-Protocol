import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredPubkey } from "@/lib/wallet";

interface RequireWalletProps {
  children: ReactNode;
}

export const RequireWallet = ({ children }: RequireWalletProps) => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pubkey = getStoredPubkey();
    if (!pubkey) {
      navigate("/");
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;
  return <>{children}</>;
};
