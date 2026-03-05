export const FAMILY_TOKENS = {
  fonts: {
    body: "Inter, system-ui, sans-serif",
    heading: "Cormorant Garamond, Georgia, serif",
  },
  colors: {
    navy: "#1a2332",
    navyDeep: "#141b26",
    accent: "#5eb1bf",
    accentHover: "#3d8a96",
    border: "#e5e7eb",
    mutedText: "#374151",
    subtleText: "#4b5563",
  },
  layout: {
    containerMaxWidth: "80rem",
    baseGutter: "1rem",
    sectionSpacing: {
      sm: "1.5rem",
      md: "2.5rem",
      lg: "4rem",
    },
  },
  shape: {
    radiusSm: "0.375rem",
    radiusMd: "0.5rem",
    radiusLg: "0.75rem",
  },
  shadow: {
    soft: "0 8px 24px rgba(17, 24, 39, 0.08)",
    card: "0 3px 14px rgba(17, 24, 39, 0.08)",
  },
} as const;
