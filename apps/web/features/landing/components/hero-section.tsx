"use client";

import Link from "next/link";
import { LANDING_CONTENT } from "@/config/landing-content";
import Image from "next/image";
import { DownloadAgentButton } from "@/components/shared/download-agent-button";
import { Button } from "@/components/ui/button";
import type { ReactElement } from "react";

export function HeroSection(): ReactElement {
  const { badge, headline, subheadline, ctaPrimary, ctaSecondary } =
    LANDING_CONTENT.hero;
  const [line1, line2] = headline.split("\n");

  return (
    <section className="relative pt-20 pb-16 bg-canvas text-ink overflow-hidden border-b border-hairline">
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-3xl">
        {/* Eyebrow */}
        <div className="mb-6">
          <span className="text-sm font-medium uppercase tracking-wider text-ink-soft">
            {badge}
          </span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight mb-8">
          <span className="block">{line1}</span>
          <span className="block text-ink-soft">{line2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-graphite max-w-xl mb-10">
          {subheadline}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/client" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              {ctaPrimary}
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <DownloadAgentButton showIcon={false}>
              <Button variant="ghost" size="lg" className="w-full">
                {ctaSecondary}
              </Button>
            </DownloadAgentButton>
          </div>
        </div>
      </div>

      <div className="mt-16 w-full flex justify-center pointer-events-none relative h-48 md:h-96 max-w-5xl mx-auto">
        <Image
          src="/images/hero.png"
          alt="Decentralized GPU Compute Network Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>
    </section>
  );
}
