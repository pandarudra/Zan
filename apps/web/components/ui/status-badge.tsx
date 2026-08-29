import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

export type JobStatus =
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

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { dot: string; bg: string; border: string; label: string }
> = {
  CREATED: {
    dot: "bg-stone",
    bg: "bg-surface-cool",
    border: "border-hairline",
    label: "Pending",
  },
  FUNDED: {
    dot: "bg-info",
    bg: "bg-info-bg",
    border: "border-info/20",
    label: "In Queue",
  },
  QUEUED: {
    dot: "bg-info",
    bg: "bg-info-bg",
    border: "border-info/20",
    label: "Queued",
  },
  ASSIGNED: {
    dot: "bg-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    label: "Assigned",
  },
  RUNNING: {
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Running",
  },
  COMPLETED: {
    dot: "bg-success",
    bg: "bg-success-bg",
    border: "border-success/20",
    label: "Completed",
  },
  FAILED: {
    dot: "bg-error",
    bg: "bg-error-bg",
    border: "border-error/20",
    label: "Failed",
  },
  DISPUTED: {
    dot: "bg-warning",
    bg: "bg-warning-bg",
    border: "border-warning/20",
    label: "Disputed",
  },
  PAID: {
    dot: "bg-success",
    bg: "bg-success-bg",
    border: "border-success/20",
    label: "Paid",
  },
  REFUNDED: {
    dot: "bg-warning",
    bg: "bg-warning-bg",
    border: "border-warning/20",
    label: "Refunded",
  },
};

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps): ReactElement {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium text-ink",
        cfg.bg,
        cfg.border,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)}
      />
      {cfg.label}
    </span>
  );
}
