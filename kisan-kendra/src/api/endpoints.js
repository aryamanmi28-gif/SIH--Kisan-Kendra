// Every server path the frontend knows about, in one place.
// When the Django REST API is ready, only this file (and the base URL in .env)
// should need to change if the route names differ.

export const ENDPOINTS = {
  auth: {
    // Not implemented in backend: this API is phone_number + password, not OTP.
    // requestOtp: '/auth/otp/request/',
    // verifyOtp: '/auth/otp/verify/',
    login: '/auth/login/',
    register: '/auth/register/',
    refresh: '/auth/login/refresh/',
    // Not implemented in backend: JWT is stateless here, nothing to call server-side.
    // logout: '/auth/logout/',
    me: '/auth/me/',
    officerLogin: '/auth/officer-login/',
  },
  profile: {
    // The backend only exposes a read-only /auth/me/ (GET). There is no
    // endpoint to update a farmer's profile fields yet.
    detail: '/auth/me/',
    // update: '/farmers/me/',
    // Not implemented in backend: Farmer has no bank-account fields at all.
    // bankAccount: '/farmers/me/bank-account/',
  },
  // Not implemented in backend: there is no CropLot model. The "My crops" feature
  // is hidden from the UI for this prototype.
  // crops: {
  //   list: '/crop-lots/',
  //   create: '/crop-lots/',
  //   detail: (lotId) => `/crop-lots/${lotId}/`,
  //   update: (lotId) => `/crop-lots/${lotId}/`,
  //   remove: (lotId) => `/crop-lots/${lotId}/`,
  //   catalogue: '/crops/',
  // },
  centres: {
    list: '/centres/',
    detail: (centreId) => `/centres/${centreId}/`,
    slots: (centreId) => `/centres/${centreId}/slots/`,
    queue: (centreId) => `/centres/${centreId}/queue/`,
    dailySummary: (centreId) => `/centres/${centreId}/daily-summary/`,
    callNext: (centreId) => `/centres/${centreId}/queue/call-next/`,
  },
  queueEntries: {
    serve: (entryId) => `/queue-entries/${entryId}/serve/`,
    complete: (entryId) => `/queue-entries/${entryId}/complete/`,
    skip: (entryId) => `/queue-entries/${entryId}/skip/`,
  },
  bookings: {
    list: '/bookings/',
    create: '/bookings/',
    detail: (bookingId) => `/bookings/${bookingId}/`,
    cancel: (bookingId) => `/bookings/${bookingId}/cancel/`,
    checkIn: (bookingId) => `/bookings/${bookingId}/check-in/`,
    queuePosition: (bookingId) => `/bookings/${bookingId}/queue-status/`,
    emergencyRequest: (bookingId) => `/bookings/${bookingId}/emergency-request/`,
  },
  procurement: {
    list: '/procurements/',
    detail: (procurementId) => `/procurements/${procurementId}/`,
  },
  // Not implemented in backend: there is no standalone Payment model. Payment
  // info lives on Procurement (payment_status, total_amount, procured_at) —
  // read it from procurementApi instead.
  // payments: {
  //   list: '/payments/',
  //   detail: (paymentId) => `/payments/${paymentId}/`,
  // },
}

export default ENDPOINTS
