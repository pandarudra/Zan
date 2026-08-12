"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletConnection } from "@/hooks/use-wallet-connection";

interface Props {
  className?: string;
  showBalance?: boolean;
}

export function WalletConnectButton({
  className = "",
  showBalance = true,
}: Props) {
  const { connected, connecting, balance, shortAddress, disconnect } =
    useWalletConnection();
  const { setVisible } = useWalletModal();

  if (connecting) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-none border border-hairline bg-surface-cool px-4 py-2.5 text-sm text-graphite ${className}`}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        Connecting...
      </button>
    );
  }

  if (connected && shortAddress) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showBalance && balance !== null && (
          <span className="text-sm font-semibold text-ink">
            ◎ {balance.toFixed(3)} SOL
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisible(true)}
            className="flex items-center gap-2 rounded-none border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
          >
            <span className="h-2 w-2 rounded-full bg-green-400" />
            {shortAddress}
          </button>
          <button
            onClick={() => disconnect()}
            className="rounded-none border border-hairline bg-surface-cool px-3 py-2.5 text-xs font-semibold text-graphite hover:text-ink hover:bg-surface-cool transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className={`flex items-center gap-2 rounded-none bg-primary text-on-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all hover:bg-white ${className}`}
    >
      <span>◎</span>
      Connect Wallet
    </button>
  );
}
