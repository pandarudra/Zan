import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function TickerSection(): ReactElement {
  return (
    <section
      aria-label="Supported technologies"
      className="border-b border-hairline bg-surface-cool/40 py-8"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
          {LANDING_CONTENT.ticker.map((item) => (
            <li
              key={item}
              className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-stone"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
