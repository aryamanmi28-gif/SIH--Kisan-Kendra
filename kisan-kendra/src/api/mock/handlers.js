import { ApiError } from '../client.js'
import { readStorage, STORAGE_KEYS } from '../../utils/storage.js'
import { toISODate } from '../../utils/format.js'
import {
  CROPS,
  BOOKING_STATUS,
  PROCUREMENT_STATUS,
  PAYMENT_STATUS,
} from '../../utils/constants.js'
import {
  getDb,
  persist,
  getFarmer,
  nextId,
  makeReference,
  liveNowServing,
  centreLoad,
  centreStatus,
} from './db.js'

import { DEMO_CREDENTIALS } from '../config.js'

/** OTP accepted by the mock backend. Shown on the login screen in mock mode. */
const DEMO_OTP = DEMO_CREDENTIALS.otp

const delay = (ms = 200 + Math.random() * 350) => new Promise((resolve) => setTimeout(resolve, ms))

function fail(status, message, code = 'error', fieldErrors = null) {
  throw new ApiError(message, { status, code, fieldErrors })
}

function currentMobile() {
  const token = readStorage(STORAGE_KEYS.TOKEN)
  if (!token || !String(token).startsWith('mock.')) return null
  return String(token).slice(5)
}

function requireFarmer() {
  const mobile = currentMobile()
  const farmer = mobile ? getFarmer(mobile) : null
  if (!farmer) fail(401, 'Your session has ended. Please log in again.', 'unauthenticated')
  return farmer
}

function findCentre(centreId) {
  const centre = getDb().centres.find((item) => item.id === centreId)
  if (!centre) fail(404, 'This procurement centre is no longer listed.', 'not_found')
  return centre
}

const clone = (value) => JSON.parse(JSON.stringify(value))

// ---------------------------------------------------------------------------
// Simulation: moves checked-in farmers through the counter, then through
// procurement and payment, using the accelerated centre clock.
// ---------------------------------------------------------------------------

const PROCUREMENT_WEIGH_MS = 25000
const PROCUREMENT_QUALITY_MS = 55000
const PAYMENT_INITIATED_MS = 30000
const PAYMENT_DBT_MS = 80000
const PAYMENT_CREDITED_MS = 150000

function completeProcurement(farmer, procurement) {
  const crop = CROPS.find((item) => item.code === procurement.cropCode) || CROPS[0]
  const accepted = procurement.weighedQuintal
  const gross = Math.round(accepted * crop.msp)
  const mandiFee = Math.round(gross * 0.005)

  procurement.acceptedQuintal = accepted
  procurement.rejectedQuintal = 0
  procurement.grade = 'FAQ'
  procurement.mspPerQuintal = crop.msp
  procurement.grossAmount = gross
  procurement.deductions = [{ label: 'Mandi fee (0.5%)', amount: mandiFee }]
  procurement.netAmount = gross - mandiFee
  procurement.status = PROCUREMENT_STATUS.COMPLETED
  procurement.completedAt = new Date().toISOString()

  const expected = new Date()
  expected.setDate(expected.getDate() + 3)

  farmer.payments.unshift({
    id: nextId('payment', 'PAY'),
    procurementId: procurement.id,
    bookingId: procurement.bookingId,
    cropName: procurement.cropName,
    quantityQuintal: accepted,
    amount: procurement.netAmount,
    status: PAYMENT_STATUS.PROCUREMENT_COMPLETED,
    utr: null,
    bankName: `${farmer.profile.bank?.bankName || 'Bank'}, ${farmer.profile.bank?.branch || ''}`.trim(),
    accountNumber: farmer.profile.bank?.accountNumber || '',
    expectedBy: toISODate(expected),
    stages: [{ key: 'procurement_completed', at: procurement.completedAt }],
  })
}

function advancePayment(payment) {
  const startedAt = new Date(payment.stages[0].at).getTime()
  const elapsed = Date.now() - startedAt
  const push = (key, status) => {
    if (!payment.stages.some((stage) => stage.key === key)) {
      payment.stages.push({ key, at: new Date().toISOString() })
      payment.status = status
    }
  }
  if (elapsed > PAYMENT_INITIATED_MS) push('payment_initiated', PAYMENT_STATUS.PAYMENT_INITIATED)
  if (elapsed > PAYMENT_DBT_MS) push('dbt_processing', PAYMENT_STATUS.DBT_PROCESSING)
  if (elapsed > PAYMENT_CREDITED_MS) {
    if (!payment.utr) payment.utr = `SBIN${Math.floor(400000000000 + Math.random() * 99999999999)}`
    push('payment_credited', PAYMENT_STATUS.PAYMENT_CREDITED)
  }
}

