"use client";

import { useMemo, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Monitor,
  Zap,
  Upload,
  Coins,
  Cpu,
  Loader2,
  AlertCircle,
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Database,
  Film,
  Activity,
  Image as ImageIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { useEscrow } from "@/hooks/use-escrow";

import { WalletConnectButton } from "@/components/shared/wallet-connect-button";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

//Job type definitions
const JOB_TYPE_DEFS = [
  {
    value: "inference",
    label: "LLM Inference",
    icon: Brain,
    desc: "Batch inference, model serving, and agent pipelines at scale.",
    vramDefault: 16,
    ratePerHour: 0.004,
    frameworks: ["LLaMA-3 70B", "Mistral 7B", "Qwen 2.5", "GPT-2", "Custom"],
    inputHint: "s3://bucket/prompts.jsonl",
    category: "AI & Machine Learning",
  },
  {
    value: "training",
    label: "Model Training",
    icon: Zap,
    desc: "Full training runs on custom datasets — highest-value, long-running jobs.",
    vramDefault: 40,
    ratePerHour: 0.02,
    frameworks: ["LLaMA-3", "Stable Diffusion XL", "BERT", "ResNet", "Custom"],
    inputHint: "s3://bucket/training-data.tar.gz",
    category: "AI & Machine Learning",
  },
  {
    value: "fine-tune",
    label: "Fine-tuning",
    icon: Sparkles,
    desc: "LoRA, QLoRA, and instruction-tuning on foundation models.",
    vramDefault: 24,
    ratePerHour: 0.12,
    frameworks: ["LLaMA-3-8B", "LLaMA-3-70B", "Mistral 7B", "Phi-3", "Custom"],
    inputHint: "ipfs://Qm.../finetune-pairs.jsonl",
    category: "AI & Machine Learning",
  },
  {
    value: "embedding",
    label: "Embeddings",
    icon: Database,
    desc: "Vectorize documents, images, or code for RAG and semantic search.",
    vramDefault: 8,
    ratePerHour: 0.002,
    frameworks: ["text-embedding-3", "BGE-M3", "E5-mistral", "CLIP", "Custom"],
    inputHint: "s3://bucket/documents.jsonl",
    category: "AI & Machine Learning",
  },
  {
    value: "render",
    label: "3D Rendering",
    icon: Monitor,
    desc: "GPU render farms for Blender, Unreal, and Cinema 4D scene batches.",
    vramDefault: 0,
    ratePerHour: 0.008,
    frameworks: ["Blender", "Cinema 4D", "Unreal Engine", "V-Ray", "Custom"],
    inputHint: "s3://bucket/scene.blend",
    category: "Creative & Media",
  },
  {
    value: "image-gen",
    label: "Image Generation",
    icon: ImageIcon,
    desc: "Stable Diffusion, FLUX, and ControlNet batch pipelines.",
    vramDefault: 12,
    ratePerHour: 0.006,
    frameworks: ["SDXL", "FLUX.1-dev", "SD 1.5", "ControlNet", "Custom"],
    inputHint: "ipfs://Qm.../prompts.txt",
    category: "Creative & Media",
  },
  {
    value: "video-gen",
    label: "Video & Upscaling",
    icon: Film,
    desc: "AI video generation, frame interpolation, and 4K upscaling.",
    vramDefault: 24,
    ratePerHour: 0.015,
    frameworks: ["AnimateDiff", "RIFE", "Real-ESRGAN", "FILM", "Custom"],
    inputHint: "s3://bucket/source-frames.tar.gz",
    category: "Creative & Media",
  },
  {
    value: "pipeline",
    label: "Data Pipeline",
    icon: Activity,
    desc: "GPU-accelerated ETL, RAPIDS feature engineering, and ML preprocessing.",
    vramDefault: 8,
    ratePerHour: 0.004,
    frameworks: ["RAPIDS cuDF", "CuPy", "Spark GPU", "Dask-CUDA", "Custom"],
    inputHint: "s3://bucket/raw-data.parquet",
    category: "Scientific & Data",
  },
  {
    value: "python_script",
    label: "Python Script",
    icon: FileText,
    desc: "Run any Python script. Upload your .py file and get logs + outputs back.",
    vramDefault: 0,
    ratePerHour: 0.001,
    frameworks: ["NumPy", "Pandas", "Scikit-learn", "OpenCV", "Custom"],
    inputHint: "Upload a .py file above",
    category: "Scientific & Data",
  },
  {
    value: "python_gpu",
    label: "Python (GPU)",
    icon: Zap,
    desc: "Python + PyTorch CUDA runtime for GPU workloads.",
    vramDefault: 4,
    ratePerHour: 0.006,
    frameworks: ["PyTorch", "CUDA", "Diffusers", "Custom"],
    inputHint: "Upload a .py file above",
    category: "Scientific & Data",
  },
] as const;

type JobTypeValue = (typeof JOB_TYPE_DEFS)[number]["value"];

const CATEGORIES = [
  "AI & Machine Learning",
  "Creative & Media",
  "Scientific & Data",
] as const;

const DURATION_OPTIONS = [
  { value: "short", label: "< 1 hour" },
  { value: "medium", label: "1 – 4 hours" },
  { value: "long", label: "4 – 12 hours" },
  { value: "extended", label: "12 – 48 hours" },
  { value: "batch", label: "48+ hours" },
] as const;
type DurationValue = (typeof DURATION_OPTIONS)[number]["value"];

const TIER_INFO: Record<0 | 1 | 2, { label: string; hint: string }> = {
  0: { label: "Any", hint: "No preference" },
  1: { label: "Trusted", hint: "Staked providers" },
  2: { label: "Verified", hint: "HW attested" },
};

type Priority = "standard" | "rush";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".py",
  ".zip",
  ".tar.gz",
  ".json",
  ".jsonl",
  ".csv",
  ".txt",
  ".blend",
] as const;

