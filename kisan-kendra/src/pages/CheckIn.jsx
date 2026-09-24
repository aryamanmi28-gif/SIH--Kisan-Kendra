import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Checkbox } from '../components/ui/Field.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import { bookingApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate, formatSlotRange, formatWeightKg, isToday } from '../utils/format.js'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { getBookingCrop, tierForCrop } from '../utils/priority.js'

export default function CheckIn() {
  const { t, tRaw, tServer } = useI18n()
  useDocumentTitle(t('checkin.docTitle'))
  const { bookingId } = useParams()
  const cropCode = getBookingCrop(bookingId)
  const navigate = useNavigate()
  const { notify } = useToast()
  const [atGate, setAtGate] = useState(false)
  const [error, setError] = useState('')

  const { data: booking, loading, error: loadError, refetch } = useApi(
    () => bookingApi.detail(bookingId),
    [bookingId],
  )
  const checkIn = useMutation(() => bookingApi.checkIn(bookingId))

  if (loading && !booking) return <LoadingState label={t('slip.loading')} />
  if (loadError && !booking) return <ErrorState error={loadError} onRetry={refetch} />
  if (!booking) return null

  const today = isToday(booking.slot.date)
  const alreadyIn = Boolean(booking.queue_status)

  const submit = async () => {
    if (!atGate) {
      setError(t('checkin.confirmError'))
      return
    }
    setError('')
    const result = await checkIn.mutate()
    if (result.ok) {
      notify(t('checkin.done', { token: result.data.token_number }), 'success', 6000)
      navigate(`/queue/${bookingId}`, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: `/bookings/${bookingId}`, label: t('checkin.back') }}
        title={t('checkin.title')}
        description={t('checkin.lead')}
        meta={cropCode ? <PriorityBadge cropCode={cropCode} /> : null}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title={t('checkin.beingChecked')} subtitle={booking.slot.centre.name} />
          <CardBody>
            <DetailList
              items={[
                { label: t('checkin.reference'), value: booking.reference_code },
                { label: t('checkin.date'), value: formatDate(booking.slot.date) },
                { label: t('checkin.slot'), value: formatSlotRange(booking.slot.start_time, booking.slot.end_time) },
                { label: t('slip.crop'), value: cropCode ? t(`crops.${cropCode}`) : null },
                { label: t('checkin.expectedQty'), value: formatWeightKg(booking.expected_quantity_kg) },
              ]}
            />
          </CardBody>
        </Card>

        <div className="space-y-4">
          {alreadyIn ? (
            <Alert tone="success" title={t('checkin.alreadyTitle')} action={
              <Button to={`/queue/${bookingId}`} size="md">
                {t('checkin.watchQueue')}
              </Button>
            }>
              {t('checkin.alreadyText')}
            </Alert>
          ) : booking.status === 'cancelled' ? (
            <Alert tone="danger" title={t('checkin.cancelledTitle')}>
              {t('checkin.cancelledText')}
            </Alert>
          ) : booking.status !== 'booked' ? (
            <Alert tone="warning" title={t('checkin.closedTitle')} />
          ) : !today ? (
            <Alert tone="warning" title={t('checkin.opensOn', { date: formatDate(booking.slot.date) })}>
              {t('checkin.opensOnText')}
            </Alert>
          ) : (
            <Card>
              <CardHeader title={t('checkin.confirmTitle')} />
              <CardBody className="space-y-4">
                <Checkbox
                  name="atGate"
                  checked={atGate}
                  onChange={(event) => {
                    setAtGate(event.target.checked)
                    setError('')
                  }}
                  label={t('checkin.confirmLabel')}
                  hint={t('checkin.confirmHint')}
                />
                {error ? <p className="text-sm font-medium text-danger-600">{error}</p> : null}
                {checkIn.error ? <Alert tone="danger">{tServer(checkIn.error.message)}</Alert> : null}
                <Button size="lg" fullWidth onClick={submit} loading={checkIn.loading} disabled={!atGate}>
                  {t('checkin.submit')}
                </Button>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title={t('checkin.gateTitle')} />
            <CardBody>
              {tierForCrop(cropCode) === 'high' ? (
                <Alert tone="warning" title={t('priority.laneTitle')} className="mb-4">
                  {t('priority.laneText')}
                </Alert>
              ) : null}
              <ul className="space-y-2.5 text-[15px] text-ink/90">
                {tRaw('checkin.gateItems').map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
