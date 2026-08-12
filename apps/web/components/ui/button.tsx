import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "primary-on-dark" | "ghost" | "text-link" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const variants = {
      primary: "bg-primary text-on-primary hover:bg-white rounded-full font-semibold",
      "primary-on-dark": "bg-on-primary text-primary hover:bg-hairline rounded-full font-semibold",
      ghost: "bg-canvas text-ink border border-hairline hover:bg-surface-cool hover:border-ink rounded-full font-semibold",
      "text-link": "bg-transparent text-ink underline-offset-4 hover:underline p-0 h-auto",
      secondary: "bg-surface-cool text-ink border border-hairline hover:bg-hairline-soft rounded-md font-medium",
      danger: "bg-error-bg text-error border border-error/20 hover:bg-error/20 rounded-md font-medium",
    };

    return (
      <button
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
