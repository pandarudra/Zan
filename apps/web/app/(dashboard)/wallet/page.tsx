"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession, getSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import bs58 from "bs58";
import { useRouter, useSearchParams } from "next/navigation";

function WalletVerificationContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const { publicKey, signMessage, connected } = useWallet();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" && !token) {
      router.push("/login?callbackUrl=/wallet");
    }
  }, [status, token, router]);

  const handleVerify = async () => {
    if (!publicKey || !signMessage) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentSession = await getSession();
      const accessToken = token || (currentSession as any)?.accessToken;

      const headers: any = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      // 1. Get challenge
      const chalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/wallet/challenge`, { headers });
      if (!chalRes.ok) {
        const d = await chalRes.json().catch(()=>({}));
        throw new Error(d.error || "Failed to get challenge");
      }
      const { message } = await chalRes.json();

      // 2. Sign message
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);

      // 3. Verify
      const verRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/wallet`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature: signatureBase58,
          message,
        }),
      });

      const verData = await verRes.json().catch(()=>({}));
      if (!verRes.ok) throw new Error(verData.error || "Verification failed");

      setSuccess(true);
      setTimeout(() => {
        if (!token) {
          const role = (session?.user as any)?.role;
          router.push(role === "PROVIDER" ? "/provider" : "/client");
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "unauthenticated" && !token)) return null;

  return (
    <div className="min-h-full flex items-center justify-center relative px-6 py-10">



      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="rounded-none border border-hairline bg-canvas p-10 relative overflow-hidden">


          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-cool flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-ink" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">
              Verify Wallet
            </h1>
            <p className="text-graphite font-light">
              Prove ownership of your Solana wallet to link it to your Zan account.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {error && (
              <div className="p-4 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-none bg-green-500/10 border border-green-500/20 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Wallet Verified</h3>
                <p className="text-green-400/70 text-sm">
                  Your wallet has been securely linked. You can safely close this page or wait to be redirected...
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 bg-canvas p-6 rounded-none border border-hairline">
                  <p className="text-sm text-graphite text-center mb-2">
                    Step 1: Connect your Solana wallet
                  </p>
                  <WalletMultiButton style={{ backgroundColor: "#00ffd1", color: "#09090e", borderRadius: "9999px", fontWeight: "bold" }} />
                </div>

                {connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col gap-4"
                  >
                    <button
                      onClick={handleVerify}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-none bg-white text-black font-bold hover:bg-surface-cool transition-all disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Step 2: Sign Message to Verify"
                      )}
                    </button>
                    <p className="text-xs text-center text-graphite">
                      Signing this message is free and will not cost any SOL.
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

export default function WalletVerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center text-graphite">Loading verification...</div>}>
      <WalletVerificationContent />
    </Suspense>
  );
}
