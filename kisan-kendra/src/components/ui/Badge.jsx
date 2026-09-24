const TONES = {
  neutral: 'bg-paper text-muted border-line',
  success: 'bg-brand-50 text-brand-700 border-brand-200',
  warning: 'bg-grain-50 text-grain-700 border-grain-200',
  info: 'bg-steel-50 text-steel-600 border-steel-100',
  danger: 'bg-danger-50 text-danger-600 border-danger-100',
}

const DOT = {
  neutral: 'bg-muted',
  success: 'bg-brand-600',
  warning: 'bg-grain-500',
  info: 'bg-steel-500',
  danger: 'bg-danger-500',
}

export default function Badge({ children, tone = 'neutral', dot = false, pulse = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-0.5 text-sm font-medium ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {dot ? (
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone] || DOT.neutral} ${pulse ? 'animate-pulseDot' : ''}`}
        />
      ) : null}
      {children}
    </span>
  )
}
