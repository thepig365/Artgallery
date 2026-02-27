"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "default" | "accent" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "border border-border text-fg hover:bg-fg hover:text-bg transition-colors",
  accent:
    "bg-accent text-white hover:bg-accent-hover border border-accent",
  ghost:
    "border border-transparent text-muted hover:text-fg hover:border-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-xs",
  lg: "px-6 py-3 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "default", size = "md", className = "", disabled, children, ...props },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className={`
          inline-flex items-center justify-center
          font-medium tracking-widest uppercase
          transition-colors duration-120
          disabled:opacity-40 disabled:cursor-not-allowed
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  }
);
