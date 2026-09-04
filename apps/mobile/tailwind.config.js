const { colors, fontSize, spacing, radius } = require("@nutrisnap/config/design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
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
