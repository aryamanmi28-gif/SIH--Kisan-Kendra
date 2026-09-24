import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { TextInput } from '../components/ui/Field.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import CropPicker from '../components/farmer/CropPicker.jsx'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import { bookingApi, centreApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { formatShortDate, formatSlotRange, formatWeekday, relativeDay } from '../utils/format.js'
import { getLastCrop, priorityWindowIds, setBookingCrop, tierForCrop } from '../utils/priority.js'

/**
 * Booking here is a slot + an optional expected quantity in kg — the backend
 * has no crop-lot concept, so there is no lot picker. See PS 26032 Phase 8.
 *
 * The crop step is frontend only: it drives the priority hints on this page
 * and is saved on the phone against the new booking id. The request sent to
 * the API is exactly what it was before: { slot, expected_quantity_kg }.
 */
export default function SlotBooking() {
  const { centreId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { t, tRaw, tServer } = useI18n()

  const centreQuery = useApi(() => centreApi.detail(centreId), [centreId])
  const slotsQuery = useApi(() => centreApi.slots(centreId), [centreId])

  const [cropCode, setCropCode] = useState(getLastCrop)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [quantityKg, setQuantityKg] = useState('')

  const createBooking = useMutation((payload) => bookingApi.create(payload))

  const centre = centreQuery.data
  const tier = tierForCrop(cropCode)

  const dates = useMemo(() => {
    const unique = [...new Set((slotsQuery.data || []).map((slot) => slot.date))]
    return unique.sort()
  }, [slotsQuery.data])

  const slotsForDate = useMemo(
    () => (slotsQuery.data || []).filter((slot) => slot.date === date),
    [slotsQuery.data, date],
  )

  // The earliest third of each day's slots: where high-priority crops go.
  const windowIds = useMemo(() => priorityWindowIds(slotsQuery.data || []), [slotsQuery.data])

  const selectedSlot = slotsForDate.find((slot) => slot.start_time === startTime)
  const selectedInWindow = selectedSlot ? windowIds.has(selectedSlot.id) : false
  const currentStep = !date ? (cropCode ? 1 : 0) : !startTime ? 2 : 3

  const loading = centreQuery.loading || slotsQuery.loading
  const loadError = centreQuery.error || slotsQuery.error

  useDocumentTitle(centre ? t('booking.docTitleAt', { name: centre.name }) : t('booking.docTitle'))

  const submit = async () => {
    const result = await createBooking.mutate({
      slot: selectedSlot.id,
      expected_quantity_kg: quantityKg === '' ? null : Number(quantityKg),
    })
    if (result.ok) {
      if (cropCode) setBookingCrop(result.data.id, cropCode)
      notify(t('booking.confirmed', { ref: result.data.reference_code }), 'success', 6000)
      navigate(`/bookings/${result.data.id}`, { replace: true, state: { justBooked: true } })
    }
  }

  if (loading && !centre) return <LoadingState label={t('booking.loading')} />
  if (loadError && !centre) {
    return <ErrorState error={loadError} onRetry={() => { centreQuery.refetch(); slotsQuery.refetch() }} />
  }
  if (!centre) return null

  return (
    <>
      <PageHeader
        back={{ to: `/centres/${centreId}`, label: t('booking.back') }}
        title={t('booking.title')}
        description={centre.name}
      />

      <div className="mb-5">
        <Stepper steps={tRaw('booking.steps')} current={currentStep} />
      </div>

      {createBooking.error ? (
        <Alert tone="danger" title={t('booking.failed')} className="mb-5">
          {tServer(createBooking.error.message)}
        </Alert>
      ) : null}

      {dates.length === 0 ? (
        <EmptyState icon="ticket" title={t('booking.noSlots')} description={t('booking.noSlotsText')} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Card>
              <CardHeader title={`1. ${t('priority.cropTitle')}`} subtitle={t('priority.cropSubtitle')} />
              <CardBody>
                <CropPicker value={cropCode} onChange={setCropCode} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={`2. ${t('booking.dayTitle')}`} subtitle={t('booking.daySubtitle')} />
              <CardBody>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {dates.map((value, index) => {
                    const selected = date === value
                    const count = slotsQuery.data.filter((slot) => slot.date === value).length
                    const suggest = tier === 'high' && index === 0
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setDate(value)
                          setStartTime('')
                        }}
                        className={`relative flex min-w-[92px] shrink-0 flex-col items-center border px-3 py-2.5 ${
                          selected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : suggest
                              ? 'border-grain-500 bg-grain-50 text-ink hover:border-brand-600'
                              : 'border-line bg-surface text-ink hover:border-brand-600'
                        }`}
                        aria-pressed={selected}
                      >
                        <span className="text-sm">{formatWeekday(value)}</span>
                        <span className="text-lg font-bold tnum">{formatShortDate(value)}</span>
                        <span className={`text-xs tnum ${selected ? 'text-white/80' : 'text-muted'}`}>
                          {t('booking.openCount', { count })}
                        </span>
                        {suggest ? (
                          <span className={`mt-1 text-xs font-semibold ${selected ? 'text-white' : 'text-grain-700'}`}>
                            {t('priority.earliestTag')}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={`3. ${t('booking.timeTitle')}`}
                subtitle={date ? relativeDay(date) : t('booking.pickDayFirst')}
              />
              <CardBody>
                {!date ? (
                  <p className="text-[15px] text-muted">{t('booking.chooseDayHint')}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {slotsForDate.map((slot) => {
                        const selected = startTime === slot.start_time
                        const inWindow = windowIds.has(slot.id)
                        const recommended = inWindow && tier === 'high'
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setStartTime(slot.start_time)}
                            aria-pressed={selected}
                            className={`border px-3 py-3 text-left ${
                              selected
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : recommended
                                  ? 'border-grain-500 bg-grain-50 text-ink hover:border-brand-600'
                                  : 'border-line bg-surface text-ink hover:border-brand-600'
                            }`}
                          >
                            <span className="block font-semibold tnum">
                              {formatSlotRange(slot.start_time, slot.end_time)}
                            </span>
                            <span className={`mt-0.5 block text-sm tnum ${selected ? 'text-white/85' : 'text-muted'}`}>
                              {t('booking.capacity', { count: slot.capacity })}
                            </span>
                            {inWindow ? (
                              <span
                                className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                                  selected ? 'text-white' : recommended ? 'text-grain-700' : 'text-muted'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    selected ? 'bg-white' : recommended ? 'bg-grain-500' : 'bg-muted'
                                  }`}
                                  aria-hidden="true"
                                />
                                {recommended ? t('priority.recommendedTag') : t('priority.windowTag')}
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>

                    {selectedSlot && tier === 'standard' && selectedInWindow ? (
                      <Alert tone="info" className="mt-4">
                        {t('priority.standardInWindow')}
                      </Alert>
                    ) : null}
                    {selectedSlot &&
                    tier === 'high' &&
                    !selectedInWindow &&
                    slotsForDate.some((slot) => windowIds.has(slot.id)) ? (
                      <Alert tone="warning" className="mt-4">
                        {t('priority.highOutsideWindow')}
                      </Alert>
                    ) : null}
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={`4. ${t('booking.qtyTitle')}`} subtitle={t('booking.qtySubtitle')} />
              <CardBody>
                <TextInput
                  label={t('booking.qtyLabel')}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  hint={t('booking.qtyHint')}
                  value={quantityKg}
                  onChange={(event) => setQuantityKg(event.target.value)}
                />
              </CardBody>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader title={t('booking.summary')} />
              <CardBody>
                <DetailList
                  columns={1}
                  items={[
                    { label: t('booking.centre'), value: centre.name },
                    {
                      label: t('booking.crop'),
                      value: cropCode ? (
                        <span className="flex flex-wrap items-center gap-2">
                          {t(`crops.${cropCode}`)}
                          <PriorityBadge cropCode={cropCode} />
                        </span>
                      ) : (
                        t('priority.noCrop')
                      ),
                    },
                    {
                      label: t('booking.day'),
                      value: date ? `${relativeDay(date)}, ${formatShortDate(date)}` : t('common.notChosen'),
                    },
                    {
                      label: t('booking.time'),
                      value: selectedSlot
                        ? formatSlotRange(selectedSlot.start_time, selectedSlot.end_time)
                        : t('common.notChosen'),
                    },
                    {
                      label: t('booking.qty'),
                      value: quantityKg ? t('format.kg', { value: quantityKg }) : t('common.notEntered'),
                    },
                  ]}
                />

                <Button
                  size="lg"
                  fullWidth
                  className="mt-4"
                  onClick={submit}
                  disabled={!date || !startTime}
                  loading={createBooking.loading}
                >
                  {createBooking.loading ? t('booking.submitting') : t('booking.submit')}
                </Button>
                <p className="mt-2 text-sm text-muted">{t('booking.cancelAnyTime')}</p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
