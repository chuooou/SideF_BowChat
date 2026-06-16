import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        line: "#d9dee8",
        field: "#f7f9fc",
        brand: "#0f766e",
        mint: "#14b8a6",
        amber: "#f59e0b",
        coral: "#ef6351",
      },
      boxShadow: {
        soft: "0 14px 35px rgba(24, 32, 47, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
