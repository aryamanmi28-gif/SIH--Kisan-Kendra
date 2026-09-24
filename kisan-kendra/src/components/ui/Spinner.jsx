import { useI18n } from '../../i18n/I18nProvider.jsx'

export default function Spinner({ className = 'h-5 w-5', label }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-2">
      <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {label ? <span>{label}</span> : null}
      <span className="sr-only">{t('common.loading')}</span>
    </span>
  )
}
