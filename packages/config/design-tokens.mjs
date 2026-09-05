export const colors = {
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  accent: {
    500: "#f97316",
    600: "#ea580c",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  danger: {
    500: "#ef4444",
    600: "#dc2626",
  },
  macro: {
    protein: "#3b82f6",
    carbs: "#f59e0b",
    fat: "#ec4899",
    calories: "#22c55e",
  },
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
};

export const fontSize = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
};

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "9999px",
};

export const designTokens = { colors, spacing, fontSize, radius };
export default designTokens;
