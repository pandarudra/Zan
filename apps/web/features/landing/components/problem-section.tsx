import type { ReactElement } from "react";
import { LANDING_CONTENT } from "@/config/landing-content";

function ProblemCard({
  card,
}: {
  card: { id: string; title: string; description: string };
}) {
  return (
    <article className="flex min-h-64 flex-col border border-hairline bg-canvas p-6 sm:p-8">
      <div className="mb-auto text-xs font-semibold uppercase tracking-[0.16em] text-stone">
        {card.id}
      </div>
      <h3 className="mt-12 text-xl font-medium tracking-tight text-ink">
        {card.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-graphite">{card.description}</p>
    </article>
  );
}

export function ProblemSection(): ReactElement {
  const { tagline, headline, subheadline, cards } = LANDING_CONTENT.problem;

  return (
    <section
      id="problem"
      className="scroll-mt-20 border-b border-hairline bg-canvas py-16 text-ink sm:py-20 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
              {tagline}
            </p>
            <h2 className="mt-5 text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              {headline}
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-xl text-base leading-7 text-graphite sm:text-lg">
              {subheadline}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {cards.map((card) => (
            <ProblemCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
