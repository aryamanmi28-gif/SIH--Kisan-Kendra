import { readStorage, writeStorage, STORAGE_KEYS } from '../../utils/storage.js'
import { toISODate } from '../../utils/format.js'
import { CROPS, BOOKING_STATUS, PROCUREMENT_STATUS, PAYMENT_STATUS } from '../../utils/constants.js'

/**
 * In-browser stand-in for the Django + MySQL backend.
 *
 * It exists so the whole farmer journey can be walked end to end before the API
 * is ready. Nothing here should leak into components: pages talk to the api/
 * modules only.
 *
 * The centre clock runs SIM_SPEED times faster than real time, so a queue that
 * moves one farmer every 9 minutes visibly advances every ~45 seconds while you
 * are looking at the tracker.
 */
export const SIM_SPEED = 12
const DB_VERSION = 3

const CENTRE_SEED = [
  {
    id: 'PC-KRN-01',
    name: 'Nilokheri Regulated Mandi',
    type: 'Regulated mandi',
    address: 'Grain Market Road, Nilokheri, Karnal',
    village: 'Nilokheri',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132117',
    distanceKm: 4.2,
    inchargeName: 'Sh. Devender Singh',
    inchargeMobile: '9812345601',
    cropsAccepted: ['paddy_common', 'paddy_grade_a', 'wheat', 'mustard'],
    dailyCapacityQuintal: 1800,
    procuredTodayQuintal: 640,
    counters: 3,
    openTime: '09:00',
    closeTime: '17:00',
    avgServiceMinutes: 9,
    facilities: ['Weighbridge', 'Drying yard', 'Drinking water', 'Shaded waiting area', 'Toilets'],
    baseServing: 7,
    lastIssuedToken: 19,
  },
  {
    id: 'PC-KRN-02',
    name: 'Taraori PACS Procurement Centre',
    type: 'Cooperative society (PACS)',
    address: 'Near Bus Stand, Taraori, Karnal',
    village: 'Taraori',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132116',
    distanceKm: 11.8,
    inchargeName: 'Smt. Kavita Rani',
    inchargeMobile: '9812345602',
    cropsAccepted: ['paddy_common', 'wheat'],
    dailyCapacityQuintal: 900,
    procuredTodayQuintal: 870,
    counters: 1,
    openTime: '09:00',
    closeTime: '16:00',
    avgServiceMinutes: 13,
    facilities: ['Weighbridge', 'Drinking water', 'Toilets'],
    baseServing: 22,
    lastIssuedToken: 34,
  },
  {
    id: 'PC-KRN-03',
    name: 'Indri Warehouse Procurement Point',
    type: 'State warehouse',
    address: 'Warehousing Complex, Indri, Karnal',
    village: 'Indri',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132041',
    distanceKm: 18.4,
    inchargeName: 'Sh. Manoj Kumar',
    inchargeMobile: '9812345603',
    cropsAccepted: ['wheat', 'gram', 'mustard', 'maize'],
    dailyCapacityQuintal: 1200,
    procuredTodayQuintal: 210,
    counters: 2,
    openTime: '08:30',
    closeTime: '17:30',
    avgServiceMinutes: 8,
    facilities: ['Weighbridge', 'Covered godown', 'Drinking water', 'Parking for trolleys'],
    baseServing: 4,
    lastIssuedToken: 9,
  },
  {
    id: 'PC-KRN-04',
    name: 'Gharaunda Grain Market',
    type: 'Regulated mandi',
    address: 'Mandi Gate 2, GT Road, Gharaunda',
    village: 'Gharaunda',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132114',
    distanceKm: 21.6,
    inchargeName: 'Sh. Rajbir Singh',
    inchargeMobile: '9812345604',
    cropsAccepted: ['paddy_common', 'paddy_grade_a', 'bajra', 'wheat'],
    dailyCapacityQuintal: 2200,
    procuredTodayQuintal: 1180,
    counters: 4,
    openTime: '09:00',
    closeTime: '18:00',
    avgServiceMinutes: 7,
    facilities: ['Weighbridge', 'Drying yard', 'Canteen', 'Drinking water', 'Toilets', 'Night shelter'],
    baseServing: 31,
    lastIssuedToken: 41,
  },
  {
    id: 'PC-KTL-05',
    name: 'Assandh Sub-Yard',
    type: 'Sub-yard',
    address: 'Kaithal Road, Assandh',
    village: 'Assandh',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132039',
    distanceKm: 34.9,
    inchargeName: 'Sh. Satpal',
    inchargeMobile: '9812345605',
    cropsAccepted: ['paddy_common', 'wheat', 'gram'],
    dailyCapacityQuintal: 700,
    procuredTodayQuintal: 0,
    counters: 1,
    openTime: '09:00',
    closeTime: '16:00',
    avgServiceMinutes: 12,
    facilities: ['Weighbridge', 'Drinking water'],
    baseServing: 0,
    lastIssuedToken: 0,
    closedToday: true,
    closedReason: 'Closed today for godown stock verification. Booking reopens tomorrow.',
  },
  {
    id: 'PC-KTL-06',
    name: 'Munak Cooperative Centre',
    type: 'Cooperative society (PACS)',
    address: 'Village Munak, Block Nissing',
    village: 'Munak',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132024',
    distanceKm: 27.3,
    inchargeName: 'Smt. Sunita Devi',
    inchargeMobile: '9812345606',
    cropsAccepted: ['paddy_common', 'mustard', 'gram'],
    dailyCapacityQuintal: 800,
    procuredTodayQuintal: 305,
    counters: 2,
    openTime: '09:00',
    closeTime: '17:00',
    avgServiceMinutes: 10,
    facilities: ['Weighbridge', 'Drinking water', 'Shaded waiting area'],
    baseServing: 11,
    lastIssuedToken: 16,
  },
]

