"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Loader2, LogOut, Wallet } from "lucide-react";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { cn } from "@/lib/utils";

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
        type="button"
        disabled
        aria-live="polite"
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-hairline bg-surface-cool px-4 text-sm font-medium text-graphite",
          className,
        )}
      >
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        Connecting…
      </button>
    );
  }

  if (connected && shortAddress) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", className)}>
        {showBalance && balance !== null && (
          <span className="whitespace-nowrap text-sm font-semibold text-ink">
            ◎ {balance.toFixed(3)} SOL
          </span>
        )}
        <button
          type="button"
          aria-label={`Manage wallet ${shortAddress}`}
          onClick={() => setVisible(true)}
          className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-success/30 bg-success-bg px-3 text-sm font-semibold text-success transition-colors hover:bg-success/20"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-success"
          />
          <span className="truncate">{shortAddress}</span>
        </button>
        <button
          type="button"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
          onClick={() => disconnect()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-cool text-graphite transition-colors hover:border-ink hover:text-ink"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-ink-soft",
        className,
      )}
    >
      <Wallet aria-hidden="true" className="h-4 w-4" />
      Connect Wallet
    </button>
  );
}