function advanceSimulation() {
  const database = getDb()
  const today = toISODate(new Date())
  let changed = false

  Object.values(database.farmers).forEach((farmer) => {
    farmer.bookings.forEach((booking) => {
      if (booking.status === BOOKING_STATUS.BOOKED && booking.date < today) {
        booking.status = BOOKING_STATUS.MISSED
        changed = true
        return
      }
      if (booking.status !== BOOKING_STATUS.CHECKED_IN && booking.status !== BOOKING_STATUS.SERVING) {
        return
      }

      const centre = database.centres.find((item) => item.id === booking.centreId)
      if (!centre) return
      const nowServing = liveNowServing(centre)

      if (nowServing === booking.tokenNumber && booking.status !== BOOKING_STATUS.SERVING) {
        booking.status = BOOKING_STATUS.SERVING
        changed = true
      }

      if (nowServing > booking.tokenNumber) {
        booking.status = BOOKING_STATUS.COMPLETED
        booking.completedAt = new Date().toISOString()
        const lot = farmer.crops.find((item) => item.id === booking.lotId)
        if (lot) lot.status = 'procured'
        if (!farmer.procurements.some((item) => item.bookingId === booking.id)) {
          farmer.procurements.unshift({
            id: nextId('procurement', 'PRC'),
            bookingId: booking.id,
            centreId: booking.centreId,
            centreName: booking.centreName,
            lotId: booking.lotId,
            cropCode: booking.cropCode,
            cropName: booking.cropName,
            variety: booking.variety,
            date: booking.date,
            gateEntryAt: booking.checkedInAt,
            weighedQuintal: booking.quantityQuintal,
            acceptedQuintal: null,
            rejectedQuintal: null,
            moisturePercent: lot?.moisturePercent ?? null,
            grade: null,
            mspPerQuintal: null,
            grossAmount: null,
            deductions: [],
            netAmount: null,
            ackSlipNumber: `ACK/HR/2026/0${booking.id.replace('BKG-', '')}`,
            status: PROCUREMENT_STATUS.WEIGHING,
            startedAt: new Date().toISOString(),
            completedAt: null,
            officer: centre.inchargeName,
          })
        }
        changed = true
      }
    })

    farmer.procurements.forEach((procurement) => {
      if (procurement.status === PROCUREMENT_STATUS.COMPLETED || !procurement.startedAt) return
      const elapsed = Date.now() - new Date(procurement.startedAt).getTime()
      if (elapsed > PROCUREMENT_QUALITY_MS) {
        completeProcurement(farmer, procurement)
        changed = true
      } else if (elapsed > PROCUREMENT_WEIGH_MS && procurement.status !== PROCUREMENT_STATUS.QUALITY_CHECK) {
        procurement.status = PROCUREMENT_STATUS.QUALITY_CHECK
        changed = true
      }
    })

    farmer.payments.forEach((payment) => {
      if (payment.status === PAYMENT_STATUS.PAYMENT_CREDITED) return
      const before = payment.status
      advancePayment(payment)
      if (before !== payment.status) changed = true
    })
  })

  if (changed) persist()
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function requestOtp({ mobile }) {
  await delay()
  const farmer = getFarmer(mobile)
  if (!farmer) {
    fail(404, 'No account found for this mobile number. Please register first.', 'not_registered')
  }
  return { mobile, expiresInSeconds: 120, message: `OTP sent to ${mobile}` }
}

export async function verifyOtp({ mobile, otp }) {
  await delay()
  if (otp !== DEMO_OTP) {
    fail(400, 'The OTP you entered is incorrect. Please check and try again.', 'invalid_otp', {
      otp: 'Incorrect OTP',
    })
  }
  const farmer = getFarmer(mobile)
  if (!farmer) fail(404, 'No account found for this mobile number.', 'not_registered')
  return { token: `mock.${mobile}`, user: clone(farmer.profile) }
}

export async function register(payload) {
  await delay(600)
  const database = getDb()
  if (database.farmers[payload.mobile]) {
    fail(409, 'This mobile number is already registered. Please log in instead.', 'already_registered', {
      mobile: 'Already registered',
    })
  }

  const profile = {
    id: nextId('farmer', 'FRM'),
    name: payload.name.trim(),
    mobile: payload.mobile,
    farmerId: payload.farmerId?.trim() || null,
    aadhaarLast4: String(payload.aadhaar || '').slice(-4) || null,
    village: payload.village.trim(),
    tehsil: payload.tehsil?.trim() || '',
    district: payload.district.trim(),
    state: payload.state,
    pincode: payload.pincode,
    landAcres: Number(payload.landAcres),
    landRecordId: payload.landRecordId?.trim() || '',
    category: Number(payload.landAcres) <= 2 ? 'Small farmer' : 'Other farmer',
    bank: {
      accountNumber: payload.accountNumber,
      ifsc: String(payload.ifsc).toUpperCase(),
      bankName: payload.bankName.trim(),
      branch: payload.branch?.trim() || '',
      aadhaarSeeded: Boolean(payload.aadhaarSeeded),
    },
    registeredAt: new Date().toISOString(),
  }

  database.farmers[payload.mobile] = {
    profile,
    crops: [],
    bookings: [],
    procurements: [],
    payments: [],
  }
  persist()
  return { token: `mock.${payload.mobile}`, user: clone(profile) }
}

export async function getCurrentUser() {
  await delay(120)
  const farmer = requireFarmer()
  return clone(farmer.profile)
}

export async function logout() {
  await delay(80)
  return { detail: 'Logged out' }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateProfile(payload) {
  await delay()
  const farmer = requireFarmer()
  Object.assign(farmer.profile, {
    name: payload.name?.trim() ?? farmer.profile.name,
    village: payload.village?.trim() ?? farmer.profile.village,
    tehsil: payload.tehsil?.trim() ?? farmer.profile.tehsil,
    district: payload.district?.trim() ?? farmer.profile.district,
    state: payload.state ?? farmer.profile.state,
    pincode: payload.pincode ?? farmer.profile.pincode,
    landAcres: payload.landAcres !== undefined ? Number(payload.landAcres) : farmer.profile.landAcres,
    landRecordId: payload.landRecordId ?? farmer.profile.landRecordId,
  })
  persist()
  return clone(farmer.profile)
}

export async function updateBankAccount(payload) {
  await delay()
  const farmer = requireFarmer()
  farmer.profile.bank = {
    accountNumber: payload.accountNumber,
    ifsc: String(payload.ifsc).toUpperCase(),
    bankName: payload.bankName.trim(),
    branch: payload.branch?.trim() || '',
    aadhaarSeeded: Boolean(payload.aadhaarSeeded),
  }
  persist()
  return clone(farmer.profile)
}

// ---------------------------------------------------------------------------
// Crop lots
// ---------------------------------------------------------------------------

export async function listCrops() {
  await delay()
  advanceSimulation()
  const farmer = requireFarmer()
  return clone(farmer.crops)
}

export async function createCrop(payload) {
  await delay(500)
  const farmer = requireFarmer()
  const crop = CROPS.find((item) => item.code === payload.cropCode)
  if (!crop) fail(400, 'Select a crop from the list.', 'invalid_crop', { cropCode: 'Select a crop' })

  const lot = {
    id: nextId('lot', 'LOT'),
    cropCode: crop.code,
    cropName: crop.name,
    variety: payload.variety,
    quantityQuintal: Number(payload.quantityQuintal),
    bags: payload.bags ? Number(payload.bags) : null,
    harvestDate: payload.harvestDate,
    moisturePercent: Number(payload.moisturePercent),
    storage: payload.storage,
    notes: payload.notes?.trim() || '',
    status: 'ready',
    bookingId: null,
    createdAt: new Date().toISOString(),
  }
  farmer.crops.unshift(lot)
  persist()
  return clone(lot)
}

export async function updateCrop(lotId, payload) {
  await delay()
  const farmer = requireFarmer()
  const lot = farmer.crops.find((item) => item.id === lotId)
  if (!lot) fail(404, 'This crop entry was not found.', 'not_found')
  if (lot.status !== 'ready') {
    fail(409, 'This lot already has a slot booked. Cancel the booking before editing it.', 'lot_locked')
  }
  Object.assign(lot, {
    variety: payload.variety ?? lot.variety,
    quantityQuintal: payload.quantityQuintal !== undefined ? Number(payload.quantityQuintal) : lot.quantityQuintal,
    bags: payload.bags !== undefined ? Number(payload.bags) : lot.bags,
    harvestDate: payload.harvestDate ?? lot.harvestDate,
    moisturePercent: payload.moisturePercent !== undefined ? Number(payload.moisturePercent) : lot.moisturePercent,
    storage: payload.storage ?? lot.storage,
    notes: payload.notes ?? lot.notes,
  })
  persist()
  return clone(lot)
}

export async function deleteCrop(lotId) {
  await delay()
  const farmer = requireFarmer()
  const lot = farmer.crops.find((item) => item.id === lotId)
  if (!lot) fail(404, 'This crop entry was not found.', 'not_found')
  if (lot.status !== 'ready') {
    fail(409, 'This lot is linked to a booking and cannot be removed.', 'lot_locked')
  }
  farmer.crops = farmer.crops.filter((item) => item.id !== lotId)
  persist()
  return { detail: 'Crop entry removed' }
}

// ---------------------------------------------------------------------------
// Centres and slots
// ---------------------------------------------------------------------------

function serialiseCentre(centre) {
  const load = centreLoad(centre)
  const nowServing = liveNowServing(centre)
  const waiting = Math.max(0, centre.queue.lastIssuedToken - nowServing)
  return {
    ...clone(centre),
    status: centreStatus(centre),
    load,
    queue: {
      nowServing,
      lastIssuedToken: centre.queue.lastIssuedToken,
      waiting,
      avgServiceMinutes: centre.avgServiceMinutes,
      estimatedWaitMinutes: waiting * centre.avgServiceMinutes,
    },
  }
}

export async function listCentres({ crop, search, sort = 'distance' } = {}) {
  await delay()
  advanceSimulation()
  let centres = getDb().centres.map(serialiseCentre)

  if (crop) centres = centres.filter((centre) => centre.cropsAccepted.includes(crop))
  if (search) {
    const term = search.trim().toLowerCase()
    centres = centres.filter((centre) =>
      [centre.name, centre.village, centre.district, centre.pincode, centre.type]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }

  const sorters = {
    distance: (a, b) => a.distanceKm - b.distanceKm,
    wait: (a, b) => a.queue.estimatedWaitMinutes - b.queue.estimatedWaitMinutes,
    capacity: (a, b) => b.load.remainingQuintal - a.load.remainingQuintal,
  }
  centres.sort(sorters[sort] || sorters.distance)
  return centres
}

export async function getCentre(centreId) {
  await delay()
  advanceSimulation()
  return serialiseCentre(findCentre(centreId))
}

export async function getCentreQueue(centreId) {
  await delay(150)
  advanceSimulation()
  return serialiseCentre(findCentre(centreId)).queue
}

export async function getCentreSlots(centreId, { date } = {}) {
  await delay()
  const centre = findCentre(centreId)
  const database = getDb()
  const today = toISODate(new Date())
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  return database.slots
    .filter((slot) => slot.centreId === centreId && (!date || slot.date === date) && slot.date >= today)
    .map((slot) => {
      const [hour, minute] = slot.startTime.split(':').map(Number)
      const startsInMinutes = hour * 60 + minute - nowMinutes
      // A slot closes for booking 30 minutes before it starts.
      const tooLate = slot.date === today && startsInMinutes < 30
      const remaining = Math.max(0, slot.capacity - slot.booked)
      return {
        ...clone(slot),
        remaining,
        available: remaining > 0 && !tooLate && !(centre.closedToday && slot.date === today),
        unavailableReason: centre.closedToday && slot.date === today
          ? 'Centre closed'
          : tooLate
            ? 'Booking closed'
            : remaining === 0
              ? 'Slot full'
              : null,
      }
    })
}

// ---------------------------------------------------------------------------
// Bookings, tokens and queue
// ---------------------------------------------------------------------------

function nextTokenNumber(centre, date) {
  const database = getDb()
  database.tokenSeq = database.tokenSeq || {}
  const key = `${centre.id}:${date}`
  if (database.tokenSeq[key] === undefined) {
    const issuedToday = date === toISODate(new Date()) ? centre.queue.lastIssuedToken : 0
    database.tokenSeq[key] = issuedToday
  }
  database.tokenSeq[key] += 1
  return database.tokenSeq[key]
}

export async function listBookings() {
  await delay()
  advanceSimulation()
  const farmer = requireFarmer()
  return clone(
    [...farmer.bookings].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.tokenNumber - a.tokenNumber)),
  )
}

export async function getBooking(bookingId) {
  await delay(180)
  advanceSimulation()
  const farmer = requireFarmer()
  const booking = farmer.bookings.find((item) => item.id === bookingId)
  if (!booking) fail(404, 'This booking was not found.', 'not_found')
  return clone(booking)
}

export async function createBooking(payload) {
  await delay(700)
  const farmer = requireFarmer()
  const centre = findCentre(payload.centreId)
  const database = getDb()

  const lot = farmer.crops.find((item) => item.id === payload.lotId)
  if (!lot) fail(400, 'Select one of your crop entries before booking.', 'invalid_lot', { lotId: 'Select a crop lot' })

  // Duplicate protection, mirroring the constraint the API will enforce.
  const activeStatuses = [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVING]
  const lotAlreadyBooked = farmer.bookings.find(
    (booking) => booking.lotId === payload.lotId && activeStatuses.includes(booking.status),
  )
  if (lotAlreadyBooked) {
    fail(409, `You already have token #${lotAlreadyBooked.tokenNumber} for this crop lot.`, 'duplicate_booking', {
      lotId: 'This lot already has a slot',
    })
  }

  const sameDayBooking = farmer.bookings.find(
    (booking) =>
      booking.centreId === payload.centreId &&
      booking.date === payload.date &&
      activeStatuses.includes(booking.status),
  )
  if (sameDayBooking) {
    fail(409, 'You already have a slot at this centre on the same date.', 'duplicate_booking')
  }

  const slot = database.slots.find(
    (item) => item.centreId === payload.centreId && item.date === payload.date && item.startTime === payload.startTime,
  )
  if (!slot) fail(400, 'That time slot is no longer offered. Please pick another one.', 'invalid_slot')
  if (slot.booked >= slot.capacity) {
    fail(409, 'This slot filled up while you were booking. Please choose another time.', 'slot_full')
  }
  if (Number(payload.quantityQuintal) > centreLoad(centre).remainingQuintal) {
    fail(409, 'The centre does not have enough capacity left today for this quantity.', 'capacity_exceeded')
  }

  slot.booked += 1
  const booking = {
    id: nextId('booking', 'BKG'),
    reference: makeReference(),
    centreId: centre.id,
    centreName: centre.name,
    centreAddress: centre.address,
    lotId: lot.id,
    cropCode: lot.cropCode,
    cropName: lot.cropName,
    variety: lot.variety,
    quantityQuintal: Number(payload.quantityQuintal ?? lot.quantityQuintal),
    date: payload.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    tokenNumber: nextTokenNumber(centre, payload.date),
    status: BOOKING_STATUS.BOOKED,
    createdAt: new Date().toISOString(),
    checkedInAt: null,
    completedAt: null,
  }
  lot.status = 'booked'
  lot.bookingId = booking.id
  farmer.bookings.unshift(booking)
  persist()
  return clone(booking)
}

export async function cancelBooking(bookingId, { reason } = {}) {
  await delay(400)
  const farmer = requireFarmer()
  const booking = farmer.bookings.find((item) => item.id === bookingId)
  if (!booking) fail(404, 'This booking was not found.', 'not_found')
  if (booking.status === BOOKING_STATUS.COMPLETED) {
    fail(409, 'Procurement is already done for this token.', 'already_completed')
  }
  if (booking.status === BOOKING_STATUS.CANCELLED) return clone(booking)

  booking.status = BOOKING_STATUS.CANCELLED
  booking.cancelledAt = new Date().toISOString()
  booking.cancelReason = reason || ''

  const slot = getDb().slots.find(
    (item) =>
      item.centreId === booking.centreId && item.date === booking.date && item.startTime === booking.startTime,
  )
  if (slot) slot.booked = Math.max(0, slot.booked - 1)

  const lot = farmer.crops.find((item) => item.id === booking.lotId)
  if (lot && lot.status === 'booked') {
    lot.status = 'ready'
    lot.bookingId = null
  }
  persist()
  return clone(booking)
}

export async function checkIn(bookingId) {
  await delay(500)
  const farmer = requireFarmer()
  const booking = farmer.bookings.find((item) => item.id === bookingId)
  if (!booking) fail(404, 'This booking was not found.', 'not_found')
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    fail(409, 'This booking was cancelled. Book a new slot to bring your crop.', 'cancelled')
  }
  if (booking.status !== BOOKING_STATUS.BOOKED) {
    fail(409, 'You have already checked in for this token.', 'already_checked_in')
  }
  if (booking.date !== toISODate(new Date())) {
    fail(409, 'Check-in opens only on the day of your slot.', 'not_slot_day')
  }

  booking.status = BOOKING_STATUS.CHECKED_IN
  booking.checkedInAt = new Date().toISOString()
  persist()
  return clone(booking)
}

