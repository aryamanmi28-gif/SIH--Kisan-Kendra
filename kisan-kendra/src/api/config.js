// Reading import.meta.env in one place keeps the rest of the app testable.
const env = import.meta.env || {}

export const API_BASE_URL = env.VITE_API_BASE_URL || '/api'

/** Mock mode is the default until the Django endpoints are deployed. */
export const USE_MOCK_API = String(env.VITE_USE_MOCK_API ?? 'true') !== 'false'

export const REQUEST_TIMEOUT_MS = 20000

/**
 * Credentials the mock backend accepts. Kept here (not in the mock module) so
 * the login screen can mention them without pulling the mock data into the
 * production bundle.
 */
export const DEMO_CREDENTIALS = { mobile: '9876543210', otp: '123456' }