interface UploadResponse {
  filename: string;
  downloadUrl?: string;
  uri?: string;
}

interface PrepareJobResponse {
  jobId: string;
  jobNumericId: string;
}

interface SubmitJobResponse {
  jobId: string;
}

function getSubmissionError(error: unknown): string {
  const fallback = "Network error. Please check your connection and try again.";
  if (!(error instanceof Error) || !error.message) return fallback;

  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    return parsed.error || fallback;
  } catch {
    return error.message;
  }
}

// Helpers
function FieldLabel({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
}): React.ReactElement {
  const content = (
    <>
      <span>
        {children}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </span>
      {hint && <span className="text-xs font-normal text-stone">{hint}</span>}
    </>
  );

  const className =
    "mb-2.5 flex items-center justify-between gap-4 text-sm font-medium text-ink-soft";

  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {content}
    </label>
  ) : (
    <div className={className}>{content}</div>
  );
}

function FileUploader({
  onUploaded,
}: {
  onUploaded: (uri: string, filename: string) => void;
}): React.ReactElement {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    const filename = file.name.toLowerCase();
    const allowedType = ALLOWED_FILE_EXTENSIONS.some((extension) =>
      filename.endsWith(extension),
    );

    if (!allowedType) {
      setError(
        "Choose a supported .py, .zip, .tar.gz, .json, .jsonl, .csv, .txt, or .blend file.",
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be 100 MB or smaller.");
      return;
    }

    setUploading(true);
    setUploaded(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const session = await getSession();
    const token = (session as typeof session & { accessToken?: string })
      ?.accessToken;

    try {
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const uploadError = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(uploadError.error ?? "Upload failed");
      }

      const data = (await res.json()) as UploadResponse;
      const uri = data.downloadUrl ?? data.uri;
      if (!uri) throw new Error("Upload completed without a file URL.");

      setUploaded(data.filename);
      onUploaded(uri, data.filename);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3">
      <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline bg-surface-cool p-6 text-center transition-colors hover:border-ink">
        <Upload aria-hidden="true" className="h-6 w-6 text-stone" />
        <span className="text-sm text-graphite">
          {uploading ? "Uploading…" : "Choose a file to upload"}
        </span>
        <span className="text-xs text-stone">
          .py · .zip · .json · .csv · .txt · .blend · 100MB max
        </span>
        <input
          type="file"
          className="hidden"
          accept=".py,.zip,.tar.gz,.json,.jsonl,.csv,.txt,.blend"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
      {uploading && (
        <div
          role="status"
          className="mt-3 flex items-center gap-2 text-sm text-graphite"
        >
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          Uploading file…
        </div>
      )}
      {uploaded && !uploading && (
        <div
          role="status"
          className="mt-3 flex items-center gap-2 text-sm text-success"
        >
          <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          {uploaded} uploaded successfully
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

// Page
export default function SubmitJobPage(): React.ReactElement {
  const router = useRouter();
  const { connected, balance, address } = useWalletConnection();

  const { createJobEscrow } = useEscrow();
  const [jobType, setJobType] = useState<JobTypeValue>("inference");
  const [framework, setFramework] = useState("");
  const [customFramework, setCustomFramework] = useState("");
  const [title, setTitle] = useState("");
  const [inputUri, setInputUri] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState<DurationValue>("medium");
  const [requiredVram, setRequiredVram] = useState("0");
  const [gpuTier, setGpuTier] = useState<0 | 1 | 2>(0);
  const [priority, setPriority] = useState<Priority>("standard");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const typeDef = JOB_TYPE_DEFS.find((t) => t.value === jobType)!;

  const handleTypeChange = (v: JobTypeValue) => {
    setJobType(v);
    setFramework("");
    setCustomFramework("");
    const def = JOB_TYPE_DEFS.find((t) => t.value === v)!;
    setRequiredVram(String(def.vramDefault));
    // Default Python jobs to "Any" trust tier so tier-0 providers can match.
    if (v === "python_script" || v === "python_gpu") {
      setGpuTier(0);
    }
  };

  const handleFrameworkClick = (fw: string) => {
    const next = fw === framework ? "" : fw;
    setFramework(next);
    if (next && next !== "Custom" && !title.trim()) {
      const def = JOB_TYPE_DEFS.find((t) => t.value === jobType)!;
      setTitle(`${next} ${def.label.toLowerCase()}`);
    }
  };

  const budgetNum = Number(budget);
  const validBudget = !Number.isNaN(budgetNum) && budgetNum > 0;
  const vramNum = requiredVram === "" ? null : Number(requiredVram);
  const validVram =
    vramNum === null ||
    (Number.isFinite(vramNum) && vramNum >= 0 && vramNum <= 160);
  const estHours = validBudget ? budgetNum / typeDef.ratePerHour : 0;
  const effectiveFw = (
    framework === "Custom" ? customFramework : framework
  ).trim();

  const readiness = useMemo(
    () =>
      [
        title.trim() && "Job named",
        inputUri.trim() && "Input attached",
        validBudget && "Budget set",
        effectiveFw && `Framework: ${effectiveFw}`,
      ].filter(Boolean) as string[],
    [title, inputUri, validBudget, effectiveFw],
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !inputUri.trim() || !budget || !effectiveFw) {
      setError("Please fill in title, framework, input URI, and budget.");
      return;
    }
    if (title.trim().length > 100) {
      setError("Title must be 100 characters or fewer.");
      return;
    }
    if (!validBudget) {
      setError("Budget must be a positive number.");
      return;
    }
    if (!validVram) {
      setError("Minimum VRAM must be between 0 and 160 GB.");
      return;
    }
    if (!connected || !address) {
      setError("Connect your wallet before submitting.");
      return;
    }
    if (balance === null) {
      setError("Wallet balance is unavailable. Please try again.");
      return;
    }
    if (budgetNum > balance) {
      setError("Insufficient balance for this budget.");
      return;
    }
    setSubmitting(true);

    // Resolve dockerImage and timeLimitSecs based on job type for the MVP
    let mappedType: string = jobType;
    let dockerImage = "gnet/custom:latest";
    let timeLimitSecs = 3600;

    if (jobType === "render") {
      mappedType = "blender_render";
      dockerImage = "linuxserver/blender:latest";
      timeLimitSecs = 7200;
    } else if (jobType === "image-gen") {
      mappedType = "stable_diffusion";
      dockerImage = "universonic/stable-diffusion-webui:minimal";
      timeLimitSecs = 300;
    } else if (jobType === "video-gen") {
      mappedType = "ffmpeg_transcode";
      dockerImage = "jrottenberg/ffmpeg:6.0-ubuntu1804";
      timeLimitSecs = 1800;
    } else if (jobType === "python_script") {
      dockerImage = "python:3.11-slim";
      timeLimitSecs = 300;
    } else if (jobType === "python_gpu") {
      dockerImage = "python:3.11-slim";
      timeLimitSecs = 3600;
    }

    try {
      const prepareResponse = (await api.post("/api/jobs/submit/prepare", {
        title: title.trim(),
        type: mappedType,
        dockerImage,
        inputUri: inputUri.trim(),
        jobParams: { framework: effectiveFw, notes, priority },
        budget: budgetNum,
        requiredVramGB: requiredVram === "" ? undefined : Number(requiredVram),
        requiredGpuTier: gpuTier,
        clientWalletAddress: address,
        timeLimitSecs,
      })) as PrepareJobResponse;

      const stakeSignature = await createJobEscrow(
        String(prepareResponse.jobNumericId),
        Math.round(budgetNum * 1_000_000_000),
      );

      const data = (await api.post("/api/jobs/submit", {
        jobId: prepareResponse.jobId,
        clientWalletAddress: address,
        stakeSignature,
      })) as SubmitJobResponse;

      router.push(`/client/jobs/${data.jobId}`);
    } catch (submissionError) {
      setError(getSubmissionError(submissionError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Deploy Workload"
      description="Choose a compute class, define requirements, attach your payload URI, and lock escrow. The matchmaker routes it to the right GPU."
      actions={
        <Link
          href="/client"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-graphite transition-colors hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to dashboard
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit}
        aria-describedby={error ? "submission-error" : undefined}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8"
      >
        <div className="space-y-6">
          {/*Workload class*/}
          <section className="rounded-lg border border-hairline bg-canvas p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                Step 1
              </p>
              <h2 className="mt-2 text-xl font-medium text-ink">
                Workload class
              </h2>
              <p className="mt-1 text-sm text-graphite">
                Select the compute pattern that matches your job.
              </p>
            </div>

            {CATEGORIES.map((cat) => (
              <div key={cat} className="mb-6 last:mb-0">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                  {cat}
                </p>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {JOB_TYPE_DEFS.filter((t) => t.category === cat).map(
                    ({ value, label, icon: Icon, desc, vramDefault }) => {
                      const selected = jobType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleTypeChange(value)}
                          aria-pressed={selected}
                          className={`min-h-40 rounded-lg border p-3 text-left transition-colors sm:p-4 ${
                            selected
                              ? "border-ink bg-surface-cool"
                              : "border-hairline bg-canvas hover:border-ink hover:bg-surface-cool"
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <Icon
                              aria-hidden="true"
                              className={`h-5 w-5 ${selected ? "text-ink" : "text-stone"}`}
                            />
                            {selected && (
                              <CheckCircle2
                                aria-hidden="true"
                                className="h-4 w-4 text-ink"
                              />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-ink">
                            {label}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-graphite">
                            {desc}
                          </p>
                          <p className="mt-2 text-xs text-stone">
                            {vramDefault}+ GB VRAM
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Job details*/}
          <section className="rounded-lg border border-hairline bg-canvas p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <FileText aria-hidden="true" className="h-5 w-5 text-ink" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  Step 2
                </p>
                <h2 className="mt-1 text-xl font-medium text-ink">
                  Job details
                </h2>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Title */}
              <div>
                <FieldLabel
                  htmlFor="job-title"
                  required
                  hint={`${title.length}/100`}
                >
                  Title
                </FieldLabel>
                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${typeDef.frameworks[0]} ${typeDef.label.toLowerCase()} run`}
                  required
                  maxLength={100}
                  className="h-12 w-full rounded-lg border border-hairline bg-surface-cool px-4 text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                />
              </div>

              {/* Framework */}
              <div>
                <FieldLabel required>Framework / model</FieldLabel>
                <div
                  role="group"
                  aria-label="Framework or model"
                  className="flex flex-wrap gap-2"
                >
                  {typeDef.frameworks.map((fw) => (
                    <button
                      key={fw}
                      type="button"
                      onClick={() => handleFrameworkClick(fw)}
                      aria-pressed={framework === fw}
                      className={`min-h-11 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        framework === fw
                          ? "border-ink bg-surface-cool text-ink"
                          : "border-hairline bg-canvas text-graphite hover:border-ink hover:text-ink"
                      }`}
                    >
                      {fw}
                    </button>
                  ))}
                </div>
                {framework === "Custom" && (
                  <div className="mt-3">
                    <label htmlFor="custom-framework" className="sr-only">
                      Custom framework
                    </label>
                    <input
                      id="custom-framework"
                      type="text"
                      value={customFramework}
                      onChange={(e) => setCustomFramework(e.target.value)}
                      placeholder="e.g. my-fine-tuned-llama3"
                      required
                      className="h-12 w-full rounded-lg border border-hairline bg-surface-cool px-4 text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                    />
                  </div>
                )}
              </div>

              {/* Input URI */}
              <div>
                <FieldLabel
                  htmlFor="input-uri"
                  required
                  hint="S3 · IPFS · HTTPS"
                >
                  Input URI
                </FieldLabel>
                <FileUploader
                  onUploaded={(uri, filename) => {
                    setInputUri(uri);
                    if (!title.trim())
                      setTitle(filename.replace(/\.[^.]+$/, "") + " job");
                  }}
                />
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-surface-cool" />
                  <span className="text-xs text-stone">
                    or paste URI manually
                  </span>
                  <div className="h-px flex-1 bg-surface-cool" />
                </div>
                <div className="relative">
                  <Upload
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
                  />
                  <input
                    id="input-uri"
                    type="text"
                    value={inputUri}
                    onChange={(e) => setInputUri(e.target.value)}
                    placeholder={typeDef.inputHint}
                    required
                    className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-4 font-mono text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                  />
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-stone">
                    Upload a file or provide an accessible payload URI.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setInputUri(
                        `ipfs://QmZanTestFixture/${jobType}-input.json`,
                      )
                    }
                    className="min-h-11 self-start rounded-lg border border-hairline bg-surface-cool px-3 text-xs font-medium text-graphite transition-colors hover:border-ink hover:text-ink sm:self-auto"
                  >
                    Use test URI
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <FieldLabel htmlFor="run-notes" hint="Optional">
                  Run notes
                </FieldLabel>
                <textarea
                  id="run-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Container image, model checkpoints, expected output path, hyperparameters, or verifier instructions."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-hairline bg-surface-cool px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                />
              </div>
            </div>
          </section>

          {/* Requirements */}
          <section className="rounded-lg border border-hairline bg-canvas p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Cpu aria-hidden="true" className="h-5 w-5 text-ink" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  Step 3
                </p>
                <h2 className="mt-1 text-xl font-medium text-ink">
                  Requirements
                </h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Budget */}
              <div>
                <FieldLabel htmlFor="budget" required hint="SOL">
                  Budget
                </FieldLabel>
                <div className="relative">
                  <Coins
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
                  />
                  <input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.500"
                    min="0.001"
                    step="0.001"
                    required
                    className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                  />
                </div>
                {validBudget && (
                  <p className="mt-1.5 text-xs text-stone">
                    ≈ {estHours.toFixed(1)} hrs at {typeDef.ratePerHour} SOL/hr
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <FieldLabel htmlFor="duration" hint="Expected runtime">
                  Estimated Duration
                </FieldLabel>
                <div className="relative">
                  <Clock
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
                  />
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value as DurationValue)
                    }
                    className="h-14 w-full appearance-none rounded-lg border border-hairline bg-surface-cool pl-12 pr-10 text-base text-ink outline-none transition-colors focus:border-ink"
                  >
                    {DURATION_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-gray-900">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min VRAM */}
              <div>
                <FieldLabel htmlFor="minimum-vram" hint="0–160 GB">
                  Minimum VRAM
                </FieldLabel>
                <div className="relative">
                  <Cpu
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
                  />
                  <input
                    id="minimum-vram"
                    type="number"
                    value={requiredVram}
                    onChange={(e) => setRequiredVram(e.target.value)}
                    min="0"
                    max="160"
                    step="1"
                    aria-invalid={!validVram}
                    aria-describedby={!validVram ? "vram-error" : undefined}
                    className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                  />
                </div>
                {!validVram && (
                  <p
                    id="vram-error"
                    role="alert"
                    className="mt-2 text-xs text-error"
                  >
                    Enter a value between 0 and 160 GB.
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <FieldLabel>Priority</FieldLabel>
                <div
                  role="group"
                  aria-label="Priority"
                  className="grid grid-cols-2 gap-3"
                >
                  {(["standard", "rush"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={priority === p}
                      className={`h-14 rounded-lg border text-sm font-semibold transition-colors ${
                        priority === p
                          ? "border-ink bg-surface-cool text-ink"
                          : "border-hairline bg-canvas text-graphite hover:border-ink hover:text-ink"
                      }`}
                    >
                      {p === "standard" ? "Standard" : "Rush"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GPU Tier */}
            <div className="mt-6">
              <FieldLabel>GPU Trust Tier</FieldLabel>
              <div
                role="group"
                aria-label="GPU trust tier"
                className="grid grid-cols-3 gap-3"
              >
                {([0, 1, 2] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setGpuTier(tier)}
                    aria-pressed={gpuTier === tier}
                    className={`min-h-16 rounded-lg border px-2 py-3 text-center transition-colors sm:px-3 ${
                      gpuTier === tier
                        ? "border-ink bg-surface-cool text-ink"
                        : "border-hairline bg-canvas text-graphite hover:border-ink hover:text-ink"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {TIER_INFO[tier].label}
                    </span>
                    <span className="mt-1 block text-xs opacity-70">
                      {TIER_INFO[tier].hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="xl:sticky xl:top-6">
          <div className="rounded-lg border border-hairline bg-canvas p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                Deployment quote
              </p>
              <div className="mt-2 flex items-center gap-3">
                <typeDef.icon aria-hidden="true" className="h-6 w-6 text-ink" />
                <h2 className="text-xl font-medium text-ink">
                  {typeDef.label}
                </h2>
              </div>
            </div>

            <div className="space-y-3.5 border-y border-hairline py-5">
              {(
                [
                  [
                    "Budget",
                    validBudget ? `${budgetNum.toFixed(3)} SOL` : "Set amount",
                  ],
                  [
                    "Est. Runtime",
                    validBudget ? `${estHours.toFixed(1)} hrs` : "Pending",
                  ],
                  [
                    "Duration",
                    DURATION_OPTIONS.find((d) => d.value === duration)?.label ??
                      "–",
                  ],
                  ["Min VRAM", requiredVram ? `${requiredVram} GB` : "Any"],
                  ["Trust", TIER_INFO[gpuTier].label],
                  [
                    "Wallet",
                    connected
                      ? balance === null
                        ? "Checking balance"
                        : `${balance.toFixed(3)} SOL`
                      : "Not connected",
                  ],
                  ["Priority", priority === "rush" ? "Rush queue" : "Standard"],
                  ...(effectiveFw ? [["Framework", effectiveFw]] : []),
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-graphite">{label}</span>
                  <span className="max-w-[160px] truncate text-right text-sm font-semibold text-ink">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-hairline bg-surface-cool p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-ink" />
                <p className="text-sm font-semibold text-ink">
                  On-chain escrow
                </p>
              </div>
              <p className="text-sm leading-relaxed text-ink/70">
                Funds will be locked in a Solana smart contract. The provider is
                only paid after verifiable completion.
              </p>
            </div>

            {readiness.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                  {readiness.length} of 4 ready
                </p>
                {readiness.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-graphite"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-success"
                    />
                    {item}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div
                id="submission-error"
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-lg border border-error/20 bg-error-bg p-4 text-sm leading-relaxed text-error"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                {error}
              </div>
            )}

            {!connected && (
              <div className="mt-4 rounded-lg border border-warning/20 bg-warning-bg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-warning"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Wallet required
                    </p>
                    <p className="mt-1 text-xs leading-5 text-graphite">
                      Connect your Solana wallet to lock funds and deploy
                    </p>
                  </div>
                </div>
                <WalletConnectButton
                  className="mt-3 w-full justify-center"
                  showBalance={false}
                />
              </div>
            )}

            {connected && balance === null && (
              <div
                role="status"
                className="mt-4 flex items-center gap-3 rounded-lg border border-hairline bg-surface-cool p-4 text-sm text-graphite"
              >
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 animate-spin"
                />
                Checking wallet balance…
              </div>
            )}

            {connected &&
              balance !== null &&
              balance < budgetNum &&
              budgetNum > 0 && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-error/20 bg-error-bg p-4 text-sm leading-6 text-error"
                >
                  Insufficient balance. You have {balance.toFixed(3)} SOL, but
                  this workload requires {budgetNum.toFixed(3)} SOL.
                </div>
              )}

            <Button
              type="submit"
              disabled={
                submitting ||
                !connected ||
                balance === null ||
                (balance !== null && balance < budgetNum)
              }
              aria-busy={submitting}
              className="mt-6 h-14 w-full rounded-lg text-base"
            >
              {submitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="mr-2 h-5 w-5 animate-spin"
                  />
                  Preparing escrow…
                </>
              ) : (
                <>
                  <Lock aria-hidden="true" className="mr-2 h-5 w-5" />
                  Lock funds &amp; deploy
                </>
              )}
            </Button>
          </div>
        </aside>
      </form>
    </PageContainer>
  );
}
