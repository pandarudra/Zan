"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  EscrowIDL,
  getConfigPda,
  getProviderStakePda,
  getProviderVaultPda,
} from "@repo/contracts-sdk";
import type { Escrow } from "@repo/contracts-sdk";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID ??
    "G4AGRutZdKry9rMnJiZt2Noz42ifwghgZxiXCETfXHGg"
);
const STAKE_AMOUNT_SOL = 2;
const STAKE_AMOUNT_LAMPORTS = STAKE_AMOUNT_SOL * 1_000_000_000;

function StakeContent() {
  const { publicKey, connected, signTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();

  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleStake = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");
    setTxSignature("");

    try {
      // Create a wallet adapter compatible with Anchor
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: signAllTransactions!,
      };

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });

      const program = new Program<Escrow>(
        EscrowIDL as any,
        provider
      );

      const configPda = getConfigPda(PROGRAM_ID);
      const providerStakePda = getProviderStakePda(PROGRAM_ID, publicKey);
      const providerVaultPda = getProviderVaultPda(PROGRAM_ID, publicKey);

      const tx = await program.methods
        .initializeProviderStake(new BN(STAKE_AMOUNT_LAMPORTS))
        .accounts({
          provider: publicKey,
          config: configPda,
          providerStake: providerStakePda,
          providerVault: providerVaultPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();

      setTxSignature(tx);
    } catch (err: any) {
      console.error("[Stake] Error:", err);
      if (err?.message?.includes("User rejected")) {
        setError("Transaction rejected by wallet");
      } else if (err?.message?.includes("insufficient")) {
        setError(
          "Insufficient SOL balance. You need at least 2 SOL + gas fees."
        );
      } else if (
        err?.message?.includes("already in use") ||
        err?.logs?.some((l: string) => l.includes("already in use"))
      ) {
        setError(
          "You have already staked. If you need your previous stake signature, check your Phantom wallet transaction history."
        );
      } else {
        setError(err?.message || "Staking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, signAllTransactions, connection]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(txSignature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [txSignature]);

  return (
    <div className="min-h-full flex items-center justify-center relative px-6 py-10">
      {/* Background effects */}



      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="rounded-none border border-hairline bg-canvas p-10 relative overflow-hidden">
          {/* Top accent */}


          {/* Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Coins className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">
              Provider Stake
            </h1>
            <p className="text-graphite font-light">
              Stake {STAKE_AMOUNT_SOL} SOL to register your machine on the Zan
              network.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success state */}
            {txSignature ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="p-6 rounded-none bg-green-500/10 border border-green-500/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    Stake Successful!
                  </h3>
                  <p className="text-green-400/70 text-sm mb-1">
                    Your {STAKE_AMOUNT_SOL} SOL stake has been confirmed
                    on-chain.
                  </p>
                </div>

                {/* Transaction signature */}
                <div className="bg-canvas rounded-none border border-hairline p-6">
                  <label className="text-xs font-semibold text-graphite uppercase tracking-wider mb-3 block">
                    Transaction Signature
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-amber-400 font-mono bg-canvas rounded-lg px-3 py-2.5 break-all select-all border border-hairline">
                      {txSignature}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 w-10 h-10 rounded-lg bg-surface-cool hover:bg-surface-cool border border-hairline flex items-center justify-center transition-all"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-graphite" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-amber-500/5 rounded-none border border-amber-500/10 p-6">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Next Steps
                  </h4>
                  <ol className="text-sm text-graphite space-y-2 list-decimal list-inside">
                    <li>Copy the transaction signature above</li>
                    <li>
                      Open the{" "}
                      <span className="text-ink font-medium">
                        Zan Provider Agent
                      </span>{" "}
                      desktop app
                    </li>
                    <li>
                      Paste it in the{" "}
                      <span className="text-ink font-medium">
                        &quot;Stake Transaction Signature&quot;
                      </span>{" "}
                      field
                    </li>
                    <li>
                      Enter your wallet address:{" "}
                      <code className="text-amber-400/80 text-xs">
                        {publicKey?.toBase58().slice(0, 8)}...
                      </code>
                    </li>
                    <li>
                      Click{" "}
                      <span className="text-ink font-medium">
                        &quot;Verify Stake & Register Machine&quot;
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Solana Explorer link */}
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-graphite hover:text-graphite transition-colors"
                >
                  View on Solana Explorer
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ) : (
              <>
                {/* Stake details */}
                <div className="bg-canvas rounded-none border border-hairline p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-graphite">Stake Amount</span>
                    <span className="text-2xl font-bold text-amber-400">
                      {STAKE_AMOUNT_SOL}{" "}
                      <span className="text-base text-amber-400/70">SOL</span>
                    </span>
                  </div>
                  <div className="h-px bg-surface-cool mb-4" />
                  <ul className="text-xs text-graphite space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      Stake secures your provider slot on the network
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      Stake can be slashed for malicious behavior
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      Withdrawal available after 48-hour lock period
                    </li>
                  </ul>
                </div>

                {/* Wallet connect */}
                <div className="flex flex-col items-center gap-4 bg-canvas p-6 rounded-none border border-hairline">
                  <p className="text-sm text-graphite text-center mb-1">
                    {connected
                      ? `Connected: ${publicKey?.toBase58().slice(0, 6)}...${publicKey?.toBase58().slice(-4)}`
                      : "Connect your Solana wallet to stake"}
                  </p>
                  <WalletMultiButton
                    style={{
                      backgroundColor: connected ? "#1a1a2e" : "#00ffd1",
                      color: connected ? "#ffffff" : "#09090e",
                      borderRadius: "9999px",
                      fontWeight: "bold",
                      border: connected ? "1px solid rgba(255,255,255,0.1)" : "none",
                    }}
                  />
                </div>

                {/* Stake button */}
                {connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <button
                      onClick={handleStake}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-none bg-primary text-on-primary font-bold hover:bg-surface-cool hover:text-ink transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Confirm in Wallet...
                        </>
                      ) : (
                        <>
                          <Coins className="w-5 h-5" />
                          Stake {STAKE_AMOUNT_SOL} SOL
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-stone mt-3">
                      This will transfer {STAKE_AMOUNT_SOL} SOL to the Zan
                      escrow program. You&apos;ll need to approve the
                      transaction in your wallet.
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StakePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center text-graphite">
          Loading staking...
        </div>
      }
    >
      <StakeContent />
    </Suspense>
  );
}
