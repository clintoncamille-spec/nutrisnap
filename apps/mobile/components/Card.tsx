import { View } from "react-native";
import type { ViewProps } from "react-native";

export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-lg border border-neutral-200 bg-white p-4 ${className}`}
      {...props}
    />
  );
}
