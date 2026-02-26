import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`
          w-full bg-noir-bg border text-noir-text text-sm
          px-3 py-2 min-h-[100px] resize-y
          placeholder:text-noir-muted/60
          transition-colors duration-120
          disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-noir-surface/30
          focus:outline-none focus:border-noir-text
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
          ${error ? "border-noir-accent" : "border-noir-border"}
          ${className}
        `}
        {...props}
      />
    );
  }
);
