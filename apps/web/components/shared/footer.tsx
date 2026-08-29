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
    <footer className="border-t border-hairline bg-footer px-4 py-12 text-ink sm:px-6 sm:py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:mb-16 md:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-6">
            <Logo />
            <p className="text-stone text-sm max-w-xs">
              Decentralized GPU orchestration layer. Trustless, secure, and
              infinitely scalable compute power for the next generation of AI.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="text-stone text-xs font-medium uppercase tracking-wider">
                {category}
              </h4>
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link
                    key={link}
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

        <div className="flex flex-col gap-4 border-t border-hairline pt-8 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={siteConfig.links.twitter}
              className="hover:text-ink transition-colors"
            >
              Twitter
            </Link>
            <Link
              href={siteConfig.links.github}
              className="hover:text-ink transition-colors"
            >
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
