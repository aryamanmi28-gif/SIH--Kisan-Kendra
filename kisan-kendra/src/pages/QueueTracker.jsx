import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import DemoNotice from '../components/farmer/DemoNotice.jsx'
import { bookingApi, centreApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatDate, formatDuration, formatSlotRange, relativeDay } from '../utils/format.js'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { getBookingCrop, tierForCrop } from '../utils/priority.js'

const POLL_MS = 10000

function BigStat({ label, value, tone = 'ink' }) {
  const colour = tone === 'steel' ? 'text-steel-600' : tone === 'brand' ? 'text-brand-700' : 'text-ink'
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold tnum sm:text-4xl ${colour}`}>{value}</p>
    </div>
  )
}

/** Resolves /queue with no id to the farmer's current booking. */
function QueuePicker() {
  const { t } = useI18n()
  useDocumentTitle(t('queue.docTitle'))
  const { data: bookings, loading, error, refetch } = useApi(() => bookingApi.list(), [])

  const active = useMemo(() => {
    const byNearestSlotDate = (a, b) => new Date(a.slot.date) - new Date(b.slot.date)

    const booked = (bookings || []).filter((booking) => booking.status === 'booked')
    const checkedIn = booked.filter((booking) => booking.queue_status != null)

    if (checkedIn.length > 0) {
      return [...checkedIn].sort(byNearestSlotDate)[0]
    }
    return [...booked].sort(byNearestSlotDate)[0]
  }, [bookings])

  if (loading && !bookings) return <LoadingState label={t('queue.finding')} />
  if (error && !bookings) return <ErrorState error={error} onRetry={refetch} />

  if (!active) {
    return (
      <>
        <PageHeader title={t('queue.title')} />
        <EmptyState
          icon="ticket"
          title={t('queue.noActive')}
          description={t('queue.noActiveText')}
          action={
            <Button to="/centres" size="lg">
              {t('queue.findCentre')}
            </Button>
          }
        />
      </>
    )
  }

  if (!active.queue_status) {
    return (
      <>
        <PageHeader title={t('queue.title')} />
        <Alert
          tone="info"
          title={t('queue.setFor', { ref: active.reference_code, day: relativeDay(active.slot.date).toLowerCase() })}
          action={
            <div className="flex flex-wrap gap-2">
              <Button to={`/check-in/${active.id}`}>{t('queue.checkIn')}</Button>
              <Button to={`/bookings/${active.id}`} variant="neutral">
                {t('queue.viewBooking')}
              </Button>
            </div>
          }
        >
          {t('queue.setForText', {
            centre: active.slot.centre.name,
            range: formatSlotRange(active.slot.start_time, active.slot.end_time),
          })}
        </Alert>
      </>
    )
  }

  return <Navigate to={`/queue/${active.id}`} replace />
}

function QueueView({ bookingId }) {
  const { t, tp } = useI18n()
  const cropCode = getBookingCrop(bookingId)
  const bookingQuery = useApi(() => bookingApi.detail(bookingId), [bookingId], { pollMs: POLL_MS })
  const queueQuery = useApi(() => bookingApi.queuePosition(bookingId), [bookingId], { pollMs: POLL_MS })

  const booking = bookingQuery.data
  const queue = queueQuery.data
  useDocumentTitle(queue ? t('queue.docTitleToken', { token: queue.token_number }) : t('queue.docTitle'))

  const centreQuery = useApi(() => centreApi.detail(queue.centre.id), [queue?.centre?.id], { skip: !queue })

  if ((bookingQuery.loading && !booking) || (queueQuery.loading && !queue)) {
    return <LoadingState label={t('queue.loading')} />
  }
  if (queueQuery.error && !queue) return <ErrorState error={queueQuery.error} onRetry={queueQuery.refetch} />
  if (!booking || !queue) return null

  const procurementDone = booking.status === 'completed'
  const yourTurn = queue.status === 'called' || queue.status === 'serving'
  const almost = queue.status === 'waiting' && queue.position > 0 && queue.position <= 2

  return (
    <>
      <PageHeader
        back={{ to: `/bookings/${bookingId}`, label: t('queue.back') }}
        title={t('queue.title')}
        description={queue.centre.name}
        meta={
          <>
            <StatusBadge kind="queue" status={queue.status} />
            {cropCode ? <PriorityBadge cropCode={cropCode} /> : null}
          </>
        }
        actions={
          <Button
            variant="neutral"
            size="sm"
            onClick={() => {
              queueQuery.refetch()
              bookingQuery.refetch()
            }}
            icon={<Icon name="refresh" className="h-4 w-4" />}
          >
            {t('common.refresh')}
          </Button>
        }
      />

      {procurementDone ? (
        <Alert
          tone="success"
          title={t('queue.procuredTitle')}
          className="mb-5"
          action={
            <Button to="/procurement" size="md">
              {t('queue.seeRecord')}
            </Button>
          }
        >
          {t('queue.procuredText')}
        </Alert>
      ) : queue.status === 'served' ? (
        <Alert tone="success" title={t('queue.servedTitle')} className="mb-5">
          {t('queue.servedText')}
        </Alert>
      ) : queue.status === 'skipped' ? (
        <Alert tone="danger" title={t('queue.skippedTitle')} className="mb-5">
          {t('queue.skippedText')}
        </Alert>
      ) : yourTurn ? (
        <div className="mb-5 border-2 border-brand-600 bg-brand-600 px-5 py-6 text-center text-white">
          <p className="text-lg font-semibold">{t('queue.yourTurn')}</p>
          <p className="mt-1 text-2xl font-bold">{t('queue.goNow')}</p>
        </div>
      ) : almost ? (
        <Alert tone="warning" title={t('queue.getReady')} className="mb-5">
          {tp('queue.getReadyText', queue.position)}
        </Alert>
      ) : null}

      {tierForCrop(cropCode) === 'high' && queue.status === 'waiting' && !procurementDone ? (
        <Alert tone="warning" title={t('priority.laneTitle')} className="mb-5">
          {t('priority.laneText')}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardBody className="p-0 sm:p-0">
              <div className="grid grid-cols-3 divide-x divide-line">
                <div className="bg-forest-800 px-3 py-4 text-center text-white">
                  <p className="text-sm text-white/80">
                    {t('queue.yourToken')}
                  </p>
                  <p className="mt-1 text-3xl font-bold tnum sm:text-4xl">#{queue.token_number}</p>
                </div>
                <BigStat label={t('queue.ahead')} value={queue.position} tone="steel" />
                <BigStat
                  label={t('queue.wait')}
                  value={yourTurn ? t('queue.now') : t('queue.approx', { value: formatDuration(queue.estimated_wait_minutes) })}
                  tone="brand"
                />
              </div>
            </CardBody>
          </Card>

          <p className="text-sm text-muted">
            {t('queue.autoRefresh', { seconds: POLL_MS / 1000 })}
          </p>

          <DemoNotice>
            {t('queue.demoText')}
          </DemoNotice>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('queue.bookingTitle')} />
            <CardBody>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted">{t('queue.reference')}</dt>
                  <dd className="font-semibold text-ink">{booking.reference_code}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('queue.slot')}</dt>
                  <dd className="font-semibold text-ink tnum">
                    {formatSlotRange(booking.slot.start_time, booking.slot.end_time)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('queue.date')}</dt>
                  <dd className="font-semibold text-ink">{formatDate(queue.date)}</dd>
                </div>
                {cropCode ? (
                  <div>
                    <dt className="text-sm text-muted">{t('queue.crop')}</dt>
                    <dd className="font-semibold text-ink">{t(`crops.${cropCode}`)}</dd>
                  </div>
                ) : null}
              </dl>
            </CardBody>
          </Card>

          {centreQuery.data ? (
            <Card>
              <CardHeader title={t('queue.problemTitle')} />
              <CardBody>
                <p className="text-[15px] text-muted">
                  {t('queue.problemText')}
                </p>
                <Button
                  href={`tel:${centreQuery.data.contact_number}`}
                  variant="secondary"
                  fullWidth
                  className="mt-3"
                  icon={<Icon name="phone" className="h-4 w-4" />}
                >
                  {t('queue.callCentre')}
                </Button>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default function QueueTracker() {
  const { bookingId } = useParams()
  return bookingId ? <QueueView bookingId={bookingId} /> : <QueuePicker />
}
