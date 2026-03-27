import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "80rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Bayview unified type scale
        micro:   ["0.75rem",    { lineHeight: "1rem" }],         // 12px — true micro only
        caption: ["0.875rem",   { lineHeight: "1.25rem" }],      // 14px — eyebrow / caption
        helper:  ["0.9375rem",  { lineHeight: "1.5rem" }],       // 15px — secondary / helper
        body:    ["1rem",       { lineHeight: "1.6" }],           // 16px — default body
        nav:     ["1.125rem",   { lineHeight: "1.75rem" }],      // 18px — nav / strong body
        lead:    ["1.25rem",    { lineHeight: "1.75rem" }],      // 20px — lead paragraph
        "h4":    ["1.5rem",     { lineHeight: "1.3" }],          // 24px — minor heading
        "h3":    ["2rem",       { lineHeight: "1.2" }],          // 32px — section heading
        "h2":    ["2.5rem",     { lineHeight: "1.15" }],         // 40px — page heading
        "h1":    ["3.5rem",     { lineHeight: "1.1" }],          // 56px — standard hero
        hero:    ["4rem",       { lineHeight: "1.05" }],         // 64px — homepage hero
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* Bayview semantic tokens */
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          50: "var(--accent-soft)",
        },
        family: {
          navy: "var(--family-navy)",
          "navy-deep": "var(--family-navy-deep)",
          accent: "var(--family-accent)",
        },
        /* Gallery zone (uses zone tokens) */
        gallery: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          "surface-alt": "var(--surface-alt)",
          text: "var(--fg)",
          muted: "var(--muted)",
          border: "var(--border)",
          accent: "var(--accent)",
          "accent-hover": "var(--accent-hover)",
        },
        /* Noir zone (uses zone tokens) */
        noir: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          text: "var(--fg)",
          muted: "var(--muted)",
          border: "var(--border)",
          accent: "var(--accent)",
        },
      },
      borderRadius: {
        sm: "var(--family-radius-sm)",
        md: "var(--family-radius-md)",
        lg: "var(--family-radius-lg)",
      },
      boxShadow: {
        family: "var(--family-shadow-soft)",
        card: "var(--family-shadow-card)",
      },
    },
  },
  plugins: [],
};
export default config;
