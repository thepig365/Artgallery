import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  required,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`
        block text-xs font-medium tracking-widest uppercase text-noir-muted mb-1.5
        ${className}
      `}
      {...props}
    >
      {children}
      {required && <span className="text-noir-accent ml-1" aria-hidden="true">*</span>}
    </label>
  );
}
