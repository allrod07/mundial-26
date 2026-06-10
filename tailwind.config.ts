import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — "Mundial '26" premium palette
        pitch: {
          50: "#eafff3",
          100: "#cdfee0",
          200: "#9ffac6",
          300: "#5ff3a4",
          400: "#1fe27e",
          500: "#00c75f",
          600: "#00a14d",
          700: "#037e40",
          800: "#086336",
          900: "#08512f",
          950: "#002d18",
        },
        gold: {
          50: "#fdfaec",
          100: "#faf0c8",
          200: "#f4df8d",
          300: "#eec953",
          400: "#e9b62e",
          500: "#e0991f",
          600: "#c67517",
          700: "#a55416",
          800: "#874218",
          900: "#723817",
          950: "#421c09",
        },
        ink: {
          50: "#f5f6fa",
          100: "#ebedf4",
          200: "#d2d7e6",
          300: "#aab4ce",
          400: "#7d8cb2",
          500: "#5d6d99",
          600: "#495680",
          700: "#3c4668",
          800: "#353d58",
          900: "#10131f",
          950: "#080a12",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,199,95,0.18), 0 18px 50px -12px rgba(0,199,95,0.35)",
        card: "0 1px 2px rgba(16,19,31,0.06), 0 12px 32px -12px rgba(16,19,31,0.18)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.4), 0 18px 44px -16px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(16,19,31,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,19,31,0.04) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-live": "pulse-live 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
