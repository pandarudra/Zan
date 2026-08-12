"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Power,
  Activity,
  HardDrive,
  Zap,
  Layers,
  Loader2,
  Server,
  Rocket,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { DownloadAgentButton } from "@/components/shared/download-agent-button";
import { PageContainer } from "@/components/shared/page-container";

export default function ProviderDashboard(): React.JSX.Element {
  const { data: session } = useSession({ required: true });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [hasProvider, setHasProvider] = useState(false);
  const [providerData, setProviderData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (session?.user && (session.user as any).role === "CLIENT") {
      router.push("/client");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session?.user) return;

    api
      .get("/api/providers/me")
      .then((data: any) => {
        if (data.hasProvider) {
          setHasProvider(true);
          setProviderData(data);
          setIsOnline(
            data.provider.status === "ACTIVE" ||
              data.provider.status === "BUSY",
          );
        } else {
          setHasProvider(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch provider data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center relative overflow-hidden">
        <Loader2 className="w-8 h-8 text-ink animate-spin mb-4" />
        <p className="text-graphite font-mono text-sm">
          Loading Node Telemetry...
        </p>
      </div>
    );
  }

  if (!hasProvider) {
    return (
      <div className="min-h-screen bg-canvas text-ink px-4 pt-20 pb-24 relative overflow-hidden flex flex-col items-center justify-center sm:px-6">


        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-[420px] text-center"
        >
          <div className="mx-auto mb-8 flex h-36 w-36 items-center justify-center rounded-full border border-hairline bg-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-transparent">
              <Rocket className="h-10 w-10 text-graphite" />
            </div>
          </div>

          <h2 className="mb-8 text-4xl font-medium tracking-[-0.04em] text-ink">
            No workloads yet
          </h2>

          <div className="mx-auto max-w-[240px] text-left text-[15px] leading-[1.8] text-graphite">
            <p>
              Deploy your first compute job to get started.
              Upload a Python script or connect to a render pipeline.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-3 text-xl font-semibold text-ink"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-on-primary">
                <Plus className="h-3.5 w-3.5" />
              </span>
              Deploy Workload
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const { provider, metrics } = providerData;

  return (
    <PageContainer
      title="Node Control Panel"
      description="Manage your GPU availability and track Solana earnings."
      actions={
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs px-2 py-1 rounded bg-surface-cool border border-hairline text-graphite">
            ID: {provider.id.slice(0, 10).toUpperCase()}
          </span>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setIsOnline(!isOnline)}
            className={`group relative flex items-center gap-4 px-6 py-3 rounded-lg border transition-all duration-500 overflow-hidden ${
              isOnline
                ? "border-ink bg-surface-cool shadow-sm"
                : "border-red-500/40 bg-red-500/10 shadow-sm"
            }`}
          >
            <div
              className={`p-2 rounded-full transition-colors ${
                isOnline ? "bg-primary text-on-primary" : "bg-red-500 text-ink"
              }`}
            >
              <Power className="w-4 h-4" />
            </div>
            <span
              className={`font-bold tracking-wider uppercase text-sm ${
                isOnline ? "text-ink" : "text-red-500"
              }`}
            >
              {isOnline ? "Accepting Jobs" : "Node Offline"}
            </span>
          </motion.button>
        </div>
      }
    >

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Tier Level",
              value: `Tier ${provider.tier}`,
              icon: Zap,
              border: "border-ink",
            },
            {
              label: "Total Earned",
              value: `${Number(metrics?.totalEarnedSol || 0).toFixed(2)} SOL`,
              icon: Layers,
              border: "border-hairline",
            },
            {
              label: "Uptime",
              value: `${Number(metrics?.uptimePercent || 0).toFixed(1)}%`,
              icon: Activity,
              border: "border-hairline",
            },
            {
              label: "Tasks Completed",
              value: (metrics?.successfulJobs || 0).toLocaleString(),
              icon: HardDrive,
              border: "border-hairline",
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-6 rounded-none border ${metric.border} bg-canvas  flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-graphite text-sm font-light">
                  {metric.label}
                </p>
                <metric.icon className="w-5 h-5 text-stone" />
              </div>
              <p className="text-3xl font-bold text-ink tracking-tight">
                {metric.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Hardware Telemetry HUD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-none border border-hairline bg-canvas overflow-hidden relative"
        >
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-surface-cool shadow-[0_0_15px_#00ffd1] animate-[scanline_4s_ease-in-out_infinite]" />

          <div className="px-8 py-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink flex items-center gap-3">
              Hardware Telemetry
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2 ${isOnline ? "bg-surface-cool border-ink text-ink" : "bg-surface-cool border-hairline text-graphite"}`}
            >
              {isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary text-on-primary animate-pulse" />
              )}
              {provider.gpuModel || "Unknown GPU"} ({provider.vramGB || 0}GB)
            </div>
          </div>

          <div className="p-8 flex items-center justify-center text-stone text-sm font-mono">
            Live telemetry is streamed by the desktop agent. Launch the agent to
            see real-time GPU metrics.
          </div>
        </motion.div>
    </PageContainer>
  );
}
