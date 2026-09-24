// Thin, failure-tolerant wrapper - private browsing can throw on writes.
const PREFIX = 'kk.'

export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  TOKEN: 'auth.token',
  REFRESH_TOKEN: 'auth.refreshToken',
  USER: 'auth.user',
  // Which kind of session TOKEN currently holds: 'farmer' or 'officer'. Unset
  // (older sessions, before this key existed) is treated as 'farmer' for
  // backward compatibility -- see AuthContext.
  ROLE: 'auth.role',
  MOCK_DB: 'mock.db',
  // Display preferences. Frontend only; the API never sees them.
  THEME: 'ui.theme',
  LANGUAGE: 'ui.language',
  // Crop chosen for each booking, for the priority lane. The backend's
  // Booking has no crop field, so this lives on the farmer's phone.
  CROP_BY_BOOKING: 'priority.cropByBooking',
  LAST_CROP: 'priority.lastCrop',
}
