import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "primary-on-dark"
    | "ghost"
    | "text-link"
    | "secondary"
    | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const variants = {
      primary:
        "rounded-full bg-primary font-semibold text-on-primary hover:bg-ink-soft",
      "primary-on-dark":
        "rounded-full bg-on-primary font-semibold text-primary hover:bg-hairline",
      ghost:
        "rounded-full border border-hairline bg-canvas font-semibold text-ink hover:border-ink hover:bg-surface-cool",
      "text-link":
        "h-auto bg-transparent p-0 text-ink underline-offset-4 hover:underline",
      secondary:
        "rounded-md border border-hairline bg-surface-cool font-medium text-ink hover:bg-hairline-soft",
      danger:
        "rounded-md border border-error/20 bg-error-bg font-medium text-error hover:bg-error/20",
    };

    return (
      <button
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
