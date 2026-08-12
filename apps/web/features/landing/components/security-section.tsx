"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { LANDING_CONTENT } from "@/config/landing-content";

export function SecuritySection(): ReactElement {
  const { tagline, headline, subheadline, features } = LANDING_CONTENT.security;

  return (
    <section
      id="security"
      className="relative py-16 bg-canvas text-ink"
    >
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side */}
          <div className="lg:col-span-5 sticky top-24 self-start">
            <div className="mb-6">
              <span className="text-sm font-medium uppercase tracking-wider text-ink">
                {tagline}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-normal tracking-tight mb-8 text-ink">
              {headline}
            </h2>
            <p className="text-base text-graphite max-w-sm mb-12">
              {subheadline}
            </p>
            <div className="relative w-full max-w-64 aspect-square rounded-md overflow-hidden border border-hairline bg-canvas">
              <Image
                src="/images/Gemini_Generated_Image_iz6uaiz6uaiz6uai.png"
                alt="Cryptographic Security Lock Illustration"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="text-xs font-medium uppercase tracking-wider text-stone mb-4">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-normal text-ink mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-graphite">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
