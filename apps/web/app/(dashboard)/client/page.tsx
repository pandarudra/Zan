"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, ArrowRight, Loader2, Lock, Plus } from "lucide-react";
import { PageContainer } from "@/components/shared/page-container";
import { WalletConnectButton } from "@/components/shared/wallet-connect-button";
import { Button } from "@/components/ui/button";
import { StatusBadge, type JobStatus } from "@/components/ui/status-badge";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { api } from "@/lib/api";

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

interface JobsResponse {
  jobs?: Job[];
}

const PAGE_SIZE = 20;
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function ClientDashboard(): React.JSX.Element {
  const { status } = useSession();
  const router = useRouter();
  const { connected, balance, shortAddress } = useWalletConnection();
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

  useEffect(() => {
    if (status !== "authenticated") return;

    setLoading(true);
    setFetchError(false);
    Promise.all([
      api.get(`/api/jobs/my-jobs?page=${page}`),
      api.get("/api/jobs/my-stats"),
    ])
      .then(([jobsResponse, statsResponse]) => {
        const nextStats = statsResponse as DashboardStats;
        const lastPage = Math.max(
          1,
          Math.ceil(nextStats.totalJobs / PAGE_SIZE),
        );

        setJobs((jobsResponse as JobsResponse).jobs ?? []);
        setStats(nextStats);
        setPage((current) => Math.min(current, lastPage));
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(stats.totalJobs / PAGE_SIZE)),
    [stats.totalJobs],
  );
  const overviewStats = [
    { label: "Active deployments", value: String(stats.activeJobs) },
    { label: "Total workloads", value: String(stats.totalJobs) },
    { label: "Total spent", value: `${stats.totalSpent.toFixed(3)} SOL` },
  ];

  return (
    <PageContainer
      title="Compute Console"
      description="Deploy and monitor AI workloads across the Zan compute network."
      actions={
        <Button
          type="button"
          onClick={() => router.push("/client/submit")}
          className="h-11 w-full rounded-lg px-5 sm:w-auto"
        >
          <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
          Deploy workload
        </Button>
      }
    >
      <section aria-label="Account overview" className="space-y-4">
        <div className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
          {overviewStats.map(({ label, value }) => (
            <div key={label} className="bg-canvas px-5 py-6 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                {label}
              </p>
              <p className="mt-3 text-2xl font-normal tracking-[-0.02em] text-ink">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-surface-cool p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-hairline bg-canvas text-base text-ink"
            >
              ◎
            </div>
            <div className="min-w-0">
              <p className="text-xs text-stone">Wallet balance</p>
              <p className="mt-1 truncate text-base font-medium text-ink">
                {connected
                  ? balance === null
                    ? "Loading balance…"
                    : `${balance.toFixed(3)} SOL`
                  : "Wallet not connected"}
              </p>
            </div>
          </div>

          {connected ? (
            <span className="truncate text-sm text-ink-soft">
              {shortAddress}
            </span>
          ) : (
            <WalletConnectButton
              className="w-full sm:w-auto"
              showBalance={false}
            />
          )}
        </div>
      </section>

      <div className="mt-6 space-y-3">
        {stats.escrowLocked > 0 && (
          <div className="flex min-h-11 items-center gap-3 rounded-lg border border-hairline bg-surface-cool px-4 py-3 text-sm text-ink-soft">
            <Lock aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>
              <strong className="font-semibold text-ink">
                {stats.escrowLocked.toFixed(3)} SOL
              </strong>{" "}
              locked in escrow
            </span>
          </div>
        )}

        {stats.activeJobs > 0 && (
          <div className="flex min-h-11 items-center gap-3 rounded-lg border border-hairline bg-surface-cool px-4 py-3 text-sm text-ink-soft">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-success"
            />
            <span>
              <strong className="font-semibold text-ink">
                {stats.activeJobs} active job{stats.activeJobs === 1 ? "" : "s"}
              </strong>{" "}
              running on the network
            </span>
          </div>
        )}
      </div>

      <section
        aria-labelledby="recent-workloads-title"
        className="mt-8 overflow-hidden rounded-lg border border-hairline bg-canvas"
      >
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-hairline px-4 sm:px-6">
          <div>
            <h2
              id="recent-workloads-title"
              className="text-base font-semibold text-ink"
            >
              Recent workloads
            </h2>
            <p className="mt-0.5 text-xs text-stone">
              Your latest deployments and their status
            </p>
          </div>
          <Link
            href="/client/submit"
            className="flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <span className="hidden sm:inline">New workload</span>
            <span className="sm:hidden">New</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div
            role="status"
            className="flex min-h-64 items-center justify-center gap-3 px-4 text-stone"
          >
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading workloads…</span>
          </div>
        )}

        {!loading && fetchError && (
          <div
            role="alert"
            className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-error-bg text-error">
              <AlertCircle aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                Workloads unavailable
              </h3>
              <p className="mt-1 text-sm text-graphite">
                Refresh the page to try loading them again.
              </p>
            </div>
          </div>
        )}

        {!loading && !fetchError && jobs.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-hairline bg-surface-cool text-xl text-ink"
            >
              +
            </div>
            <h3 className="mt-5 text-lg font-medium text-ink">
              No workloads yet
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-graphite">
              Deploy your first compute job to start using the network.
            </p>
            <Button
              type="button"
              onClick={() => router.push("/client/submit")}
              className="mt-6 h-11 rounded-lg px-5"
            >
              Deploy workload
            </Button>
          </div>
        )}

        {!loading && !fetchError && jobs.length > 0 && (
          <>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,2fr)_120px_120px_140px] gap-5 border-b border-hairline bg-surface-cool px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone md:grid"
            >
              <span>Workload</span>
              <span>Status</span>
              <span>Cost</span>
              <span>Created</span>
            </div>
            <ul className="divide-y divide-hairline">
              {jobs.map((job) => {
                const hasFinalCost =
                  job.status === "COMPLETED" && job.finalCost !== null;
                const amount = hasFinalCost ? job.finalCost : job.budget;

                return (
                  <li key={job.id}>
                    <Link
                      href={`/client/jobs/${job.id}`}
                      aria-label={`View ${job.title}`}
                      className="group grid min-w-0 gap-4 px-4 py-5 transition-colors hover:bg-surface-cool sm:px-6 md:grid-cols-[minmax(0,2fr)_120px_120px_140px] md:items-center md:gap-5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-4 md:block">
                          <div className="min-w-0">
                            <p
                              title={job.title}
                              className="truncate text-sm font-semibold text-ink"
                            >
                              {job.title}
                            </p>
                            <p className="mt-1 truncate text-xs uppercase tracking-[0.08em] text-stone">
                              {job.type} · {job.id}
                            </p>
                          </div>
                          <StatusBadge
                            status={job.status}
                            className="shrink-0 md:hidden"
                          />
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <StatusBadge status={job.status} />
                      </div>

                      <div className="flex items-end justify-between md:block">
                        <div>
                          <p className="text-xs text-stone md:hidden">
                            {hasFinalCost ? "Spent" : "Budget"}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink md:mt-0">
                            ◎ {Number(amount).toFixed(3)}
                          </p>
                          {job.status === "FAILED" && (
                            <p className="mt-1 text-xs text-ink-soft">
                              Refunded
                            </p>
                          )}
                        </div>
                        <div className="text-right md:hidden">
                          <p className="text-xs text-stone">Created</p>
                          <time
                            dateTime={job.createdAt}
                            className="mt-1 block text-sm text-ink-soft"
                          >
                            {DATE_FORMATTER.format(new Date(job.createdAt))}
                          </time>
                          {job.completedAt && (
                            <p className="mt-1 text-xs text-stone">
                              Completed{" "}
                              {DATE_FORMATTER.format(new Date(job.completedAt))}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <time
                          dateTime={job.createdAt}
                          className="text-sm text-ink-soft"
                        >
                          {DATE_FORMATTER.format(new Date(job.createdAt))}
                        </time>
                        {job.completedAt && (
                          <p className="mt-1 text-xs text-stone">
                            Completed{" "}
                            {DATE_FORMATTER.format(new Date(job.completedAt))}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {stats.totalJobs > PAGE_SIZE && (
        <nav
          aria-label="Workload pagination"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            type="button"
            variant="ghost"
            disabled={page === 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="h-11 rounded-lg"
          >
            Previous
          </Button>
          <span className="px-2 text-sm text-stone" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            disabled={page >= totalPages || loading}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="h-11 rounded-lg"
          >
            Next
          </Button>
        </nav>
      )}
    </PageContainer>
  );
}
