import en from './locales/en.js'
import hi from './locales/hi.js'
import kn from './locales/kn.js'
import ta from './locales/ta.js'
import te from './locales/te.js'
import { DEFAULT_LANGUAGE, isSupportedLanguage } from './languages.js'
import { readStorage, STORAGE_KEYS } from '../utils/storage.js'

const DICTIONARIES = { en, hi, kn, ta, te }

/**
 * The active language lives at module level as well as in React state, so
 * plain helpers (formatDate, validators) can translate without a hook. The
 * provider updates it synchronously before re-rendering.
 */
const stored = readStorage(STORAGE_KEYS.LANGUAGE)
let current = isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE

export const getLanguage = () => current
export const setCurrentLanguage = (code) => {
  current = isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE
}

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary)
}

function interpolate(text, vars) {
  if (!vars || typeof text !== 'string') return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}

/**
 * translate('queue.farmersAhead') -> string in the active language.
 * Missing keys fall back to English, then to the key itself, so a gap in a
 * translation never blanks out the screen.
 */
export function translate(key, vars, lang = current) {
  const value = lookup(DICTIONARIES[lang], key) ?? lookup(DICTIONARIES.en, key)
  if (value === undefined) return key
  return interpolate(value, vars)
}

/** Picks key_one or key_other from `count`, then translates with count available. */
export function translatePlural(key, count, vars = {}, lang = current) {
  const form = Number(count) === 1 ? 'one' : 'other'
  return translate(`${key}_${form}`, { count, ...vars }, lang)
}

/** Raw lookup for arrays/objects (month names, list items). */
export function translateRaw(key, lang = current) {
  return lookup(DICTIONARIES[lang], key) ?? lookup(DICTIONARIES.en, key)
}

// Messages the Django API and the HTTP client send in English. Mapping them
// here translates them on screen without touching the backend. Anything not
// listed is shown exactly as the server sent it.
const SERVER_MESSAGES = {
  'This slot is full.': 'server.slotFull',
  'This slot is not open for booking.': 'server.slotNotOpen',
  'You have already booked this slot.': 'server.alreadyBooked',
  'No active account found with the given credentials.': 'server.badCredentials',
  'A farmer with this phone number is already registered.': 'server.phoneTaken',
  'Only bookings with status BOOKED can be cancelled.': 'server.cannotCancel',
  'Only bookings with status BOOKED can check in.': 'server.cannotCheckIn',
  'This booking has not checked in yet.': 'server.notCheckedIn',
  'This password is too common.': 'server.passwordCommon',
  'This password is entirely numeric.': 'server.passwordNumeric',
  'This password is too short. It must contain at least 8 characters.': 'server.passwordShort',
  'Could not reach the server. Check your internet connection and try again.': 'server.network',
  'Your session has ended. Please log in again.': 'server.sessionEnded',
  'Something went wrong. Please try again.': 'server.generic',
  'The server had a problem. Please try again in a few minutes.': 'server.serverError',
}

const SERVER_PATTERNS = [
  [/^Check-in is not open yet; this slot is on (\S+)\.$/, 'server.checkInNotOpen'],
  [/^Check-in has closed; this slot was on (\S+)\.$/, 'server.checkInClosed'],
  [/^The password is too similar to the (.+)\.$/, 'server.passwordSimilar'],
]

export function translateServerMessage(message) {
  if (!message) return message
  if (current === 'en') return message
  const key = SERVER_MESSAGES[message]
  if (key) return translate(key)
  for (const [pattern, patternKey] of SERVER_PATTERNS) {
    const match = message.match(pattern)
    if (match) return translate(patternKey, { value: match[1] })
  }
  return message
}
