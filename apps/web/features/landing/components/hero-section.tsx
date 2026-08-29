"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LANDING_CONTENT } from "@/config/landing-content";
import { DownloadAgentButton } from "@/components/shared/download-agent-button";
import { Button } from "@/components/ui/button";
import type { ReactElement } from "react";

export function HeroSection(): ReactElement {
  const { badge, headline, subheadline, ctaPrimary, ctaSecondary } =
    LANDING_CONTENT.hero;
  const [line1, line2] = headline.split("\n");
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b border-hairline bg-canvas py-16 text-ink sm:py-20 lg:py-24">
      <div className="container mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <span className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-success"
            />
            {badge}
          </span>

          <h1 className="max-w-3xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="block">{line1}</span>
            <span className="block text-ink-soft">{line2}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-graphite sm:text-lg">
            {subheadline}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => router.push("/client")}
              className="w-full sm:w-auto"
            >
              {ctaPrimary}
            </Button>
            <DownloadAgentButton className="w-full sm:w-auto" showIcon={false}>
              <span className="flex h-12 w-full items-center justify-center rounded-full border border-hairline bg-canvas px-6 text-base font-semibold text-ink transition-colors hover:border-ink hover:bg-surface-cool sm:w-auto">
                {ctaSecondary}
              </span>
            </DownloadAgentButton>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-surface-cool sm:aspect-[16/11]">
            <Image
              src="/images/hero.png"
              alt="A globe connected to a distributed network of GPU providers"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-canvas/50 via-transparent to-transparent"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-canvas/80 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
              Global compute network
            </span>
            <span className="flex items-center gap-2 text-xs text-graphite">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-success"
              />
              Online
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
