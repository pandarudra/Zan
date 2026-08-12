"use client";

import Image from "next/image";
import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function SolutionSection(): ReactElement {
  const { tagline, headline, subheadline, cards } = LANDING_CONTENT.solution;
  const hardwareCard = cards[0] ?? { title: "", description: "" };
  const escrowCard = cards[1] ?? { title: "", description: "" };
  const dockerCard = cards[2] ?? { title: "", description: "" };

  return (
    <section
      id="solution"
      className="relative py-16 bg-canvas text-ink border-b border-hairline"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mx-auto max-w-2xl text-center mb-16 flex flex-col items-center">
          <div className="mb-6">
            <span className="text-sm font-medium uppercase tracking-wider text-ink">
              {tagline}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-normal tracking-tight mb-8 text-ink">
            {headline}
          </h2>

          <p className="text-base text-graphite max-w-xl">
            {subheadline}
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1 */}
          <div className="md:col-span-5 flex flex-col justify-between p-8 bg-canvas border border-hairline">
            <div className="relative mb-5 h-40 w-full overflow-hidden rounded-md border border-hairline bg-canvas">
              <Image
                src="/images/solution_decentralized_nodes_1786389996363.png.png"
                alt="Global GPU providers network"
                fill
                className="object-cover"
                priority={false}
              />
            </div>
            <h3 className="text-xl font-normal text-ink mb-4">
              {hardwareCard.title}
            </h3>
            <p className="text-sm text-graphite">
              {hardwareCard.description}
            </p>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-7 flex flex-col justify-between p-8 bg-canvas border border-hairline">
            <div className="relative mb-5 h-40 w-full overflow-hidden rounded-md border border-hairline bg-canvas">
              <Image
                src="/images/solution_decentralized_nodes_1786389996363.png.png"
                alt="Solana escrow payment flow"
                fill
                className="object-cover"
                priority={false}
              />
            </div>
            <h3 className="text-xl font-normal text-ink mb-4">
              {escrowCard.title}
            </h3>
            <p className="text-sm text-graphite max-w-md">
              {escrowCard.description}
            </p>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-12 flex flex-col md:flex-row gap-8 p-8 md:p-12 bg-canvas border border-hairline">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-normal text-ink mb-6">
                {dockerCard.title}
              </h3>
              <p className="text-base text-graphite max-w-md">
                {dockerCard.description}
              </p>
            </div>
            <div className="flex-1 bg-canvas h-64 relative rounded-md overflow-hidden border border-hairline">
              <Image
                src="/images/ph.png"
                alt="Distributed GPU Infrastructure Visualization"
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
