import Icon from './Icon.jsx'

const TONES = {
  info: { wrap: 'border-steel-500 bg-steel-50', icon: 'info', iconColor: 'text-steel-500' },
  success: { wrap: 'border-brand-600 bg-brand-50', icon: 'check-circle', iconColor: 'text-brand-600' },
  warning: { wrap: 'border-grain-500 bg-grain-50', icon: 'alert-triangle', iconColor: 'text-grain-600' },
  danger: { wrap: 'border-danger-500 bg-danger-50', icon: 'alert-circle', iconColor: 'text-danger-500' },
}

export default function Alert({ tone = 'info', title, children, action, className = '' }) {
  const config = TONES[tone] || TONES.info
  return (
    <div
      className={`flex items-start gap-3 border-l-4 border border-line bg-surface px-4 py-3 ${config.wrap} ${className}`}
      role={tone === 'danger' ? 'alert' : 'note'}
    >
      <Icon name={config.icon} className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        {children ? <div className={`text-[15px] text-ink/90 ${title ? 'mt-0.5' : ''}`}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}
