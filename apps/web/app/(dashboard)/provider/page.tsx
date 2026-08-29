"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Activity, HardDrive, Loader2, Power, Server, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DownloadAgentButton } from "@/components/shared/download-agent-button";
import { PageContainer } from "@/components/shared/page-container";

interface ProviderMetrics {
  totalEarnedSol?: number;
  uptimePercent?: number;
  successfulJobs?: number;
}

interface Provider {
  id: string;
  status: string;
  tier: number;
  gpuModel: string | null;
  vramGB: number | null;
  metrics?: ProviderMetrics | null;
}

export default function ProviderDashboard(): React.JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProvider = useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    setError("");
    try {
      const data = (await api.get("/api/providers/me")) as {
        provider: Provider | null;
        metrics?: ProviderMetrics | null;
      };
      setProvider(data.provider);
      setMetrics(data.metrics ?? data.provider?.metrics ?? null);
      setIsOnline(data.provider?.status === "ACTIVE" || data.provider?.status === "BUSY");
    } catch {
      setError("Provider details could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadProvider();
  }, [loadProvider]);

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <div role="status" className="flex items-center gap-3 text-sm text-graphite">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading node telemetry...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-5 text-center">
        <Server className="h-10 w-10 text-error" />
        <p role="alert" className="text-graphite">{error}</p>
        <Button type="button" variant="ghost" onClick={loadProvider}>Try again</Button>
      </PageContainer>
    );
  }

  if (!provider) {
    return (
      <PageContainer className="flex min-h-[60vh] max-w-2xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-lg border border-hairline bg-canvas p-6 text-center sm:p-10"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-cool">
            <Server className="h-7 w-7 text-ink" />
          </div>
          <h1 className="text-3xl tracking-[-0.03em] text-ink">Set up your provider node</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-graphite">
            Stake your provider deposit, then install the Zan agent to register your GPU and start accepting jobs.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => router.push("/stake")}>Stake to register</Button>
            <DownloadAgentButton className="min-h-12 justify-center" />
          </div>
        </motion.div>
      </PageContainer>
    );
  }

  const cards = [
    { label: "Tier level", value: `Tier ${provider.tier}`, icon: Zap },
    { label: "Total earned", value: `${Number(metrics?.totalEarnedSol ?? 0).toFixed(2)} SOL`, icon: Activity },
    { label: "Uptime", value: `${Number(metrics?.uptimePercent ?? 0).toFixed(1)}%`, icon: Server },
    { label: "Tasks completed", value: (metrics?.successfulJobs ?? 0).toLocaleString(), icon: HardDrive },
  ];

  return (
    <PageContainer
      title="Node control panel"
      description="Manage GPU availability and track your network earnings."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-md border border-hairline bg-surface-cool px-3 py-2 font-mono text-xs text-graphite">
            ID: {provider.id.slice(0, 10).toUpperCase()}
          </span>
          <Button
            type="button"
            variant={isOnline ? "secondary" : "danger"}
            size="lg"
            aria-pressed={isOnline}
            onClick={() => setIsOnline((value) => !value)}
            className="gap-2"
          >
            <Power className="h-4 w-4" /> {isOnline ? "Accepting jobs" : "Node offline"}
          </Button>
        </div>
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-lg border border-hairline bg-canvas p-5"
          >
            <div className="mb-8 flex items-center justify-between text-sm text-graphite">
              {label}<Icon className="h-5 w-5 text-stone" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
          </motion.div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-hairline bg-canvas">
        <div className="flex flex-col gap-3 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-ink">Hardware telemetry</h2>
          <span className="rounded-full border border-hairline bg-surface-cool px-3 py-1 text-xs text-graphite">
            {provider.gpuModel || "Unknown GPU"} · {provider.vramGB ?? 0} GB
          </span>
        </div>
        <div className="p-8 text-center text-sm leading-6 text-graphite">
          Live telemetry is streamed by the desktop agent. Launch the agent to see real-time GPU metrics.
        </div>
      </section>
    </PageContainer>
  );
}
