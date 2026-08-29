import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function ProcessSection(): ReactElement {
  const { tagline, headline, subheadline, steps } = LANDING_CONTENT.process;

  return (
    <section
      id="process"
      className="scroll-mt-20 border-b border-hairline bg-canvas py-16 text-ink sm:py-20 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
              {tagline}
            </p>
            <h2 className="mt-5 text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              {headline}
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-graphite sm:text-lg">
              {subheadline}
            </p>
          </div>

          <ol className="border-t border-hairline lg:col-span-7 lg:col-start-6">
            {steps.map((step) => (
              <li
                key={step.id}
                className="grid gap-6 border-b border-hairline py-8 sm:grid-cols-[72px_1fr] sm:py-10"
              >
                <span className="text-sm font-semibold text-stone">
                  {step.id}
                </span>
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-ink sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-graphite sm:text-base">
                    {step.description}
                  </p>

                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {step.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-sm text-graphite"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
