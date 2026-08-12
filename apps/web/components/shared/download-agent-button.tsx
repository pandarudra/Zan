"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Copy, Check, Terminal, AlertTriangle } from "lucide-react";
import {
  detectPlatform,
  getPlatformLabel,
  downloadAgent,
} from "@/lib/download-agent";

interface DownloadAgentButtonProps {
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showPlatform?: boolean;
}

export function DownloadAgentButton({
  children,
  className,
  showIcon = true,
  showPlatform = false,
}: DownloadAgentButtonProps) {
  const [platformLabel, setPlatformLabel] = useState<string>("");
  const [platform, setPlatform] = useState<string>("unknown");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMacModal, setShowMacModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setPlatformLabel(getPlatformLabel(p));
  }, []);

  const xattrCommand = `xattr -cr "/path/to/Zan Provider Agent.app"`;

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(xattrCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [xattrCommand]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const started = await downloadAgent();
      // Show macOS instruction modal only when a direct macOS binary is being downloaded.
      if (platform === "macos" && started) {
        setTimeout(() => setShowMacModal(true), 1500);
      }
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <>
      <div 
        role="button"
        tabIndex={0}
        onClick={handleClick} 
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        className={className}
        style={{ opacity: isDownloading ? 0.5 : 1, pointerEvents: isDownloading ? "none" : "auto", display: "inline-flex", cursor: "pointer" }}
      >
        {showIcon && <Download className="w-5 h-5" />}
        {isDownloading ? "Starting download…" : children}
        {showPlatform && platformLabel && (
          <span className="opacity-60 text-xs ml-1">({platformLabel})</span>
        )}
      </div>

      {/* macOS Gatekeeper instruction modal */}
      {showMacModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-canvas"
            onClick={() => setShowMacModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-none border border-hairline bg-[#0d0f14] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-ink font-semibold">macOS Setup Required</h3>
              </div>
              <button
                onClick={() => setShowMacModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-cool text-graphite hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-graphite text-sm leading-relaxed">
                Since the app isn&apos;t signed with an Apple Developer certificate, macOS
                will block it. After installing, run this command in <strong className="text-graphite">Terminal</strong> to fix it:
              </p>

              {/* Command block */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-hairline bg-white/[0.03] rounded-t-xl">
                  <Terminal className="w-3.5 h-3.5 text-stone" />
                  <span className="text-[11px] text-stone font-mono">Terminal</span>
                </div>
                <div className="bg-white/[0.03] rounded-b-xl px-4 py-3 font-mono text-sm text-ink break-all border border-hairline border-t-0">
                  {xattrCommand}
                </div>
                <button
                  onClick={copyCommand}
                  className="absolute top-10 right-3 p-1.5 rounded-lg bg-surface-cool hover:bg-surface-cool text-graphite hover:text-ink transition-all"
                  title="Copy command"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="text-graphite text-xs space-y-1.5 pt-1">
                <p><strong className="text-graphite">Steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open the downloaded <code className="text-ink/80 bg-surface-cool px-1 rounded">.dmg</code> and drag the app to Applications</li>
                  <li>Open <strong className="text-graphite">Terminal</strong> (Cmd + Space → &quot;Terminal&quot;)</li>
                  <li>Paste the command above and press Enter</li>
                  <li>Open the app normally from Applications</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-hairline flex items-center justify-end gap-3">
              <button
                onClick={copyCommand}
                className="px-4 py-2 rounded-lg bg-surface-cool border border-ink text-ink text-sm font-medium hover:bg-surface-cool transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Command"}
              </button>
              <button
                onClick={() => setShowMacModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-cool border border-hairline text-graphite text-sm font-medium hover:bg-surface-cool transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

