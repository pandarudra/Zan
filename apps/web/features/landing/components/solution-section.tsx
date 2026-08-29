import Image from "next/image";
import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function SolutionSection(): ReactElement {
  const { tagline, headline, subheadline, cards } = LANDING_CONTENT.solution;

  return (
    <section
      id="solution"
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

        <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-canvas sm:aspect-[16/8] lg:mt-16">
          <Image
            src="/images/solution_decentralized_nodes_1786389996363.png.png"
            alt="Diagram showing jobs moving through escrow to distributed GPU nodes"
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="grid border-x border-b border-hairline md:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="border-b border-hairline p-6 last:border-b-0 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                0{index + 1}
              </span>
              <h3 className="mt-8 text-xl font-medium tracking-tight text-ink">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-graphite">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
