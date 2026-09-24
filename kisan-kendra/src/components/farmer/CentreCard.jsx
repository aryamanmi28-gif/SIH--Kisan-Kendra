import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

/** The real backend centre has no live queue/capacity stats — just identity and contact info. */
export default function CentreCard({ centre }) {
  const { t } = useI18n()
  return (
    <article className="border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">
            <Link to={`/centres/${centre.id}`} className="hover:underline">
              {centre.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="map-pin" className="h-4 w-4" />
              {centre.district}, {centre.state}
            </span>
            <span aria-hidden="true">|</span>
            <span className="tnum">{centre.code}</span>
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm text-muted">{centre.address}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line bg-paper px-4 py-3">
        <Button to={`/centres/${centre.id}`} variant="neutral" size="sm">
          {t('centres.viewCentre')}
        </Button>
        <Button to={`/book/${centre.id}`} size="sm">
          {t('centres.bookSlot')}
        </Button>
      </div>
    </article>
  )
}
