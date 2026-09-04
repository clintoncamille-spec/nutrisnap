import { colors, fontSize, spacing, radius } from "@nutrisnap/config/design-tokens";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors,
      spacing,
      fontSize,
      borderRadius: radius,
    },
  },
  plugins: [],
};
