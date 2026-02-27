import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
