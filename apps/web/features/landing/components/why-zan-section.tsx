"use client";

import type { ReactElement } from "react";
import { LANDING_CONTENT } from "@/config/landing-content";

export function WhyZanSection(): ReactElement {
  const { tagline, headline, subheadline, stats } = LANDING_CONTENT.whyZan;

  return (
    <section id="scale" className="relative py-16 bg-canvas text-ink border-b border-hairline">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 max-w-2xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="p-8 border border-hairline bg-canvas flex flex-col justify-between"
            >
              <div className="text-4xl font-normal text-ink mb-6">
                {stat.value}
              </div>
              <div>
                <h3 className="text-base font-normal text-ink mb-3">
                  {stat.label}
                </h3>
                <p className="text-sm text-graphite">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
