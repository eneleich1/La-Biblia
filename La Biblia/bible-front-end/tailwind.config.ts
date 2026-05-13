import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1a1f2e", muted: "#4b5563" },
        paper: { DEFAULT: "#faf9f6", alt: "#f0ebe3" },
        accent: { DEFAULT: "#2f4a6b", soft: "#c9d6e8" },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