const SLOT_TEMPLATE = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
]

const DAYS_AHEAD = 7

function dateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Small deterministic PRNG so mock capacity numbers stay stable per slot. */
function seededInt(seed, min, max) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const value = Math.abs(Math.sin(hash)) * 10000
  return min + Math.floor((value % 1) * (max - min + 1))
}

function buildSlots(centres) {
  const slots = []
  centres.forEach((centre) => {
    for (let day = 0; day < DAYS_AHEAD; day += 1) {
      const date = dateOffset(day)
      SLOT_TEMPLATE.forEach((template) => {
        if (centre.closeTime <= template.startTime) return
        const id = `${centre.id}-${date}-${template.startTime.replace(':', '')}`
        const capacity = centre.counters * seededInt(`${id}-cap`, 5, 8)
        const filled = centre.closedToday && day === 0 ? capacity : seededInt(`${id}-fill`, 0, capacity)
        slots.push({
          id,
          centreId: centre.id,
          date,
          startTime: template.startTime,
          endTime: template.endTime,
          capacity,
          booked: Math.min(filled, capacity),
        })
      })
    }
  })
  return slots
}

function seedDemoFarmer() {
  const today = toISODate(new Date())
  const paddy = CROPS.find((crop) => crop.code === 'paddy_common')
  const wheat = CROPS.find((crop) => crop.code === 'wheat')

  const pastDate = dateOffset(-9)
  const procuredQuintal = 62
  const grossAmount = Math.round(procuredQuintal * wheat.msp)
  const mandiFee = Math.round(grossAmount * 0.005)
  const netAmount = grossAmount - mandiFee

  const activeLot = {
    id: 'LOT-100412',
    cropCode: paddy.code,
    cropName: paddy.name,
    variety: 'Swarna',
    quantityQuintal: 48,
    bags: 120,
    harvestDate: dateOffset(-5),
    moisturePercent: 15.4,
    storage: 'Own godown',
    notes: 'Cleaned and dried in the yard for two days.',
    status: 'booked',
    bookingId: 'BKG-100237',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  }

  const soldLot = {
    id: 'LOT-100388',
    cropCode: wheat.code,
    cropName: wheat.name,
    variety: 'HD-3086',
    quantityQuintal: 62,
    bags: 155,
    harvestDate: dateOffset(-24),
    moisturePercent: 11.8,
    storage: 'Rented godown',
    notes: '',
    status: 'procured',
    bookingId: 'BKG-100119',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  }

  const activeBooking = {
    id: 'BKG-100237',
    reference: 'KK7F3D2A',
    centreId: 'PC-KRN-01',
    centreName: 'Nilokheri Regulated Mandi',
    centreAddress: 'Grain Market Road, Nilokheri, Karnal',
    lotId: activeLot.id,
    cropCode: paddy.code,
    cropName: paddy.name,
    variety: 'Swarna',
    quantityQuintal: 48,
    date: today,
    startTime: '11:00',
    endTime: '12:00',
    tokenNumber: 12,
    status: BOOKING_STATUS.BOOKED,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    checkedInAt: null,
    completedAt: null,
  }

  const pastBooking = {
    id: 'BKG-100119',
    reference: 'KK3B9C41',
    centreId: 'PC-KRN-03',
    centreName: 'Indri Warehouse Procurement Point',
    centreAddress: 'Warehousing Complex, Indri, Karnal',
    lotId: soldLot.id,
    cropCode: wheat.code,
    cropName: wheat.name,
    variety: 'HD-3086',
    quantityQuintal: 62,
    date: pastDate,
    startTime: '10:00',
    endTime: '11:00',
    tokenNumber: 6,
    status: BOOKING_STATUS.COMPLETED,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    checkedInAt: `${pastDate}T09:48:00`,
    completedAt: `${pastDate}T10:36:00`,
  }

  const procurement = {
    id: 'PRC-100119',
    bookingId: pastBooking.id,
    centreId: pastBooking.centreId,
    centreName: pastBooking.centreName,
    lotId: soldLot.id,
    cropName: wheat.name,
    variety: 'HD-3086',
    date: pastDate,
    gateEntryAt: `${pastDate}T09:48:00`,
    weighedQuintal: 62,
    acceptedQuintal: 62,
    rejectedQuintal: 0,
    moisturePercent: 11.8,
    grade: 'FAQ',
    mspPerQuintal: wheat.msp,
    grossAmount,
    deductions: [{ label: 'Mandi fee (0.5%)', amount: mandiFee }],
    netAmount,
    ackSlipNumber: 'ACK/HR/2026/0100119',
    status: PROCUREMENT_STATUS.COMPLETED,
    completedAt: `${pastDate}T10:36:00`,
    officer: 'Sh. Manoj Kumar',
  }

  const payment = {
    id: 'PAY-100119',
    procurementId: procurement.id,
    bookingId: pastBooking.id,
    cropName: wheat.name,
    quantityQuintal: 62,
    amount: netAmount,
    status: PAYMENT_STATUS.PAYMENT_CREDITED,
    utr: 'SBIN426253910481',
    bankName: 'State Bank of India, Nilokheri',
    accountNumber: '30219845761',
    expectedBy: dateOffset(-6),
    stages: [
      { key: 'procurement_completed', at: `${pastDate}T10:36:00` },
      { key: 'payment_initiated', at: `${pastDate}T16:10:00` },
      { key: 'dbt_processing', at: `${dateOffset(-8)}T11:22:00` },
      { key: 'payment_credited', at: `${dateOffset(-7)}T09:05:00` },
    ],
  }

  return {
    profile: {
      id: 'FRM-100234',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      farmerId: 'HR-KRN-2019-100234',
      aadhaarLast4: '4417',
      village: 'Nilokheri',
      tehsil: 'Nilokheri',
      district: 'Karnal',
      state: 'Haryana',
      pincode: '132117',
      landAcres: 6.5,
      landRecordId: 'KRN/NLK/482/7',
      category: 'Small farmer',
      bank: {
        accountNumber: '30219845761',
        ifsc: 'SBIN0001234',
        bankName: 'State Bank of India',
        branch: 'Nilokheri',
        aadhaarSeeded: true,
      },
      registeredAt: new Date(Date.now() - 400 * 86400000).toISOString(),
    },
    crops: [activeLot, soldLot],
    bookings: [activeBooking, pastBooking],
    procurements: [procurement],
    payments: [payment],
  }
}

