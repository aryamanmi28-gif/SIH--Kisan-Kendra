import Button from './Button.jsx'
import Icon from './Icon.jsx'
import Spinner from './Spinner.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

export function LoadingState({ label }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-line bg-surface px-6 py-14 text-center">
      <Spinner className="h-7 w-7 text-brand-600" />
      <p className="text-[15px] font-medium text-muted">{label ?? t('states.loadingDetails')}</p>
    </div>
  )
}

export function SkeletonRows({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="border border-line bg-surface p-4">
          <div className="h-4 w-1/3 bg-line" />
          <div className="mt-3 h-3 w-2/3 bg-paper" />
          <div className="mt-2 h-3 w-1/2 bg-paper" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ error, onRetry, title }) {
  const { t, tServer } = useI18n()
  const isOffline = error?.isNetworkError
  return (
    <div className="border border-danger-100 bg-danger-50 px-5 py-8 text-center">
      <Icon name="alert-circle" className="mx-auto h-8 w-8 text-danger-500" />
      <h2 className="mt-3 text-lg font-semibold text-ink">{isOffline ? t('states.noInternet') : title ?? t('states.didNotLoad')}</h2>
      <p className="mx-auto mt-1 text-[15px] text-ink/80">
        {tServer(error?.message) || t('states.tryInMoment')}
      </p>
      {onRetry ? (
        <div className="mt-5">
          <Button variant="secondary" onClick={() => onRetry()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function EmptyState({ icon = 'list', title, description, action, className = '' }) {
  return (
    <div className={`border border-dashed border-line bg-surface px-5 py-10 text-center ${className}`}>
      <Icon name={icon} className="mx-auto h-8 w-8 text-muted" />
      <h2 className="mt-3 text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
