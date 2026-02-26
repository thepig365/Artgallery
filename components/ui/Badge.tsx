import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-noir-border text-noir-text",
  accent: "border-noir-accent text-noir-accent bg-noir-accent/10",
  muted: "border-noir-border text-noir-muted",
};

export function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        border px-2 py-0.5
        text-[10px] font-medium tracking-widest uppercase
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
