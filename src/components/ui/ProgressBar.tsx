interface ProgressBarProps {
  current: number; // 0-based
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round(((current + 1) / total) * 100);
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div
        className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-500"
        aria-hidden="true"
      >
        <span>{label ?? `Step ${current + 1} of ${total}`}</span>
        <span>{clamped}%</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label="Survey progress"
      >
        <div
          className="h-full rounded-full bg-forest-600 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
