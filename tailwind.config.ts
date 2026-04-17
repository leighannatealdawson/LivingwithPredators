import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Muted forest palette for an academic wildlife-research feel.
        forest: {
          50: "#f4f7f3",
          100: "#e4ebe1",
          200: "#c9d7c3",
          300: "#a3bb9c",
          400: "#7a9b72",
          500: "#597d52",
          600: "#446440",
          700: "#385035",
          800: "#2f402d",
          900: "#263424",
        },
        stone: {
          50: "#faf9f6",
          100: "#f3f1ec",
          200: "#e5e1d8",
          300: "#cfc9bb",
          400: "#b2a995",
          500: "#938772",
          600: "#756a58",
          700: "#5b5244",
          800: "#403a31",
          900: "#2a2620",
        },
        amber: {
          DEFAULT: "#b57c3a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
