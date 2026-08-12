"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Cpu,
  ExternalLink,
  RefreshCw,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/shared/page-container";

type JobStatus =
  | "CREATED"
  | "FUNDED"
  | "QUEUED"
  | "ASSIGNED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "DISPUTED"
  | "PAID"
  | "REFUNDED";

interface ExecutionMetadata {
  executionTimeMs: number;
  vramUsedMb: number;
  avgUtilization: number;
  peakUtilization: number;
  tempDeltaC: number;
  powerDrawW: number;
  exitCode: number;
  logsUri: string;
  outputFiles: {
    filename: string;
    uri: string;
    size: number;
  }[];
}

interface JobEvent {
  id: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  inputUri: string;
  outputUri: string | null;
  executionMetadata?: ExecutionMetadata | null;
  budget: number;
  finalCost: number | null;
  createdAt: string;
  provider: {
    gpuModel: string;
    vramGB: number;
    location: string | null;
    tier: number;
  } | null;
  escrow: {
    status: string;
    amount: number;
  } | null;
  events: JobEvent[];
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  CREATED: {
    label: "Created",
    color: "text-graphite",
    bg: "bg-surface-cool",
    border: "border-hairline",
  },
  FUNDED: {
    label: "In Queue",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  QUEUED: {
    label: "Queued",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  RUNNING: {
    label: "Running",
    color: "text-ink",
    bg: "bg-surface-cool",
    border: "border-ink",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  FAILED: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  DISPUTED: {
    label: "Disputed",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  PAID: {
    label: "Paid",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

const TERMINAL = new Set<JobStatus>([
  "COMPLETED",
  "FAILED",
  "PAID",
  "REFUNDED",
]);
const CANCELLABLE = new Set<JobStatus>([
  "CREATED",
  "FUNDED",
  "QUEUED",
  "ASSIGNED",
  "RUNNING",
]);

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status: JobStatus }): React.ReactElement {
  if (status === "COMPLETED" || status === "PAID" || status === "REFUNDED")
    return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === "FAILED") return <XCircle className="w-4 h-4 text-red-400" />;
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="rounded-none border border-hairline bg-canvas p-4">
      <p className="text-xs text-stone mb-1">{label}</p>
      <p className="text-ink font-semibold text-sm truncate">{value}</p>
    </div>
  );
}

function getFilenameFromUri(uri: string, fallback: string): string {
  try {
    const parsed = new URL(uri);
    const name = parsed.pathname.split("/").pop();
    return name && name.trim().length ? name : fallback;
  } catch {
    return fallback;
  }
}

async function downloadBlob(path: string, filename: string): Promise<void> {
  const blob = await api.getBlob(path);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function LogViewer({ jobId }: { jobId: string }): React.ReactElement {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getText(`/api/jobs/${jobId}/logs`)
      .then((text) => {
        if (cancelled) return;
        setLogs(text);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLogs("Failed to load logs");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading)
    return <div className="text-sm text-graphite">Loading logs...</div>;

  return (
    <pre className="max-h-96 overflow-auto rounded-none bg-canvas p-4 text-xs text-green-400 font-mono whitespace-pre-wrap">
      {logs || "No logs captured"}
    </pre>
  );
}

export default function JobDetailPage(): React.ReactElement {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const data = await api.get(`/api/jobs/${jobId}`);
      setJob(data.job);
    } catch (err: any) {
      if (err.message.includes("404") || err.message.includes("403")) {
        router.push("/client");
        return;
      }
      setFetchError("Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (!job || TERMINAL.has(job.status)) return;
    const timer = setInterval(fetchJob, 5_000);
    return () => clearInterval(timer);
  }, [job, fetchJob]);

  const handleDownloadOutput = useCallback(async () => {
    if (!job?.outputUri) return;
    const filename = getFilenameFromUri(job.outputUri, "output");
    try {
      await downloadBlob(`/api/jobs/${job.id}/output`, filename);
    } catch (err) {
      console.error("[downloadOutput]", err);
    }
  }, [job]);

  const handleDownloadOutputFile = useCallback(
    async (file: { filename: string }) => {
      if (!job?.id) return;
      try {
        await downloadBlob(
          `/api/jobs/${job.id}/outputs?name=${encodeURIComponent(file.filename)}`,
          file.filename,
        );
      } catch (err) {
        console.error("[downloadOutputFile]", err);
      }
    },
    [job],
  );

  const handleCancel = async (): Promise<void> => {
    if (!job || !CANCELLABLE.has(job.status)) return;
    setCancelling(true);
    try {
      await api.patch(`/api/jobs/${jobId}/cancel`, {});
      await fetchJob();
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-ink" />
      </PageContainer>
    );
  }

  if (fetchError || !job) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-graphite">{fetchError || "Job not found."}</p>
        <Link
          href="/client"
          className="text-ink hover:underline text-sm"
        >
          ← Back to dashboard
        </Link>
      </PageContainer>
    );
  }

  const cfg = STATUS_CONFIG[job.status];
  const isTerminal = TERMINAL.has(job.status);
  const canCancel = CANCELLABLE.has(job.status);

  return (
    <PageContainer className="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-graphite hover:text-ink mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1.5">
                {job.title}
              </h1>
              <p className="font-mono text-xs text-stone">{job.id}</p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.border}`}
            >
              <StatusIcon status={job.status} />
              <span className={`text-sm font-semibold ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Type",
                value: job.type.charAt(0).toUpperCase() + job.type.slice(1),
              },
              {
                label: "Budget",
                value: `${Number(job.budget).toFixed(3)} SOL`,
              },
              { label: "Submitted", value: fmtDate(job.createdAt) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-none border border-hairline bg-canvas p-4"
              >
                <p className="text-xs text-stone mb-1">{label}</p>
                <p className="text-ink font-medium text-sm truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Assigned node */}
          {job.provider && (
            <div className="rounded-none border border-hairline bg-canvas p-6 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-none bg-surface-cool flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-xs text-stone mb-0.5">Assigned Node</p>
                <p className="text-ink font-semibold">
                  {job.provider.gpuModel}
                </p>
                <p className="text-xs text-stone mt-0.5">
                  {job.provider.vramGB} GB VRAM &nbsp;·&nbsp; Tier{" "}
                  {job.provider.tier}
                  {job.provider.location && (
                    <>&nbsp;·&nbsp;{job.provider.location}</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* I/O URIs */}
          <div className="rounded-none border border-hairline bg-canvas p-6 mb-6 space-y-4">
            <div>
              <p className="text-xs text-stone uppercase tracking-widest mb-2">
                Input
              </p>
              <p className="font-mono text-sm text-graphite break-all">
                {job.inputUri}
              </p>
            </div>
            {job.outputUri && (
              <div>
                <p className="text-xs text-stone uppercase tracking-widest mb-2">
                  Output
                </p>
                <button
                  type="button"
                  onClick={handleDownloadOutput}
                  className="font-mono text-sm text-ink break-all hover:underline inline-flex items-center gap-1.5"
                >
                  Download output
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Execution Logs */}
          {job.executionMetadata?.logsUri &&
            (job.status === "COMPLETED" ||
              job.status === "FAILED" ||
              job.status === "PAID" ||
              job.status === "REFUNDED") && (
              <div className="rounded-none border border-hairline bg-canvas p-6 mb-6">
                <h2 className="text-xs font-semibold text-graphite uppercase tracking-widest mb-4">
                  Execution Logs
                </h2>
                <LogViewer jobId={job.id} />
              </div>
            )}

          {/* Output Files */}
          {job.executionMetadata?.outputFiles?.length ? (
            <div className="rounded-none border border-hairline bg-canvas p-6 mb-6">
              <h2 className="text-xs font-semibold text-graphite uppercase tracking-widest mb-4">
                Output Files
              </h2>
              <div className="space-y-3">
                {job.executionMetadata.outputFiles.map((file) => (
                  <div
                    key={file.filename}
                    className="flex items-center justify-between gap-3 rounded-none border border-hairline bg-canvas p-4"
                  >
                    <span className="text-sm text-graphite truncate">
                      {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadOutputFile(file)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-hairline text-graphite hover:text-ink hover:border-hairline transition-all text-sm"
                    >
                      Download
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Execution Stats */}
          {job.executionMetadata && (
            <div className="rounded-none border border-hairline bg-canvas p-6 mb-6">
              <h2 className="text-xs font-semibold text-graphite uppercase tracking-widest mb-4">
                Execution Stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Duration"
                  value={`${(job.executionMetadata.executionTimeMs / 1000).toFixed(1)}s`}
                />
                <StatCard
                  label="Avg GPU Util"
                  value={`${job.executionMetadata.avgUtilization}%`}
                />
                <StatCard
                  label="Peak VRAM"
                  value={`${job.executionMetadata.vramUsedMb} MB`}
                />
                <StatCard
                  label="Exit Code"
                  value={String(job.executionMetadata.exitCode)}
                />
                <StatCard
                  label="Temp Delta"
                  value={`+${job.executionMetadata.tempDeltaC}°C`}
                />
                <StatCard
                  label="Power Draw"
                  value={`${job.executionMetadata.powerDrawW}W`}
                />
              </div>
            </div>
          )}

          {/* Event timeline */}
          <div className="grid grid-cols-2 gap-4 rounded-none border border-hairline bg-white/[0.025] p-5 mb-6">
            <div>
              <p className="text-xs text-stone mb-1">Budget (locked)</p>
              <p className="text-xl font-bold text-ink font-mono">
                ◎ {Number(job.escrow?.amount ?? job.budget).toFixed(3)} SOL
              </p>
            </div>
            {job.status === "COMPLETED" && job.finalCost && (
              <div>
                <p className="text-xs text-green-400/60 mb-1">Actual cost</p>
                <p className="text-xl font-bold text-green-400 font-mono">
                  ◎ {Number(job.finalCost).toFixed(3)} SOL
                </p>
                <p className="text-xs text-stone mt-1">
                  ◎ {(Number(job.budget) - Number(job.finalCost)).toFixed(3)}{" "}
                  SOL saved (5% platform fee)
                </p>
              </div>
            )}
            {job.status === "FAILED" && (
              <div>
                <p className="text-xs text-green-400/60 mb-1">Refunded</p>
                <p className="text-xl font-bold text-green-400 font-mono">
                  ◎ {Number(job.budget).toFixed(3)} SOL
                </p>
                <p className="text-xs text-stone mt-1">
                  Full refund on failure
                </p>
              </div>
            )}
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-8 mb-6">
            <h2 className="text-xs font-semibold text-graphite uppercase tracking-widest mb-8">
              Timeline
            </h2>

            {job.events.length === 0 ? (
              <p className="text-stone text-sm">No events yet.</p>
            ) : (
              <div className="relative">
                {job.events.map((ev, i) => {
                  const isLast = i === job.events.length - 1;
                  return (
                    <div key={ev.id} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            isLast
                              ? "bg-primary text-on-primary shadow-[0_0_8px_#00ffd1]"
                              : "bg-surface-cool"
                          }`}
                        />
                        {!isLast && (
                          <div className="w-px flex-1 bg-white/8 mt-1 mb-1" />
                        )}
                      </div>
                      <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                        <p className="text-ink text-sm font-medium">
                          {ev.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-stone mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDate(ev.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {!isTerminal && (
              <button
                type="button"
                onClick={fetchJob}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-none border border-hairline text-graphite hover:text-ink hover:border-hairline transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-none border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {cancelling ? "Cancelling…" : "Cancel Job"}
              </button>
            )}
          </div>
      </motion.div>
    </PageContainer>
  );
}