function createDatabase() {
  const centres = CENTRE_SEED.map((centre) => ({
    ...centre,
    queue: {
      date: toISODate(new Date()),
      baseServing: centre.baseServing,
      lastIssuedToken: centre.lastIssuedToken,
      openedAt: new Date().toISOString(),
    },
  }))

  const demo = seedDemoFarmer()
  const slots = buildSlots(centres)

  // The demo farmer's booking must occupy a real slot.
  const bookedSlot = slots.find(
    (slot) =>
      slot.centreId === 'PC-KRN-01' &&
      slot.date === demo.bookings[0].date &&
      slot.startTime === demo.bookings[0].startTime,
  )
  if (bookedSlot) bookedSlot.booked = Math.min(bookedSlot.booked + 1, bookedSlot.capacity)

  return {
    version: DB_VERSION,
    generatedFor: toISODate(new Date()),
    centres,
    slots,
    farmers: { [demo.profile.mobile]: demo },
    counters: { farmer: 100235, lot: 100413, booking: 100238, procurement: 100238, payment: 100238 },
  }
}

let db = null

function refreshSlotWindow(database) {
  const today = toISODate(new Date())
  if (database.generatedFor === today) return database

  database.generatedFor = today
  database.slots = buildSlots(database.centres)
  database.centres.forEach((centre) => {
    centre.queue = {
      date: today,
      baseServing: centre.baseServing,
      lastIssuedToken: centre.lastIssuedToken,
      openedAt: new Date().toISOString(),
    }
  })

  // Re-apply live bookings onto the freshly generated slot rows.
  Object.values(database.farmers).forEach((farmer) => {
    farmer.bookings
      .filter((booking) => booking.date >= today && booking.status === BOOKING_STATUS.BOOKED)
      .forEach((booking) => {
        const slot = database.slots.find(
          (item) =>
            item.centreId === booking.centreId &&
            item.date === booking.date &&
            item.startTime === booking.startTime,
        )
        if (slot) slot.booked = Math.min(slot.booked + 1, slot.capacity)
      })
  })

  return database
}

