"use client";

import { forwardRef, type InputHTMLAttributes, useCallback } from "react";

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  label?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    { value, onChange, min = 0, max = 10, step = 0.1, error, label, className = "", ...props },
    ref
  ) {
    const clamp = useCallback(
      (v: number) => Math.min(max, Math.max(min, v)),
      [min, max]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value);
      if (!isNaN(raw)) {
        onChange(clamp(raw));
      }
    };

    const increment = () => onChange(clamp(Math.round((value + step) * 10) / 10));
    const decrement = () => onChange(clamp(Math.round((value - step) * 10) / 10));

    const stepperClass = `
      border border-noir-border px-2.5 text-noir-muted
      hover:text-noir-text hover:bg-noir-surface
      transition-colors duration-120
      disabled:opacity-40 disabled:cursor-not-allowed
      focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
      text-sm select-none
    `;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <span className="text-[10px] font-medium tracking-widest uppercase text-noir-muted">
            {label}
          </span>
        )}
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={decrement}
            disabled={props.disabled || value <= min}
            aria-label={`Decrease ${label || "value"}`}
            className={`${stepperClass} border-r-0`}
            tabIndex={-1}
          >
            −
          </button>
          <input
            ref={ref}
            type="number"
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            aria-label={label || undefined}
            className={`
              w-full bg-noir-bg border text-noir-text text-sm text-center
              px-2 py-2 tabular-nums
              transition-colors duration-120
              disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-noir-surface/30
              focus:outline-none focus:border-noir-text
              focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${error ? "border-noir-accent" : "border-noir-border"}
            `}
            {...props}
          />
          <button
            type="button"
            onClick={increment}
            disabled={props.disabled || value >= max}
            aria-label={`Increase ${label || "value"}`}
            className={`${stepperClass} border-l-0`}
            tabIndex={-1}
          >
            +
          </button>
        </div>
      </div>
    );
  }
);