export async function getQueuePosition(bookingId) {
  await delay(150)
  advanceSimulation()
  const farmer = requireFarmer()
  const booking = farmer.bookings.find((item) => item.id === bookingId)
  if (!booking) fail(404, 'This booking was not found.', 'not_found')
  const centre = findCentre(booking.centreId)
  const nowServing = liveNowServing(centre)
  const peopleAhead = Math.max(0, booking.tokenNumber - nowServing)

  return {
    bookingId: booking.id,
    tokenNumber: booking.tokenNumber,
    status: booking.status,
    nowServing,
    peopleAhead,
    lastIssuedToken: Math.max(centre.queue.lastIssuedToken, booking.tokenNumber),
    avgServiceMinutes: centre.avgServiceMinutes,
    estimatedWaitMinutes: peopleAhead * centre.avgServiceMinutes,
    counters: centre.counters,
    centreId: centre.id,
    centreName: centre.name,
    centreAddress: centre.address,
    inchargeMobile: centre.inchargeMobile,
    updatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Procurement and payments
// ---------------------------------------------------------------------------

export async function listProcurements() {
  await delay()
  advanceSimulation()
  const farmer = requireFarmer()
  return clone(farmer.procurements)
}

export async function getProcurement(procurementId) {
  await delay(150)
  advanceSimulation()
  const farmer = requireFarmer()
  const procurement = farmer.procurements.find((item) => item.id === procurementId)
  if (!procurement) fail(404, 'This procurement record was not found.', 'not_found')
  return clone(procurement)
}

export async function listPayments() {
  await delay()
  advanceSimulation()
  const farmer = requireFarmer()
  return clone(farmer.payments)
}

export async function getPayment(paymentId) {
  await delay(150)
  advanceSimulation()
  const farmer = requireFarmer()
  const payment = farmer.payments.find((item) => item.id === paymentId)
  if (!payment) fail(404, 'This payment record was not found.', 'not_found')
  return clone(payment)
}

export async function getDashboard() {
  await delay(250)
  advanceSimulation()
  const farmer = requireFarmer()
  const activeStatuses = [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVING]
  const activeBooking = farmer.bookings.find((booking) => activeStatuses.includes(booking.status)) || null
  const pendingPayments = farmer.payments.filter((payment) => payment.status !== PAYMENT_STATUS.PAYMENT_CREDITED)
  const creditedTotal = farmer.payments
    .filter((payment) => payment.status === PAYMENT_STATUS.PAYMENT_CREDITED)
    .reduce((sum, payment) => sum + payment.amount, 0)

  return {
    profile: clone(farmer.profile),
    activeBooking: clone(activeBooking),
    readyLots: farmer.crops.filter((lot) => lot.status === 'ready').length,
    totalLots: farmer.crops.length,
    quantityAwaiting: farmer.crops
      .filter((lot) => lot.status !== 'procured')
      .reduce((sum, lot) => sum + lot.quantityQuintal, 0),
    pendingPaymentCount: pendingPayments.length,
    pendingPaymentAmount: pendingPayments.reduce((sum, payment) => sum + payment.amount, 0),
    creditedTotal,
    recentPayment: clone(farmer.payments[0] || null),
    procurementCount: farmer.procurements.length,
  }
}

// Emergency slot swap is a live-backend-only feature (auto-approval, the
// 2-per-slot cap, and the bump logic all live in Django). Not worth
// re-implementing against this mock data layer's disconnected shape.
export async function emergencyRequest() {
  await delay(300)
  fail(501, 'Emergency slot requests are not available in demo/mock mode.', 'not_implemented')
}

// The officer centre desk (CentrePortal) is a live-backend-only feature: it
// has no farmer-session concept and nothing in this mock data layer models a
// centre's daily booking list or queue actions. These stubs exist only so
// `route()` always has a valid mock-side reference; they fail clearly rather
// than the UI hitting an undefined function if mock mode is ever turned on.
export async function officerLogin() {
  await delay(300)
  fail(501, 'Officer sign-in is not available in demo/mock mode.', 'not_implemented')
}

export async function officerList() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}

export async function dailySummary() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}

export async function callNext() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}

export async function serve() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}

export async function complete() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}

export async function skip() {
  await delay(300)
  fail(501, 'Officer centre desk is not available in demo/mock mode.', 'not_implemented')
}
