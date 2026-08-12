"use client";

import { useMemo, useState } from "react";
import { getSession, useSession } from "next-auth/react";
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
    vramDefault: 0, // needd to change to 4
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

// Helpers
function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}): React.ReactElement {
  return (
    <label className="mb-2.5 flex items-center justify-between gap-4 text-sm font-medium text-graphite">
      <span>
        {children}
        {required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {hint && (
        <span className="text-xs font-normal text-stone">{hint}</span>
      )}
    </label>
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
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const session = await getSession();
    const token = (session as any)?.accessToken;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Upload failed");
      }

      const data = await res.json();
      setUploaded(data.filename);
      onUploaded(data.downloadUrl ?? data.uri, data.filename);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-none border-2 border-dashed border-hairline p-6 transition-colors hover:border-ink">
        <Upload className="h-6 w-6 text-stone" />
        <span className="text-sm text-graphite">
          {uploading ? "Uploading..." : "Drop file here or click to upload"}
        </span>
        <span className="text-xs text-stone">
          .py · .zip · .json · .csv · .txt · .blend · 100MB max
        </span>
        <input
          type="file"
          className="hidden"
          accept=".py,.zip,.tar.gz,.json,.jsonl,.csv,.txt,.blend"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-graphite">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading to MinIO...
        </div>
      )}
      {uploaded && !uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {uploaded} uploaded successfully
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

// Page
export default function SubmitJobPage(): React.ReactElement {
  useSession({ required: true });
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
  const estHours = validBudget ? budgetNum / typeDef.ratePerHour : 0;
  const effectiveFw = framework === "Custom" ? customFramework : framework;

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
    if (!title.trim() || !inputUri.trim() || !budget) {
      setError("Please fill in title, input URI, and budget.");
      return;
    }
    if (!validBudget) {
      setError("Budget must be a positive number.");
      return;
    }
    if (!connected) {
      setError("Connect your wallet before submitting.");
      return;
    }
    if (balance !== null && budgetNum > balance) {
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
      const prepareResponse = await api.post("/api/jobs/submit/prepare", {
        title: title.trim(),
        type: mappedType,
        dockerImage,
        inputUri: inputUri.trim(),
        jobParams: { framework: effectiveFw, notes, priority },
        budget: budgetNum,
        requiredVramGB:
          requiredVram === "" ? undefined : Math.max(0, Number(requiredVram)),
        requiredGpuTier: gpuTier,
        clientWalletAddress: address,
        timeLimitSecs,
      });



      const stakeSignature = await createJobEscrow(
        String(prepareResponse.jobNumericId),
        Math.round(budgetNum * 1_000_000_000),
      );

      const data = await api.post("/api/jobs/submit", {
        jobId: prepareResponse.jobId,
        clientWalletAddress: address,
        stakeSignature,
      });



      router.push(`/client/jobs/${data.jobId}`);
    } catch (err: any) {
      let msg = "Network error. Please check your connection and try again.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) msg = parsed.error;
      } catch {
        // Keep default
      }
      setError(msg);
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
          className="inline-flex items-center gap-2 text-sm font-medium text-graphite transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      }
    >

          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
          >
            <div className="space-y-8">
              {/*Workload class*/}
              <section className="border border-hairline bg-canvas p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">
                    Workload Class
                  </h2>
                  <p className="mt-1 text-sm text-graphite">
                    Select the compute pattern that matches your job.
                  </p>
                </div>

                {CATEGORIES.map((cat) => (
                  <div key={cat} className="mb-6 last:mb-0">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone">
                      {cat}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {JOB_TYPE_DEFS.filter((t) => t.category === cat).map(
                        ({ value, label, icon: Icon, desc, vramDefault }) => {
                          const selected = jobType === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleTypeChange(value)}
                              aria-pressed={selected}
                              className={`border p-4 text-left transition-colors ${
                                selected
                                  ? "border-ink bg-surface-cool"
                                  : "border-hairline bg-canvas hover:border-ink"
                              }`}
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <Icon
                                  className={`h-5 w-5 ${selected ? "text-ink" : "text-stone"}`}
                                />
                                {selected && (
                                  <CheckCircle2 className="h-4 w-4 text-ink" />
                                )}
                              </div>
                              <p className="text-sm font-bold text-ink">
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
              <section className="border border-hairline bg-canvas p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-ink" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone">
                      Step 2
                    </p>
                    <h2 className="mt-0.5 text-2xl font-bold text-ink">
                      Job Details
                    </h2>
                  </div>
                </div>

                <div className="grid gap-6">
                  {/* Title */}
                  <div>
                    <FieldLabel required hint={`${title.length}/100`}>
                      Title
                    </FieldLabel>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`${typeDef.frameworks[0]} ${typeDef.label.toLowerCase()} run`}
                      maxLength={100}
                      className="h-12 w-full border border-hairline bg-canvas px-4 text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
                    />
                  </div>

                  {/* Framework */}
                  <div>
                    <FieldLabel hint="Optional">Framework / Model</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {typeDef.frameworks.map((fw) => (
                        <button
                          key={fw}
                          type="button"
                          onClick={() => handleFrameworkClick(fw)}
                          className={`rounded-none border px-3.5 py-2 text-sm font-medium transition-all ${
                            framework === fw
                              ? "border-ink bg-surface-cool text-ink"
                              : "border-hairline bg-canvas text-graphite hover:border-hairline hover:text-ink"
                          }`}
                        >
                          {fw}
                        </button>
                      ))}
                    </div>
                    {framework === "Custom" && (
                      <input
                        type="text"
                        value={customFramework}
                        onChange={(e) => setCustomFramework(e.target.value)}
                        placeholder="e.g. my-fine-tuned-llama3"
                        className="mt-3 h-12 w-full rounded-none border border-hairline bg-canvas px-5 text-sm text-ink outline-none transition-all placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    )}
                  </div>

                  {/* Input URI */}
                  <div>
                    <FieldLabel required hint="S3 · IPFS · HTTPS">
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
                      <Upload className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" />
                      <input
                        type="text"
                        value={inputUri}
                        onChange={(e) => setInputUri(e.target.value)}
                        placeholder={typeDef.inputHint}
                        className="h-14 w-full rounded-none border border-hairline bg-canvas pl-14 pr-36 font-mono text-sm text-ink outline-none transition-all placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setInputUri(
                            `ipfs://Qm${Math.random().toString(36).slice(2, 14)}/${jobType}-input.json`,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-none border border-hairline bg-surface-cool px-3 py-1.5 text-xs text-graphite transition-colors hover:text-ink"
                      >
                        Use test URI
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-stone">
                      Upload your dataset to S3 or IPFS first, then paste the
                      URI here.
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <FieldLabel hint="Optional">Run Notes</FieldLabel>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Container image, model checkpoints, expected output path, hyperparameters, or verifier instructions."
                      rows={3}
                      className="w-full resize-none rounded-none border border-hairline bg-canvas px-5 py-4 text-sm leading-relaxed text-ink outline-none transition-all placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                    />
                  </div>
                </div>
              </section>

              {/* Requirements */}
              <section className="border border-hairline bg-canvas p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-ink" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone">
                      Step 3
                    </p>
                    <h2 className="mt-0.5 text-2xl font-bold text-ink">
                      Requirements
                    </h2>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Budget */}
                  <div>
                    <FieldLabel required hint="SOL">
                      Budget
                    </FieldLabel>
                    <div className="relative">
                      <Coins className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="0.500"
                        min="0.001"
                        step="0.001"
                        className="h-14 w-full rounded-none border border-hairline bg-canvas pl-14 pr-5 text-base text-ink outline-none transition-all placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </div>
                    {validBudget && (
                      <p className="mt-1.5 text-xs text-stone">
                        ≈ {estHours.toFixed(1)} hrs at {typeDef.ratePerHour}{" "}
                        SOL/hr
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <FieldLabel hint="Expected runtime">
                      Estimated Duration
                    </FieldLabel>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" />
                      <select
                        value={duration}
                        onChange={(e) =>
                          setDuration(e.target.value as DurationValue)
                        }
                        className="h-14 w-full appearance-none rounded-none border border-hairline bg-canvas pl-14 pr-10 text-base text-ink outline-none transition-all focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                      >
                        {DURATION_OPTIONS.map(({ value, label }) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-gray-900"
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Min VRAM */}
                  <div>
                    <FieldLabel hint="GB">Minimum VRAM</FieldLabel>
                    <div className="relative">
                      <Cpu className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" />
                      <input
                        type="number"
                        value={requiredVram}
                        onChange={(e) => setRequiredVram(e.target.value)}
                        min="0"
                        max="160"
                        className="h-14 w-full rounded-none border border-hairline bg-canvas pl-14 pr-5 text-base text-ink outline-none transition-all placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <FieldLabel>Priority</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {(["standard", "rush"] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`h-14 rounded-none border text-sm font-bold transition-all ${
                            priority === p
                              ? "border-ink bg-surface-cool text-ink"
                              : "border-hairline bg-canvas text-graphite hover:border-hairline hover:text-ink"
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
                  <div className="grid grid-cols-3 gap-3">
                    {([0, 1, 2] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setGpuTier(tier)}
                        className={`rounded-none border px-3 py-4 text-center transition-all ${
                          gpuTier === tier
                            ? "border-ink bg-surface-cool text-ink"
                            : "border-hairline bg-canvas text-graphite hover:border-hairline hover:text-ink"
                        }`}
                      >
                        <span className="block text-sm font-bold">
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
            <aside className="lg:sticky lg:top-24">
              <div className="border border-hairline bg-canvas p-6">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink">
                    Deployment Quote
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <typeDef.icon className="h-7 w-7 text-ink" />
                    <h2 className="text-xl font-bold text-ink">
                      {typeDef.label}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3.5 border-y border-hairline py-5">
                  {(
                    [
                      [
                        "Budget",
                        validBudget
                          ? `${budgetNum.toFixed(3)} SOL`
                          : "Set amount",
                      ],
                      [
                        "Est. Runtime",
                        validBudget ? `${estHours.toFixed(1)} hrs` : "Pending",
                      ],
                      [
                        "Duration",
                        DURATION_OPTIONS.find((d) => d.value === duration)
                          ?.label ?? "–",
                      ],
                      ["Min VRAM", requiredVram ? `${requiredVram} GB` : "Any"],
                      ["Trust", TIER_INFO[gpuTier].label],
                      [
                        "Priority",
                        priority === "rush" ? "Rush queue" : "Standard",
                      ],
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

                <div className="mt-5 border border-hairline bg-surface-cool p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-ink" />
                    <p className="text-sm font-bold text-ink">
                      On-Chain Escrow
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/70">
                    Funds will be locked in a Solana smart contract. The
                    provider is only paid after verifiable completion.
                  </p>
                </div>

                {readiness.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {readiness.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm text-graphite"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-ink" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="mt-5 flex items-start gap-3 rounded-none border border-red-500/20 bg-red-500/10 p-4 text-sm leading-relaxed text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {!connected && (
                  <div className="mt-4 rounded-none border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-300">
                          Wallet required
                        </p>
                        <p className="text-xs text-amber-100/60 mt-0.5">
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

                {connected &&
                  balance !== null &&
                  balance < budgetNum &&
                  budgetNum > 0 && (
                    <div className="mt-4 rounded-none border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                      ✗ Insufficient balance. You have {balance.toFixed(3)} SOL,
                      but this job requires {budgetNum.toFixed(3)} SOL.
                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !connected ||
                    (balance !== null && balance < budgetNum)
                  }
                  className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-none bg-primary text-on-primary text-base font-bold transition-all hover:bg-surface-cool hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Deploying…
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Lock Funds &amp; Deploy
                    </>
                  )}
                </button>
              </div>
            </aside>
          </form>
    </PageContainer>
  );
}
