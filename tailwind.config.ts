import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
