import type { ReactNode } from "react";

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
    <div className={`p-6 lg:p-8 max-w-7xl mx-auto w-full ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            {title && (
              <h1 className="text-3xl font-semibold tracking-tight text-ink">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-graphite text-base">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
