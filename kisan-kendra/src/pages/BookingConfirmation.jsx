import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import Modal from '../components/ui/Modal.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { Checkbox, SelectInput, TextArea } from '../components/ui/Field.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import TokenPlate from '../components/farmer/TokenPlate.jsx'
import { bookingApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, formatWeightKg, formatSlotRange, formatTime, isToday, relativeDay } from '../utils/format.js'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import BookingCropField from '../components/farmer/BookingCropField.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { tierForCrop, useBookingCrop } from '../utils/priority.js'
import { REASON_CATEGORIES, emergencyWindowOpen } from '../utils/emergency.js'

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { user } = useAuth()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { t, tRaw, tServer } = useI18n()
  const [cropCode, setCropCode] = useBookingCrop(bookingId)
  const tier = tierForCrop(cropCode)

  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [reasonCategory, setReasonCategory] = useState('')
  const [note, setNote] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [ackError, setAckError] = useState('')
  const [rejectionDetail, setRejectionDetail] = useState('')

  const { data: booking, loading, error, refetch } = useApi(() => bookingApi.detail(bookingId), [bookingId])
  const checkedIn = Boolean(booking?.queue_status)
  const queueQuery = useApi(() => bookingApi.queuePosition(bookingId), [bookingId, checkedIn], {
    skip: !checkedIn,
  })
  const cancel = useMutation(() => bookingApi.cancel(bookingId))
  const emergency = useMutation(() =>
    bookingApi.emergencyRequest(bookingId, { reason_category: reasonCategory, note, acknowledged }),
  )

  useDocumentTitle(booking ? t('slip.docTitleRef', { ref: booking.reference_code }) : t('slip.docTitle'))

  if (loading && !booking) return <LoadingState label={t('slip.loading')} />
  if (error && !booking) return <ErrorState error={error} onRetry={refetch} title={t('slip.failed')} />
  if (!booking) return null

  const today = isToday(booking.slot.date)
  const isActive = booking.status === 'booked'
  const canCheckIn = isActive && today && !checkedIn
  const inQueue = isActive && checkedIn
  const canRequestEmergency = emergencyWindowOpen(booking)

  const doCancel = async () => {
    const result = await cancel.mutate()
    setConfirmCancel(false)
    if (result.ok) {
      notify(t('slip.cancelled'), 'success')
      navigate('/dashboard')
    } else if (result.error) {
      notify(tServer(result.error.message), 'error')
    }
  }

  const openEmergency = () => {
    setReasonCategory('')
    setNote('')
    setAcknowledged(false)
    setAckError('')
    setRejectionDetail('')
    setEmergencyOpen(true)
  }

  const submitEmergency = async () => {
    if (!acknowledged) {
      setAckError(t('emergency.disclaimerError'))
      return
    }
    setAckError('')
    setRejectionDetail('')
    const result = await emergency.mutate()
    if (result.ok && result.data.status === 'approved') {
      const newSlot = result.data.booking.slot
      setEmergencyOpen(false)
      notify(
        t('emergency.approvedText', {
          day: relativeDay(newSlot.date),
          range: formatSlotRange(newSlot.start_time, newSlot.end_time),
          centre: newSlot.centre.name,
        }),
        'success',
        8000,
      )
      refetch()
    } else if (result.ok && result.data.status === 'rejected') {
      setRejectionDetail(tServer(result.data.detail))
    } else if (result.error) {
      setRejectionDetail(tServer(result.error.message))
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: '/dashboard', label: t('slip.back') }}
        title={t('slip.title')}
        description={t('slip.bookedOn', { date: formatDate(booking.booked_at) })}
        meta={
          <>
            <StatusBadge kind="booking" status={booking.status} />
            {cropCode ? <PriorityBadge cropCode={cropCode} /> : null}
          </>
        }
        actions={
          <Button
            variant="neutral"
            size="sm"
            onClick={() => window.print()}
            icon={<Icon name="print" className="h-4 w-4" />}
          >
            {t('common.printSlip')}
          </Button>
        }
      />

      {location.state?.justBooked ? (
        <Alert tone="success" title={t('slip.justBookedTitle')} className="mb-5">
          {t('slip.justBookedText', {
            day: relativeDay(booking.slot.date).toLowerCase(),
            range: formatSlotRange(booking.slot.start_time, booking.slot.end_time),
          })}
        </Alert>
      ) : null}

      {booking.status === 'no_show' ? (
        <Alert tone="danger" title={t('slip.missedTitle')} className="mb-5">
          {t('slip.missedText')}
        </Alert>
      ) : null}
      {booking.status === 'cancelled' ? (
        <Alert tone="warning" title={t('slip.cancelledTitle')} className="mb-5">
          {t('slip.cancelledText')}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="print-slip">
          <CardHeader title={t('slip.slipTitle')} subtitle={booking.slot.centre.name} />
          <CardBody>
            <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
              {checkedIn && queueQuery.data ? (
                <div>
                  <TokenPlate tokenNumber={queueQuery.data.token_number} />
                  <p className="mt-2 text-center text-sm text-muted">
                    {t('slip.reference')} <span className="font-semibold text-ink">{booking.reference_code}</span>
                  </p>
                </div>
              ) : (
                <div className="border-2 border-line bg-paper px-5 py-5 text-center">
                  <p className="text-sm font-medium text-muted">{t('slip.reference')}</p>
                  <p className="mt-2 text-2xl font-bold text-ink">{booking.reference_code}</p>
                  <p className="mt-2 text-sm text-muted">{t('slip.tokenAtCheckIn')}</p>
                </div>
              )}
              <DetailList
                items={[
                  { label: t('slip.farmer'), value: user?.full_name },
                  { label: t('slip.date'), value: `${relativeDay(booking.slot.date)}, ${formatDate(booking.slot.date)}`, emphasis: true },
                  {
                    label: t('slip.reportingTime'),
                    value: formatSlotRange(booking.slot.start_time, booking.slot.end_time),
                    emphasis: true,
                  },
                  { label: t('slip.crop'), value: cropCode ? `${t(`crops.${cropCode}`)} (${t(`priority.tier.${tier}`)})` : null },
                  { label: t('slip.expectedQty'), value: formatWeightKg(booking.expected_quantity_kg) },
                  { label: t('slip.centre'), value: `${booking.slot.centre.name} (${booking.slot.centre.code})` },
                ]}
              />
            </div>

            {tier === 'high' ? (
              <div className="mt-5 flex items-start gap-3 border-2 border-grain-500 bg-grain-50 px-4 py-3">
                <Icon name="truck" className="mt-0.5 h-6 w-6 shrink-0 text-grain-600" />
                <div>
                  <p className="font-semibold text-ink">{t('priority.laneTitle')}</p>
                  <p className="text-[15px] text-ink/90">{t('priority.laneText')}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm text-muted">{t('slip.disclaimer')}</p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('slip.nextTitle')} />
            <CardBody className="space-y-3">
              {inQueue ? (
                <>
                  <p className="text-[15px] text-ink/90">{t('slip.inQueueText')}</p>
                  <Button to={`/queue/${booking.id}`} size="lg" fullWidth>
                    {t('slip.watchQueue')}
                  </Button>
                </>
              ) : canCheckIn ? (
                <>
                  <p className="text-[15px] text-ink/90">
                    {t('slip.todayText')}
                  </p>
                  <Button to={`/check-in/${booking.id}`} size="lg" fullWidth>
                    {t('slip.checkIn')}
                  </Button>
                </>
              ) : isActive ? (
                <p className="text-[15px] text-ink/90">
                  {t('slip.laterText', {
                    date: formatDate(booking.slot.date),
                    time: formatTime(booking.slot.start_time),
                  })}
                </p>
              ) : (
                <Button to="/centres" size="lg" fullWidth>
                  {t('slip.bookAnother')}
                </Button>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('slip.bringTitle')} />
            <CardBody>
              <ul className="space-y-2">
                {tRaw('slip.bringItems').map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[15px] text-ink/90">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {isActive && !cropCode ? (
            <Card className="print-hide">
              <CardBody>
                <BookingCropField value={cropCode} onChange={setCropCode} />
              </CardBody>
            </Card>
          ) : null}

          {canRequestEmergency ? (
            <Card className="print-hide">
              <CardHeader title={t('emergency.cardTitle')} />
              <CardBody className="space-y-3">
                <p className="text-[15px] text-ink/90">{t('emergency.cardText')}</p>
                <Button variant="secondary" fullWidth onClick={openEmergency}>
                  {t('emergency.button')}
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {isActive ? (
            <Button variant="danger" fullWidth onClick={() => setConfirmCancel(true)} className="print-hide">
              {t('slip.cancel')}
            </Button>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={t('slip.cancelTitle')}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button variant="solidDanger" onClick={doCancel} loading={cancel.loading}>
              {t('slip.cancelYes')}
            </Button>
            <Button variant="neutral" onClick={() => setConfirmCancel(false)}>
              {t('slip.cancelKeep')}
            </Button>
          </div>
        }
      >
        <p>
          {t('slip.cancelText', { ref: booking.reference_code, centre: booking.slot.centre.name })}
        </p>
      </Modal>

      <Modal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        title={t('emergency.modalTitle')}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="solidDanger"
              onClick={submitEmergency}
              loading={emergency.loading}
              disabled={!reasonCategory || !acknowledged}
            >
              {emergency.loading ? t('emergency.submitting') : t('emergency.submit')}
            </Button>
            <Button variant="neutral" onClick={() => setEmergencyOpen(false)}>
              {t('emergency.cancel')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Alert tone="warning">{t('emergency.disclaimer')}</Alert>

          {rejectionDetail ? (
            <Alert tone="danger" title={t('emergency.rejectedTitle')}>
              {rejectionDetail}
            </Alert>
          ) : null}

          <SelectInput
            label={t('emergency.reasonLabel')}
            name="reasonCategory"
            required
            options={REASON_CATEGORIES.map((reason) => ({ value: reason.code, label: t(reason.key) }))}
            value={reasonCategory}
            onChange={(event) => setReasonCategory(event.target.value)}
          />

          <TextArea
            label={t('emergency.noteLabel')}
            name="emergencyNote"
            placeholder={t('emergency.notePlaceholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <Checkbox
            name="emergencyAck"
            checked={acknowledged}
            onChange={(event) => {
              setAcknowledged(event.target.checked)
              setAckError('')
            }}
            label={t('emergency.disclaimerAck')}
          />
          {ackError ? <p className="text-sm font-medium text-danger-600">{ackError}</p> : null}
        </div>
      </Modal>
    </>
  )
}
