import { getLanguage, translate } from '../i18n/translate.js'
import { languageMeta } from '../i18n/languages.js'

// English keeps the original hand-written formats exactly. The other
// languages use the browser's own CLDR data (month and weekday names), which
// is accurate for hi, kn, ta and te and keeps Latin digits by default.
const intlLocale = () => languageMeta(getLanguage()).intl
const useIntl = () => getLanguage() !== 'en' && typeof Intl !== 'undefined'
function intlFormat(date, options) {
  try {
    return new Intl.DateTimeFormat(intlLocale(), options).format(date)
  } catch {
    return null
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 1,25,400 grouping, the way amounts are read in India. */
export function formatCurrency(amount, { decimals = 0 } = {}) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—'
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatQuantity(quintals) {
  if (quintals === null || quintals === undefined) return '—'
  return translate('format.quintal', { value: formatNumber(quintals, Number.isInteger(Number(quintals)) ? 0 : 2) })
}

/** The real backend records quantity in kg, not quintal. */
export function formatWeightKg(kg) {
  if (kg === null || kg === undefined || kg === '') return '—'
  return translate('format.kg', { value: formatNumber(kg, Number.isInteger(Number(kg)) ? 0 : 2) })
}

export function formatDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  if (useIntl()) {
    const text = intlFormat(date, { day: 'numeric', month: 'short', year: 'numeric' })
    if (text) return text
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatShortDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  if (useIntl()) {
    const text = intlFormat(date, { day: 'numeric', month: 'short' })
    if (text) return text
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatWeekday(value) {
  const date = toDate(value)
  if (!date) return ''
  if (useIntl()) {
    const text = intlFormat(date, { weekday: 'short' })
    if (text) return text
  }
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
}

/** "09:30" (24h from the API) rendered as "9:30 AM". */
export function formatTime(hhmm) {
  if (!hhmm) return '—'
  const [hourStr, minuteStr] = String(hhmm).split(':')
  let hour = Number(hourStr)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour}:${minuteStr} ${suffix}`
}

export function formatSlotRange(start, end) {
  if (!start) return '—'
  return translate('format.range', { start: formatTime(start), end: formatTime(end) })
}

export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  const minutes = String(date.getMinutes()).padStart(2, '0')
  let hour = date.getHours()
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${formatDate(date)}, ${hour}:${minutes} ${suffix}`
}

/** Minutes as "45 min" or "1 hr 20 min" - never a bare decimal. */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0))
  if (total < 1) return translate('format.lessThanMinute')
  if (total < 60) return translate('format.minutes', { m: total })
  const hours = Math.floor(total / 60)
  const rest = total % 60
  return rest ? translate('format.hoursMinutes', { h: hours, m: rest }) : translate('format.hours', { h: hours })
}

export function formatMobile(mobile) {
  if (!mobile) return '—'
  const digits = String(mobile).replace(/\D/g, '').slice(-10)
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function maskMobile(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '').slice(-10)
  if (digits.length < 10) return '—'
  return `XXXXXX${digits.slice(6)}`
}

export function maskAccount(accountNumber) {
  const value = String(accountNumber || '')
  if (value.length < 4) return '—'
  return `XXXX XXXX ${value.slice(-4)}`
}

export function toISODate(value) {
  const date = toDate(value) || new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function isToday(value) {
  return toISODate(value) === toISODate(new Date())
}

/** "Today", "Tomorrow", or "12 Oct" - how a date is actually spoken. */
export function relativeDay(value) {
  const target = toISODate(value)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (target === toISODate(today)) return translate('format.today')
  if (target === toISODate(tomorrow)) return translate('format.tomorrow')
  return formatShortDate(value)
}

export function daysBetween(from, to) {
  const a = toDate(from)
  const b = toDate(to)
  if (!a || !b) return 0
  return Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / 86400000)
}

export function distanceLabel(km) {
  if (km === null || km === undefined) return '—'
  return `${formatNumber(km, km < 10 ? 1 : 0)} km away`
}
