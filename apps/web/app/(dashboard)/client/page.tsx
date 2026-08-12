"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { PageContainer } from "@/components/shared/page-container";
import { WalletConnectButton } from "@/components/shared/wallet-connect-button";
import { StatusBadge, type JobStatus } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  budget: number;
  finalCost: number | null;
  createdAt: string;
  completedAt: string | null;
}

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalSpent: number;
  escrowLocked: number;
}

export default function ClientDashboard(): React.JSX.Element {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const { connected, balance, shortAddress } = useWalletConnection();

  useEffect(() => {
    if (session?.user && (session.user as any).role === "PROVIDER") {
      router.push("/provider");
    }
  }, [session, router]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalSpent: 0,
    escrowLocked: 0,
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    setFetchError(false);
    Promise.all([
      api.get(`/api/jobs/my-jobs?page=${page}`),
      api.get("/api/jobs/my-stats"),
    ])
      .then(([jobsRes, statsRes]) => {
        setJobs(jobsRes.jobs ?? []);
        setStats(statsRes);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(stats.totalJobs / limit)),
    [stats.totalJobs],
  );

  return (
    <PageContainer
      title="Compute Console"
      description="Deploy AI workloads to decentralized GPU clusters instantly."
      actions={
        <Link href="/client/submit">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Deploy Workload
          </Button>
        </Link>
      }
    >

        <div className="mb-8 border border-hairline bg-canvas p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-surface-cool text-ink">◎</div>
            <div>
              <p className="text-xs text-stone">Wallet Balance</p>
              <p className="text-base text-ink">
                {connected && balance !== null ? `${balance.toFixed(3)} SOL` : "—"}
              </p>
            </div>
          </div>
          {connected ? (
            <span className="text-xs text-ink-soft">{shortAddress}</span>
          ) : (
            <WalletConnectButton showBalance={false} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            ["Active Deployments", String(stats.activeJobs)],
            ["Total Jobs", String(stats.totalJobs)],
            ["Total Spent", `${stats.totalSpent.toFixed(3)} SOL`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="p-6 border border-hairline bg-canvas flex flex-col justify-center"
            >
              <p className="text-xs text-stone uppercase">{label}</p>
              <p className="text-xl font-normal text-ink mt-2">{value}</p>
            </div>
          ))}
        </div>

        {stats.escrowLocked > 0 && (
          <div className="mb-6 flex items-center gap-2 text-xs text-ink-soft">
            <Lock className="h-4 w-4" />
            {stats.escrowLocked.toFixed(3)} SOL locked in escrow
          </div>
        )}

        {stats.activeJobs > 0 && (
          <div className="flex items-center gap-3 border border-hairline bg-surface-cool p-4 mb-6">
            <span className="h-2 w-2 rounded-full bg-ink" />
            <p className="text-sm text-ink">
              <strong>{stats.activeJobs}</strong> job{stats.activeJobs > 1 ? "s" : ""} currently running on the network
            </p>
          </div>
        )}

        {/* Jobs list */}
        <div className="border border-hairline bg-canvas overflow-hidden">
          <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Workloads</h2>
            <button
              onClick={() => router.push("/client/submit")}
              className="text-sm text-ink-soft hover:text-ink transition-colors flex items-center gap-1 font-semibold"
            >
              New Job <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-stone">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading jobs…</span>
            </div>
          )}

          {!loading && fetchError && (
            <div className="flex items-center justify-center py-16 gap-3 text-ink-soft">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Failed to load jobs. Refresh to try again.</span>
            </div>
          )}

          {!loading && !fetchError && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-t border-hairline">
              <h3 className="text-lg font-normal text-ink mb-2">No workloads yet</h3>
              <p className="text-sm text-graphite max-w-xs mb-8">
                Deploy your first compute job to get started.
              </p>
              <Link href="/client/submit">
                <Button variant="primary" size="sm">Deploy Workload</Button>
              </Link>
            </div>
          )}

          {!loading && !fetchError && jobs.length > 0 && (
            <div className="divide-y divide-hairline">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/client/jobs/${job.id}`}
                  className="group flex flex-col p-6 transition-colors hover:bg-surface-cool"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-stone">
                      {job.type}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>

                  <h3 className="text-sm font-semibold text-ink mb-1 truncate">{job.title}</h3>
                  <p className="text-xs text-stone mb-4 truncate">{job.id}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      {job.status === "COMPLETED" && job.finalCost ? (
                        <>
                          <p className="text-xs text-stone">Spent</p>
                          <p className="text-sm font-normal text-ink">
                            ◎ {Number(job.finalCost).toFixed(3)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-stone">Budget</p>
                          <p className="text-sm font-normal text-ink">
                            ◎ {Number(job.budget).toFixed(3)}
                          </p>
                        </>
                      )}
                      {job.status === "FAILED" && (
                        <p className="text-xs text-ink-soft mt-1">
                          Refunded: ◎ {Number(job.budget).toFixed(3)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone">
                        {new Date(job.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {job.completedAt && (
                        <p className="text-xs text-stone mt-1">
                          Completed {new Date(job.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {stats.totalJobs > limit && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm text-ink-soft disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-stone">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm text-ink-soft disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
    </PageContainer>
  );
}