export function getDb() {
  if (!db) {
    const stored = readStorage(STORAGE_KEYS.MOCK_DB)
    db = stored && stored.version === DB_VERSION ? stored : createDatabase()
    refreshSlotWindow(db)
    persist()
  }
  return db
}

export function persist() {
  if (db) writeStorage(STORAGE_KEYS.MOCK_DB, db)
}

export function resetDb() {
  db = createDatabase()
  persist()
  return db
}

export function nextId(kind, prefix) {
  const database = getDb()
  const value = database.counters[kind]
  database.counters[kind] = value + 1
  return `${prefix}-${value}`
}

export function makeReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KK'
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export function getFarmer(mobile) {
  const database = getDb()
  return database.farmers[mobile] || null
}

export function ensureFarmer(mobile, profile) {
  const database = getDb()
  if (!database.farmers[mobile]) {
    database.farmers[mobile] = {
      profile: { ...profile, mobile },
      crops: [],
      bookings: [],
      procurements: [],
      payments: [],
    }
    persist()
  }
  return database.farmers[mobile]
}

/** Token currently at the counter, derived from the accelerated centre clock. */
export function liveNowServing(centre) {
  const queue = centre.queue
  if (!queue || centre.closedToday) return queue?.baseServing ?? 0
  const elapsedRealMs = Date.now() - new Date(queue.openedAt).getTime()
  const elapsedCentreMs = elapsedRealMs * SIM_SPEED
  const served = Math.floor(elapsedCentreMs / (centre.avgServiceMinutes * 60000))
  return Math.min(queue.baseServing + served, queue.lastIssuedToken)
}

export function centreLoad(centre) {
  const used = centre.procuredTodayQuintal
  const capacity = centre.dailyCapacityQuintal
  return {
    usedQuintal: used,
    capacityQuintal: capacity,
    remainingQuintal: Math.max(0, capacity - used),
    percentUsed: capacity ? Math.min(100, Math.round((used / capacity) * 100)) : 0,
  }
}

export function centreStatus(centre) {
  if (centre.closedToday) return 'closed'
  const { percentUsed } = centreLoad(centre)
  if (percentUsed >= 98) return 'full'
  if (percentUsed >= 80) return 'busy'
  return 'open'
}
