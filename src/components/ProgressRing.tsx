type Props = {
  current: number;
  goal: number;
  size?: number;
};

export default function ProgressRing({ current, goal, size = 240 }: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(current / goal, 1.5) : 0;
  const dashOffset = circumference * (1 - Math.min(pct, 1));

  let color = 'stroke-red-500';
  if (pct >= 1) color = 'stroke-amber-400';
  else if (pct >= 0.9) color = 'stroke-emerald-500';
  else if (pct >= 0.5) color = 'stroke-amber-500';
  if (current >= goal) color = 'stroke-emerald-500';
  if (current >= goal * 1.1) color = 'stroke-amber-400';

  const remaining = Math.max(0, goal - current);
  const over = Math.max(0, current - goal);
  const pctLabel = goal > 0 ? Math.round((current / goal) * 100) : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`${color} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold tabular-nums">{Math.round(current)}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">/ {goal} g protein</div>
        <div className="mt-2 text-xs font-medium">
          {over > 0 ? (
            <span className="text-amber-500">+{Math.round(over)} g over · {pctLabel}%</span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{Math.round(remaining)} g to go · {pctLabel}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
