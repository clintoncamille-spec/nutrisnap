export declare const colors: {
  primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  accent: Record<500 | 600, string>;
  neutral: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  danger: Record<500 | 600, string>;
  macro: { protein: string; carbs: string; fat: string; calories: string };
};

export declare const spacing: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl", string>;

export declare const fontSize: Record<
  "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl",
  string
>;

export declare const radius: Record<"sm" | "md" | "lg" | "full", string>;

export declare const designTokens: {
  colors: typeof colors;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  radius: typeof radius;
};

export default designTokens;
