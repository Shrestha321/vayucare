import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#060911",
          900: "#090D16",
          850: "#0D1322",
          800: "#111A2E",
          700: "#1E293B",
          600: "#334155",
        },
        cyan: {
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          950: "#083344",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          950: "#022C22",
        },
        aqi: {
          good: "#10B981",
          moderate: "#EAB308",
          unhealthySensitive: "#F97316",
          unhealthy: "#EF4444",
          severe: "#A855F7",
          hazardous: "#DC2626",
          emergency: "#7F1D1D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
