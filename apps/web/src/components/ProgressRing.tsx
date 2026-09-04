interface ProgressRingProps {
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
  size = 88,
  strokeWidth = 8,
  label,
  value,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-neutral-200"
          strokeWidth={strokeWidth}
        />
        <circle
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
      </svg>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}
