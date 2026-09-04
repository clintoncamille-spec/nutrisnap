import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
  progress: number; // 0-1
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
}

export function ProgressRing({
  progress,
  color,
  size = 72,
  strokeWidth = 7,
  label,
  value,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <View className="items-center gap-1">
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <Text className="text-sm font-semibold text-neutral-900">{value}</Text>
      <Text className="text-xs text-neutral-500">{label}</Text>
    </View>
  );
}
