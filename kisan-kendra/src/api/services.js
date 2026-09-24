import httpClient from './client.js'
import ENDPOINTS from './endpoints.js'
import { route } from './apiRouter.js'
import * as mock from './mock/handlers.js'

/**
 * The single surface the UI is allowed to touch.
 *
 * Each function is declared once with its mock implementation and its live
 * Django call side by side, so switching backends is a one-line env change and
 * the request/response contract stays visible in one file.
 */

export const authApi = {
  // Single-step login: this backend is phone_number + password, not OTP.
  login: route(mock.verifyOtp, (payload) => httpClient.post(ENDPOINTS.auth.login, payload)),
  register: route(mock.register, (payload) => httpClient.post(ENDPOINTS.auth.register, payload)),
  me: route(mock.getCurrentUser, () => httpClient.get(ENDPOINTS.auth.me)),
  // logout has no backend call — JWT is stateless here. AuthContext clears
  // local storage directly instead of calling through this API.
  officerLogin: route(mock.officerLogin, (payload) => httpClient.post(ENDPOINTS.auth.officerLogin, payload)),
}

export const profileApi = {
  // update/updateBankAccount are not implemented in the backend: there is no
  // endpoint to edit a farmer's profile, and Farmer has no bank fields at all.
}

// cropApi removed: no CropLot model in the backend. The "My crops" feature is
// hidden from the UI for this prototype (see routes.jsx).

export const centreApi = {
  list: route(mock.listCentres, (params) => httpClient.get(ENDPOINTS.centres.list, { params })),
  detail: route(mock.getCentre, (centreId) => httpClient.get(ENDPOINTS.centres.detail(centreId))),
  slots: route(mock.getCentreSlots, (centreId, params) =>
    httpClient.get(ENDPOINTS.centres.slots(centreId), { params }),
  ),
  queue: route(mock.getCentreQueue, (centreId) => httpClient.get(ENDPOINTS.centres.queue(centreId))),
  officerList: route(mock.officerList, () => httpClient.get(ENDPOINTS.centres.list)),
  dailySummary: route(mock.dailySummary, (centreId) => httpClient.get(ENDPOINTS.centres.dailySummary(centreId))),
  callNext: route(mock.callNext, (centreId) => httpClient.post(ENDPOINTS.centres.callNext(centreId))),
}

export const queueApi = {
  serve: route(mock.serve, (entryId) => httpClient.patch(ENDPOINTS.queueEntries.serve(entryId))),
  complete: route(mock.complete, (entryId) => httpClient.patch(ENDPOINTS.queueEntries.complete(entryId))),
  skip: route(mock.skip, (entryId) => httpClient.patch(ENDPOINTS.queueEntries.skip(entryId))),
}

export const bookingApi = {
  list: route(mock.listBookings, () => httpClient.get(ENDPOINTS.bookings.list)),
  detail: route(mock.getBooking, (bookingId) => httpClient.get(ENDPOINTS.bookings.detail(bookingId))),
  create: route(mock.createBooking, (payload) => httpClient.post(ENDPOINTS.bookings.create, payload)),
  cancel: route(mock.cancelBooking, (bookingId, payload) =>
    httpClient.patch(ENDPOINTS.bookings.cancel(bookingId), payload),
  ),
  checkIn: route(mock.checkIn, (bookingId) => httpClient.post(ENDPOINTS.bookings.checkIn(bookingId))),
  queuePosition: route(mock.getQueuePosition, (bookingId) =>
    httpClient.get(ENDPOINTS.bookings.queuePosition(bookingId)),
  ),
  emergencyRequest: route(mock.emergencyRequest, (bookingId, payload) =>
    httpClient.post(ENDPOINTS.bookings.emergencyRequest(bookingId), payload),
  ),
}

export const procurementApi = {
  list: route(mock.listProcurements, () => httpClient.get(ENDPOINTS.procurement.list)),
  detail: route(mock.getProcurement, (id) => httpClient.get(ENDPOINTS.procurement.detail(id))),
}

// paymentApi removed: no standalone Payment model in the backend. Payment info
// (payment_status, total_amount, procured_at) lives on each Procurement —
// read it from procurementApi instead.

/**
 * The dashboard summary is one call in mock mode. The Django API has no
 * aggregate endpoint, so this fans out to authApi.me(), bookingApi.list() and
 * procurementApi.list() and recomputes the same summary shape from just
 * those two lists — crop-lot and standalone-payment fields have no backend
 * equivalent and are dropped (see dashboardApi.summary for the full mapping).
 */
export const dashboardApi = {
  summary: route(mock.getDashboard, async () => {
    const [profile, bookings, procurements] = await Promise.all([
      httpClient.get(ENDPOINTS.auth.me),
      httpClient.get(ENDPOINTS.bookings.list),
      httpClient.get(ENDPOINTS.procurement.list),
    ])

    const openBookings = bookings
      .filter((booking) => booking.status === 'booked')
      .sort((a, b) => `${a.slot.date}${a.slot.start_time}`.localeCompare(`${b.slot.date}${b.slot.start_time}`))

    const pendingProcurements = procurements.filter((p) => p.payment_status === 'pending')
    const paidProcurements = procurements.filter((p) => p.payment_status === 'paid')
    const sumAmount = (list) => list.reduce((sum, p) => sum + Number(p.total_amount || 0), 0)

    const recentProcurement = [...procurements].sort((a, b) =>
      String(b.procured_at || '').localeCompare(String(a.procured_at || '')),
    )[0]

    return {
      profile,
      activeBooking: openBookings[0] || null,
      pendingPaymentCount: pendingProcurements.length,
      pendingPaymentAmount: sumAmount(pendingProcurements),
      creditedTotal: sumAmount(paidProcurements),
      recentProcurement: recentProcurement || null,
      procurementCount: procurements.length,
    }
  }),
}
