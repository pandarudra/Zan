import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageContainer({
  children,
  className = "",
  title,
  description,
  actions,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:mb-10">
          <div className="min-w-0">
            {title && (
              <h1 className="text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-3 max-w-2xl text-base leading-7 text-graphite">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="w-full shrink-0 md:w-auto">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
