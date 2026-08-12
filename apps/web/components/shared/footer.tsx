"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "./logo";
import type { ReactElement } from "react";

const FOOTER_LINKS = {
  Platform: ["Compute Dashboard", "List GPU Node", "Pricing", "Documentation"],
  Company: ["About Us", "Careers", "Blog", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "SLA"],
};

export function Footer(): ReactElement {
  return (
    <footer className="bg-footer text-ink py-16 px-6 border-t border-hairline">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2 md:col-span-2 flex flex-col gap-6">
            <Logo />
            <p className="text-stone text-sm max-w-xs">
              Decentralized GPU orchestration layer. Trustless, secure, and
              infinitely scalable compute power for the next generation of AI.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links], idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h4 className="text-stone text-xs font-medium uppercase tracking-wider">
                {category}
              </h4>
              <div className="flex flex-col gap-3">
                {links.map((link, linkIdx) => (
                  <Link
                    key={linkIdx}
                    href="#"
                    className="text-ink hover:text-stone text-sm transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-stone text-xs">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href={siteConfig.links.twitter} className="hover:text-ink transition-colors">
              Twitter
            </Link>
            <Link href={siteConfig.links.github} className="hover:text-ink transition-colors">
              GitHub
            </Link>
            <Link href="#" className="hover:text-ink transition-colors">
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
