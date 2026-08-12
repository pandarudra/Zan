import { LANDING_CONTENT } from "@/config/landing-content";
import type { ReactElement } from "react";

export function TickerSection(): ReactElement {
  const items = [
    ...LANDING_CONTENT.ticker,
    "Kubernetes",
    "Redis",
    "Kafka",
    "PostgreSQL",
    "Next.js",
    "React",
    "TypeScript",
  ];

  return (
    <section className="py-12 border-b border-hairline bg-canvas">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-xs font-medium text-stone uppercase tracking-wider"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
