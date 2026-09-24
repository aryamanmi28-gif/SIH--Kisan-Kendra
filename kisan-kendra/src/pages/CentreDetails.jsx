import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import { centreApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatSlotRange, relativeDay, formatWeekday } from '../utils/format.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

/**
 * The real centre record only carries identity and contact info — no live
 * queue stats, capacity bar, facilities list or crop catalogue. Those fields
 * don't exist on the backend, so this page shows what's actually there plus
 * the open slots at this centre.
 */
export default function CentreDetails() {
  const { centreId } = useParams()
  const { t } = useI18n()
  const centreQuery = useApi(() => centreApi.detail(centreId), [centreId])
  const slotsQuery = useApi(() => centreApi.slots(centreId), [centreId], { pollMs: 30000 })

  const centre = centreQuery.data
  useDocumentTitle(centre?.name || t('centre.docTitle'))

  const dates = useMemo(() => {
    const unique = [...new Set((slotsQuery.data || []).map((slot) => slot.date))]
    return unique.sort()
  }, [slotsQuery.data])

  if (centreQuery.loading && !centre) return <LoadingState label={t('centre.loading')} />
  if (centreQuery.error && !centre) {
    return <ErrorState error={centreQuery.error} onRetry={centreQuery.refetch} title={t('centre.failed')} />
  }
  if (!centre) return null

  return (
    <>
      <PageHeader
        back={{ to: '/centres', label: t('centre.allCentres') }}
        title={centre.name}
        description={centre.address}
        meta={<span className="text-[15px] text-muted tnum">{centre.code}</span>}
        actions={
          <Button to={`/book/${centre.id}`} size="md">
            {t('centre.bookSlot')}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title={t('centre.openSlots')} icon={<Icon name="ticket" className="h-5 w-5 text-brand-600" />} />
            <CardBody>
              {slotsQuery.loading && !slotsQuery.data ? (
                <p className="text-[15px] text-muted">{t('centre.loadingSlots')}</p>
              ) : dates.length === 0 ? (
                <EmptyState
                  icon="ticket"
                  title={t('centre.noSlots')}
                  description={t('centre.noSlotsText')}
                />
              ) : (
                <div className="space-y-4">
                  {dates.map((date) => (
                    <div key={date}>
                      <p className="mb-1.5 text-sm font-semibold text-ink">
                        {relativeDay(date)} <span className="ml-1 font-normal text-muted">{formatWeekday(date)}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slotsQuery.data
                          .filter((slot) => slot.date === date)
                          .map((slot) => (
                            <span
                              key={slot.id}
                              className="border border-line bg-surface px-3 py-1.5 text-sm tnum text-ink"
                            >
                              {formatSlotRange(slot.start_time, slot.end_time)}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button to={`/book/${centre.id}`} size="lg" fullWidth className="mt-5">
                {t('centre.bookHere')}
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title={t('centre.info')} />
            <CardBody>
              <DetailList
                columns={1}
                items={[
                  { label: t('centre.address'), value: centre.address },
                  { label: t('centre.district'), value: centre.district },
                  { label: t('centre.state'), value: centre.state },
                  {
                    label: t('centre.contact'),
                    value: (
                      <a href={`tel:${centre.contact_number}`} className="text-brand-700 underline tnum">
                        {centre.contact_number}
                      </a>
                    ),
                  },
                  { label: t('centre.code'), value: centre.code },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
