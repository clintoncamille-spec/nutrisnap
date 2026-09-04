import { Pressable, Text } from "react-native";
import type { PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const containerClasses: Record<Variant, string> = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-neutral-100 active:bg-neutral-200",
  ghost: "bg-transparent active:bg-neutral-100",
  danger: "bg-danger-500 active:bg-danger-600",
};

const textClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-neutral-900",
  ghost: "text-neutral-700",
  danger: "text-white",
};

interface Props extends PressableProps {
  variant?: Variant;
  label: string;
}

export function Button({ variant = "primary", label, disabled, ...props }: Props) {
  return (
    <Pressable
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-md px-4 py-3 ${containerClasses[variant]} ${disabled ? "opacity-50" : ""}`}
      {...props}
    >
      <Text className={`text-sm font-medium ${textClasses[variant]}`}>{label}</Text>
    </Pressable>
  );
}
