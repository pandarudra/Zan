import type { ReactElement } from "react";
import Image from "next/image";
import { LANDING_CONTENT } from "@/config/landing-content";

export function SecuritySection(): ReactElement {
  const { tagline, headline, subheadline, features } = LANDING_CONTENT.security;

  return (
    <section
      id="security"
      className="scroll-mt-20 bg-canvas py-16 text-ink sm:py-20 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
              {tagline}
            </p>
            <h2 className="mt-5 text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              {headline}
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-graphite sm:text-lg">
              {subheadline}
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-surface-cool lg:col-span-7">
            <Image
              src="/images/security_cryptographic_lock_1786390018145.png"
              alt="A cryptographic lock protecting distributed compute data"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-12 grid border-l border-t border-hairline sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="border-b border-r border-hairline p-6 sm:p-8"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                0{index + 1}
              </span>
              <h3 className="mt-8 text-lg font-medium text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-graphite">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
