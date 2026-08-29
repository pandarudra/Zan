import type { ReactElement } from "react";
import { LANDING_CONTENT } from "@/config/landing-content";

export function WhyZanSection(): ReactElement {
  const { tagline, headline, subheadline, stats } = LANDING_CONTENT.whyZan;

  return (
    <section
      id="scale"
      className="scroll-mt-20 border-b border-hairline bg-surface-cool/40 py-16 text-ink sm:py-20 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
              {tagline}
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              {headline}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-graphite sm:text-lg lg:col-span-5">
            {subheadline}
          </p>
        </div>

        <dl className="mt-12 grid border-l border-t border-hairline sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex min-h-64 flex-col justify-between border-b border-r border-hairline bg-canvas p-6 sm:p-8"
            >
              <dd className="text-4xl font-normal tracking-[-0.04em] text-ink sm:text-5xl">
                {stat.value}
              </dd>
              <div>
                <dt className="text-base font-medium text-ink">{stat.label}</dt>
                <p className="mt-2 text-sm leading-6 text-graphite">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
