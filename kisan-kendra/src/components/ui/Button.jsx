import { Link } from 'react-router-dom'
import Spinner from './Spinner.jsx'

const VARIANTS = {
  primary: 'bg-brand-600 text-white border-brand-600 hover:bg-brand-hover hover:border-brand-hover',
  secondary: 'bg-surface text-brand-700 border-brand-600 hover:bg-brand-50',
  neutral: 'bg-surface text-ink border-line hover:bg-paper',
  danger: 'bg-surface text-danger-600 border-danger-500 hover:bg-danger-50',
  solidDanger: 'bg-danger-500 text-white border-danger-500 hover:bg-danger-hover hover:border-danger-hover',
  ghost: 'bg-transparent text-brand-700 border-transparent hover:bg-brand-50',
}

// Touch targets stay at 44px and above: these are used with cold hands,
// gloves, and cracked screens.
const SIZES = {
  sm: 'min-h-[38px] px-3 text-sm',
  md: 'min-h-[46px] px-5 text-[15px]',
  lg: 'min-h-[54px] px-6 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading
  const classes = [
    'inline-flex items-center justify-center gap-2 border font-semibold',
    'transition-colors duration-150 rounded',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? 'w-full' : '',
    isDisabled ? 'cursor-not-allowed opacity-55 pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      <span>{children}</span>
      {!loading && iconRight ? iconRight : null}
    </>
  )

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href && !isDisabled) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={isDisabled} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
}
