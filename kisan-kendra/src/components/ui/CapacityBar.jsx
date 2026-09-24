import { formatNumber } from '../../utils/format.js'

/** Horizontal fill showing how much of a centre's day is already committed. */
export default function CapacityBar({ used, capacity, label = 'Capacity used today', compact = false }) {
  const percent = capacity ? Math.min(100, Math.round((used / capacity) * 100)) : 0
  const tone = percent >= 98 ? 'bg-danger-500' : percent >= 80 ? 'bg-grain-500' : 'bg-brand-600'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-medium text-muted ${compact ? 'text-sm' : 'text-[15px]'}`}>{label}</span>
        <span className="text-sm font-semibold text-ink tnum">
          {formatNumber(used)} of {formatNumber(capacity)} quintal
        </span>
      </div>
      <div
        className="mt-1.5 h-2.5 w-full bg-line"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-sm text-muted tnum">
        {formatNumber(Math.max(0, capacity - used))} quintal still open today
      </p>
    </div>
  )
}
