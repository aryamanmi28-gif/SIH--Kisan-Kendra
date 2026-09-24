import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import DemoNotice from '../components/farmer/DemoNotice.jsx'
import { dashboardApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  formatCurrency,
  formatWeightKg,
  formatSlotRange,
  formatDate,
  relativeDay,
  isToday,
} from '../utils/format.js'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { getBookingCrop, tierForCrop } from '../utils/priority.js'

// /crops and /payments are hidden for this prototype (no backend support) —
// quick actions only link to features that actually work.
const QUICK_ACTIONS = [
  { to: '/centres', key: 'dashboard.actionFindCentre', icon: 'map-pin' },
  { to: '/queue', key: 'dashboard.actionQueue', icon: 'ticket' },
  { to: '/procurement', key: 'dashboard.actionRecords', icon: 'scale' },
]

function StatTile({ label, value, sub, to }) {
  const content = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink tnum">{value}</p>
      {sub ? <p className="mt-0.5 text-sm text-muted">{sub}</p> : null}
    </>
  )
  if (to) {
    return (
      <Link to={to} className="block border border-line bg-surface px-4 py-3 hover:border-brand-600">
        {content}
      </Link>
    )
  }
  return <div className="border border-line bg-surface px-4 py-3">{content}</div>
}

function ActiveBooking({ booking }) {
  const { t } = useI18n()
  const cropCode = getBookingCrop(booking.id)
  const highPriority = tierForCrop(cropCode) === 'high'
  const today = isToday(booking.slot.date)
  const canCheckIn = booking.status === 'booked' && today && !booking.queue_status
  const inQueue = Boolean(booking.queue_status)

  return (
    <Card className={`border-l-4 ${highPriority ? 'border-l-grain-500' : 'border-l-brand-600'}`}>
      <CardHeader
        title={t('dashboard.nextSlot')}
        subtitle={`${relativeDay(booking.slot.date)}, ${formatSlotRange(booking.slot.start_time, booking.slot.end_time)}`}
        action={
          <div className="flex flex-wrap justify-end gap-1.5">
            {cropCode ? <PriorityBadge cropCode={cropCode} /> : null}
            <StatusBadge kind="booking" status={booking.status} />
          </div>
        }
      />
      <CardBody>
        <DetailList
          items={[
            { label: t('dashboard.centre'), value: booking.slot.centre.name, wide: true },
            { label: t('dashboard.crop'), value: cropCode ? t(`crops.${cropCode}`) : null },
            { label: t('dashboard.expectedQty'), value: formatWeightKg(booking.expected_quantity_kg) },
            { label: t('dashboard.date'), value: formatDate(booking.slot.date) },
            { label: t('dashboard.reference'), value: booking.reference_code },
          ]}
        />
      </CardBody>
      <CardFooter className="flex flex-wrap gap-2">
        {inQueue ? (
          <Button to={`/queue/${booking.id}`} size="md" icon={<Icon name="ticket" className="h-4 w-4" />}>
            {t('dashboard.watchQueue')}
          </Button>
        ) : canCheckIn ? (
          <Button to={`/check-in/${booking.id}`} size="md">
            {t('dashboard.checkIn')}
          </Button>
        ) : null}
        <Button to={`/bookings/${booking.id}`} variant="neutral" size="md">
          {t('dashboard.viewBooking')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Dashboard() {
  const { t, tp } = useI18n()
  useDocumentTitle(t('dashboard.docTitle'))
  const { user } = useAuth()
  const { data, loading, error, refetch } = useApi(() => dashboardApi.summary(), [], { pollMs: 30000 })

  const firstName = (data?.profile?.full_name || user?.full_name || t('dashboard.fallbackName')).split(' ')[0]

  return (
    <>
      <PageHeader
        title={t('dashboard.greeting', { name: firstName })}
        description={
          data?.profile
            ? t('dashboard.profileLine', { village: data.profile.village, district: data.profile.district, id: data.profile.id })
            : t('dashboard.summary')
        }
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            {t('common.refresh')}
          </Button>
        }
      />

      {loading && !data ? <LoadingState label={t('dashboard.loading')} /> : null}
      {error && !data ? <ErrorState error={error} onRetry={refetch} title={t('dashboard.failed')} /> : null}

      {data ? (
        <div className="space-y-6">
          {data.activeBooking ? (
            <ActiveBooking booking={data.activeBooking} />
          ) : (
            <EmptyState
              icon="ticket"
              title={t('dashboard.noSlotTitle')}
              description={t('dashboard.noSlotText')}
              action={
                <Button to="/centres" size="lg">
                  {t('dashboard.findCentre')}
                </Button>
              }
            />
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatTile
              label={t('dashboard.pendingLabel')}
              value={formatCurrency(data.pendingPaymentAmount)}
              sub={tp('dashboard.pendingSub', data.pendingPaymentCount)}
              to="/procurement"
            />
            <StatTile
              label={t('dashboard.receivedLabel')}
              value={formatCurrency(data.creditedTotal)}
              sub={tp('dashboard.receivedSub', data.procurementCount)}
              to="/procurement"
            />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">{t('dashboard.whatToDo')}</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex min-h-[104px] flex-col justify-between border border-line bg-surface p-4 hover:border-brand-600"
                >
                  <Icon name={action.icon} className="h-7 w-7 text-brand-600" />
                  <span className="block font-semibold text-ink">{t(action.key)}</span>
                </Link>
              ))}
            </div>
          </section>

          {data.recentProcurement ? (
            <Card>
              <CardHeader
                title={t('dashboard.latest')}
                subtitle={`${data.recentProcurement.commodity}, ${formatWeightKg(data.recentProcurement.quantity_kg)}`}
                action={<StatusBadge kind="procurementPayment" status={data.recentProcurement.payment_status} />}
              />
              <CardBody className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{t('dashboard.amount')}</p>
                  <p className="text-2xl font-bold text-ink tnum">{formatCurrency(data.recentProcurement.total_amount)}</p>
                </div>
                <Button to="/procurement" variant="secondary" size="sm">
                  {t('dashboard.seeAll')}
                </Button>
              </CardBody>
            </Card>
          ) : null}

          <DemoNotice />
        </div>
      ) : null}
    </>
  )
}
