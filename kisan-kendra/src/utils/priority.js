import { useCallback, useState } from 'react'
import { CROPS } from './constants.js'
import { readStorage, writeStorage, STORAGE_KEYS } from './storage.js'

/**
 * Crop-based priority, built entirely in the frontend.
 *
 * The rule: crops that lose quality fastest while standing in an open
 * trolley are served first. Wet paddy heats and discolours, maize and
 * groundnut pick up aflatoxin, so they cannot wait. Dry wheat and pulses
 * keep for days.
 *
 * What it changes, without touching the API:
 *  - Booking: the earliest third of each day's slots is the "priority
 *    window". High-priority crops are steered into it; standard crops see a
 *    gentle note asking them to leave it free. Nothing is blocked.
 *  - Token slip, dashboard, queue: the crop and its tier are shown, so gate
 *    staff can wave high-priority trolleys into the priority lane.
 *
 * Booking has no crop field on the backend, so the crop for each booking is
 * kept on this phone (localStorage) and is never sent to the server.
 */

export const TIERS = ['high', 'medium', 'standard']

export const CROP_TIER = {
  paddy_common: 'high',
  paddy_grade_a: 'high',
  maize: 'high',
  groundnut: 'high',
  soybean: 'medium',
  cotton: 'medium',
  bajra: 'medium',
  jowar: 'medium',
  wheat: 'standard',
  gram: 'standard',
  tur: 'standard',
  mustard: 'standard',
}

// Badge tone per tier, reusing the existing Badge palette.
export const TIER_TONE = { high: 'warning', medium: 'info', standard: 'neutral' }

export const tierForCrop = (cropCode) => (cropCode ? CROP_TIER[cropCode] || 'standard' : null)

export const findCrop = (cropCode) => CROPS.find((crop) => crop.code === cropCode) || null

/** Crops grouped by tier, in tier order, for the chooser and the help table. */
export function cropsByTier() {
  return TIERS.map((tier) => ({ tier, crops: CROPS.filter((crop) => CROP_TIER[crop.code] === tier) }))
}

/**
 * Slot ids in the priority window: the earliest third (at least one) of the
 * open slots on each date. Relative, so it works whatever hours a centre keeps.
 */
export function priorityWindowIds(slots = []) {
  const byDate = new Map()
  slots.forEach((slot) => {
    if (!byDate.has(slot.date)) byDate.set(slot.date, [])
    byDate.get(slot.date).push(slot)
  })
  const ids = new Set()
  byDate.forEach((daySlots) => {
    const sorted = [...daySlots].sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))
    const count = Math.max(1, Math.ceil(sorted.length / 3))
    sorted.slice(0, count).forEach((slot) => ids.add(slot.id))
  })
  return ids
}

// ---- Crop per booking, stored on this device ----------------------------

function readMap() {
  const map = readStorage(STORAGE_KEYS.CROP_BY_BOOKING, {})
  return map && typeof map === 'object' ? map : {}
}

export function getBookingCrop(bookingId) {
  if (bookingId === undefined || bookingId === null) return null
  return readMap()[String(bookingId)] || null
}

export function setBookingCrop(bookingId, cropCode) {
  if (bookingId === undefined || bookingId === null) return
  const map = readMap()
  if (cropCode) map[String(bookingId)] = cropCode
  else delete map[String(bookingId)]
  writeStorage(STORAGE_KEYS.CROP_BY_BOOKING, map)
  if (cropCode) writeStorage(STORAGE_KEYS.LAST_CROP, cropCode)
}

export const getLastCrop = () => readStorage(STORAGE_KEYS.LAST_CROP) || ''

/** [cropCode, setCropCode] for one booking, persisted as it changes. */
export function useBookingCrop(bookingId) {
  // Read on every render (a cheap localStorage read) so a change of
  // bookingId never shows the previous booking's crop.
  const [, setVersion] = useState(0)
  const crop = getBookingCrop(bookingId)
  const update = useCallback(
    (cropCode) => {
      setBookingCrop(bookingId, cropCode)
      setVersion((value) => value + 1)
    },
    [bookingId],
  )
  return [crop, update]
}
