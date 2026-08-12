import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { ReactElement } from "react";

export function Logo(): ReactElement {
  return (
    <Link href="/" className="flex items-center group">
      <span className="font-sans text-[20px] font-[600] tracking-tight text-ink lowercase group-hover:text-ink-soft transition-colors">
        {siteConfig.name}.
      </span>
    </Link>
  );
}
