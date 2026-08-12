"use client";

import type { ReactElement } from "react";
import { LANDING_CONTENT } from "@/config/landing-content";

function ProblemCard({ card }: { card: { id: string; title: string; description: string } }) {
  return (
    <div className="flex flex-col gap-4 p-6 border border-hairline bg-canvas">
      <div className="text-xs font-medium uppercase tracking-wider text-stone mb-4">
        {card.id}
      </div>
      <h3 className="text-xl font-normal text-ink">
        {card.title}
      </h3>
      <p className="text-sm text-graphite">
        {card.description}
      </p>
    </div>
  );
}

export function ProblemSection(): ReactElement {
  const { tagline, headline, subheadline, cards } = LANDING_CONTENT.problem;

  return (
    <section id="problem" className="relative py-16 bg-canvas text-ink border-b border-hairline">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side */}
          <div className="lg:col-span-5 sticky top-24">
            {/* Eyebrow */}
            <div className="mb-6">
              <span className="text-sm font-medium uppercase tracking-wider text-ink">
                {tagline}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl font-normal tracking-tight mb-8 text-ink">
              {headline}
            </h2>

            {/* Subheadline */}
            <p className="text-base text-graphite max-w-sm">
              {subheadline}
            </p>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {cards.map((card, idx) => (
              <ProblemCard key={idx} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
