"use client";

import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function ProcessSection(): ReactElement {
  const { tagline, headline, subheadline, steps } = LANDING_CONTENT.process;

  return (
    <section id="process" className="relative py-16 bg-canvas text-ink border-b border-hairline">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="mb-6">
              <span className="text-sm font-medium uppercase tracking-wider text-ink">
                {tagline}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-normal tracking-tight mb-8 text-ink">
              {headline}
            </h2>

            <p className="text-base text-graphite max-w-sm">
              {subheadline}
            </p>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-7 flex flex-col gap-16">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-6 pb-16 border-b border-hairline last:border-b-0 last:pb-0">
                <div className="text-3xl font-normal text-stone">
                  {step.id}
                </div>

                <div>
                  <h3 className="text-xl font-normal text-ink mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-graphite mb-6">
                    {step.description}
                  </p>
                  
                  {step.bullets && step.bullets.length > 0 && (
                    <ul className="flex flex-col gap-3">
                      {step.bullets.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="flex items-start gap-3 text-graphite">
                          <span className="text-sm font-semibold text-ink mt-0.5">—</span>
                          <span className="text-sm">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
