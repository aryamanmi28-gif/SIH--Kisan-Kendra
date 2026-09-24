export function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`border border-line bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, icon, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-5 ${className}`}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          {icon}
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return <div className={`border-t border-line bg-paper px-4 py-3 sm:px-5 ${className}`}>{children}</div>
}

export default Card
