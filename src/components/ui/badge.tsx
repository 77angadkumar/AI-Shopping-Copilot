import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "accent";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:opacity-90",
    outline: "border-border text-foreground hover:bg-muted bg-transparent",
    success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
    warning: "border-transparent bg-amber-500 text-black hover:bg-amber-600",
    accent: "border-transparent bg-accent text-accent-foreground font-bold",
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />;
}
