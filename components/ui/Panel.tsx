import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean;
}

export function Panel({
  children,
  noPadding = false,
  className = "",
  ...props
}: PanelProps) {
  return (
    <div
      className={`
        border border-noir-border bg-noir-surface
        ${noPadding ? "" : "p-4 sm:p-6"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
