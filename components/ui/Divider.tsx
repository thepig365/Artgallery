interface DividerProps {
  className?: string;
  label?: string;
}

export function Divider({ className = "", label }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-noir-border" />
        <span className="text-[10px] text-noir-muted tracking-widest uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-noir-border" />
      </div>
    );
  }

  return <div className={`h-px bg-noir-border ${className}`} />;
}
