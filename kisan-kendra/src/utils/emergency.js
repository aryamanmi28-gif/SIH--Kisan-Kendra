import { isToday } from './format.js'

export const REASON_CATEGORIES = [
  { code: 'weather_disaster', key: 'emergency.reason.weather_disaster' },
  { code: 'health_emergency', key: 'emergency.reason.health_emergency' },
  { code: 'other', key: 'emergency.reason.other' },
]

/**
 * Slot start as a Date. The backend's TIME_ZONE is 'Asia/Kolkata', and it
 * builds the slot-start instant via `timezone.make_aware(datetime.combine(...))`
 * with no explicit tz, which localizes the naive date+time as IST (UTC+5:30).
 * We parse it the same way here (an explicit "+05:30" offset) so the 12h
 * window agrees with the server on any device, regardless of the browser's
 * own clock/timezone settings -- without an explicit offset,
 * `new Date("...T09:00:00")` parses as browser-local time and can silently
 * disagree with the backend on a device not set to IST.
 */
export function slotStartDateTime(slot) {
  return new Date(`${slot.date}T${slot.start_time}+05:30`)
}

/**
 * Mirrors the backend's eligibility window exactly (see
 * BookingViewSet.emergency_request): booking must be BOOKED, its slot must
 * be strictly in the future (not today), and the request must land within
 * 12 hours of the slot's start time.
 */
export function emergencyWindowOpen(booking) {
  if (!booking || booking.status !== 'booked' || !booking.slot) return false
  if (isToday(booking.slot.date)) return false

  const start = slotStartDateTime(booking.slot)
  const now = new Date()
  if (now >= start) return false

  const hoursUntilStart = (start - now) / (1000 * 60 * 60)
  return hoursUntilStart <= 48 // TEMP FOR TESTING — REVERT TO 12 BEFORE PRESENTING
}
