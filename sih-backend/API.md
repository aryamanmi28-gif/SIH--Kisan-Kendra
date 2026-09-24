# SIH PS 26032 — Farmer Procurement API Reference

Base URL (local dev): `http://localhost:8000/api/`

This covers farmer-facing booking + live queue endpoints, and the officer queue-control endpoints. Procurement/payment updates and notifications are not built yet.

## Authentication

JWT via `djangorestframework-simplejwt`.

- **Farmers** log in with **phone number** via `/api/auth/login/`.
- **Officers** (staff accounts, `is_staff=True`) log in with a standard **username** via `/api/auth/officer-login/`. Officers have no `Farmer` profile and cannot use the farmer login or farmer-only endpoints.

Send the access token on every authenticated request:
```
Authorization: Bearer <access_token>
```
- Access token lifetime: 1 hour
- Refresh token lifetime: 7 days

### `POST /api/auth/register/`
Create a farmer account (User + Farmer in one call).

Auth required: No

Request body:
```json
{
  "full_name": "Ramesh Kumar",
  "phone_number": "9812345678",
  "village": "Rampur",
  "district": "Meerut",
  "state": "Uttar Pradesh",
  "password": "StrongPass123!"
}
```

Response `201`:
```json
{
  "id": 1,
  "full_name": "Ramesh Kumar",
  "phone_number": "9812345678",
  "village": "Rampur",
  "district": "Meerut",
  "state": "Uttar Pradesh",
  "is_verified": false,
  "created_at": "2026-09-09T21:01:49.413561Z"
}
```

Errors:
- `400` — phone number already registered: `{"phone_number": ["A farmer with this phone number is already registered."]}`
- `400` — password fails Django's validators (too short/common/numeric): `{"password": ["..."]}`

### `POST /api/auth/login/`
Obtain a JWT pair.

Auth required: No

Request body:
```json
{ "phone_number": "9812345678", "password": "StrongPass123!" }
```

Response `200`:
```json
{ "refresh": "<refresh_token>", "access": "<access_token>" }
```

Errors:
- `401` — wrong phone/password: `{"detail": "No active account found with the given credentials."}`

### `POST /api/auth/login/refresh/`
Exchange a refresh token for a new access token.

Auth required: No

Request body:
```json
{ "refresh": "<refresh_token>" }
```

Response `200`:
```json
{ "access": "<new_access_token>" }
```

### `GET /api/auth/me/`
Return the logged-in farmer's own profile.

Auth required: Yes

Response `200`: same shape as the register response above.

Errors:
- `401` — no/invalid token: `{"detail": "Authentication credentials were not provided."}`

### `POST /api/auth/officer-login/`
Obtain a JWT pair for an officer/staff account.

Auth required: No

Request body:
```json
{ "username": "officer1", "password": "Officer@1234" }
```

Response `200`:
```json
{ "refresh": "<refresh_token>", "access": "<access_token>" }
```

---

## Procurement centres & slots

### `GET /api/centres/`
List active procurement centres.

Auth required: Yes

Response `200`:
```json
[
  {
    "id": 1,
    "name": "Test Mandi Centre",
    "code": "CTR001",
    "address": "Main Road",
    "district": "TestDistrict",
    "state": "TestState",
    "contact_number": "9999999999"
  }
]
```

### `GET /api/centres/<id>/slots/`
List `OPEN` slots for a centre. Optional `?date=YYYY-MM-DD` filter.

Auth required: Yes

Response `200`:
```json
[
  {
    "id": 1,
    "date": "2026-09-10",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "capacity": 1,
    "status": "open"
  }
]
```

---

## Bookings

All booking endpoints only ever operate on the logged-in farmer's own bookings — other farmers' bookings are invisible (404, not 403, on direct ID access).

### `POST /api/bookings/`
Book a slot.

Auth required: Yes

Request body:
```json
{ "slot": 1, "expected_quantity_kg": "100.00" }
```
`expected_quantity_kg` is optional.

Response `201`:
```json
{
  "id": 1,
  "reference_code": "BK-5DB136DA",
  "status": "booked",
  "expected_quantity_kg": "100.00",
  "booked_at": "2026-09-09T21:02:04.906120Z",
  "slot": {
    "id": 1,
    "date": "2026-09-10",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "open",
    "centre": { "id": 1, "name": "Test Mandi Centre", "code": "CTR001" }
  },
  "queue_status": null,
  "procurement": null
}
```

Errors:
- `400` — slot not open: `{"slot": ["This slot is not open for booking."]}`
- `400` — slot at capacity: `{"slot": ["This slot is full."]}`
- `400` — already booked this slot: `{"non_field_errors": ["You have already booked this slot."]}` (note: if the slot is also at capacity, the "full" error takes precedence since capacity is checked first)

### `GET /api/bookings/`
List the logged-in farmer's own bookings, most recent first.

Auth required: Yes

Response `200`: array of the same shape as the create response above.

### `GET /api/bookings/<id>/`
Booking detail, including nested slot/centre, current queue status, and full procurement/payment detail (`null` until recorded).

Auth required: Yes

Response `200`:
```json
{
  "id": 64,
  "reference_code": "BK-E5F00068",
  "status": "completed",
  "expected_quantity_kg": null,
  "booked_at": "2026-09-09T21:55:49.151591Z",
  "slot": {
    "id": 1475, "date": "2026-09-09", "start_time": "09:00:00", "end_time": "11:00:00",
    "status": "open", "centre": { "id": 32, "name": "Ludhiana Grain Procurement Centre — Demo", "code": "DEMO-PB01" }
  },
  "queue_status": "served",
  "procurement": {
    "id": 1, "booking": 64, "commodity": "Wheat", "quantity_kg": "120.00", "rate_per_kg": "22.50",
    "total_amount": "2700.00", "status": "completed", "payment_status": "paid",
    "procured_at": "2026-09-09T21:55:49.265207Z"
  }
}
```
`procurement` is `null` until an officer records it (see below). `queue_status` is `null` until the farmer checks in.

Errors:
- `404` — not your booking or doesn't exist: `{"detail": "No Booking matches the given query."}`

### `PATCH /api/bookings/<id>/cancel/`
Cancel a booking. Only allowed while status is `booked`.

Auth required: Yes

Request body: none required.

Response `200`: booking with `"status": "cancelled"`.

Errors:
- `400` — already cancelled/completed/no_show: `{"detail": "Only bookings with status BOOKED can be cancelled."}`
- `404` — not your booking or doesn't exist.

### `POST /api/bookings/<id>/check-in/`
Farmer checks in on arrival at the centre. Creates a `QueueEntry` with a token number scoped per centre per day (resets to 1 each day, independently per centre).

Auth required: Yes (owning farmer only)

Request body: none required.

Only allowed when:
- the booking status is `booked`
- today's date matches the slot's date exactly (not before, not after)

**Idempotent:** if a `QueueEntry` already exists for this booking, it's returned as-is (`200`) instead of erroring or duplicating.

Response `201` (first check-in) / `200` (already checked in):
```json
{
  "id": 1,
  "booking": 43,
  "status": "waiting",
  "token_number": 1,
  "centre": { "id": 22, "name": "Ludhiana Grain Procurement Centre — Demo", "code": "DEMO-PB01" },
  "date": "2026-09-09",
  "position": 0,
  "estimated_wait_minutes": 0,
  "checked_in_at": "2026-09-09T21:48:44.582551Z",
  "called_at": null,
  "served_at": null
}
```

Errors:
- `400` — booking not in `booked` status: `{"detail": "Only bookings with status BOOKED can check in."}`
- `400` — slot date is in the future: `{"detail": "Check-in is not open yet; this slot is on 2026-09-10."}`
- `400` — slot date is in the past: `{"detail": "Check-in has closed; this slot was on 2026-09-08."}`
- `404` — not your booking or doesn't exist.

---

## Procurement & payment (officer)

### `POST /api/bookings/<id>/procurement/`
Officer records what was actually procured for a booking, once the farmer has been served. Sets `Procurement.status` to `completed`, `payment_status` to `pending`, `procured_at` to now, and flips the linked `Booking.status` to `completed` — this is the point where a booking's lifecycle actually finishes (the farmer showing up in the queue isn't enough; the produce has to actually be recorded).

Auth required: Officer

Only allowed once the booking's `QueueEntry` status is `served`.

**Idempotent:** if a `Procurement` already exists for this booking (it's a one-to-one), it's returned as-is instead of erroring or overwriting.

Request body:
```json
{ "commodity": "Wheat", "quantity_kg": "120.00", "rate_per_kg": "22.50" }
```
`total_amount` is always computed server-side (`quantity_kg × rate_per_kg`) — any client-supplied `total_amount` is ignored. Both `quantity_kg` and `rate_per_kg` must be ≥ 0.01.

Response `201` (first record) / `200` (already recorded):
```json
{
  "id": 1, "booking": 64, "commodity": "Wheat", "quantity_kg": "120.00", "rate_per_kg": "22.50",
  "total_amount": "2700.00", "status": "completed", "payment_status": "pending",
  "procured_at": "2026-09-09T21:55:49.265207Z"
}
```

Errors:
- `400` — queue entry isn't `served` yet: `{"detail": "Procurement can only be recorded after the farmer has been SERVED in the queue."}`
- `400` — invalid quantity/rate: `{"quantity_kg": ["Ensure this value is greater than or equal to 0.01."]}`
- `403` — not an officer.

### `PATCH /api/procurements/<id>/mark-paid/`
Marks payment as credited. **This simulates a DBT (Direct Benefit Transfer) credit — it is a manual status flip only, with no real payment gateway integration**, per project scope.

Auth required: Officer

Only allowed while `payment_status` is `pending`.

Response `200`: same shape as the procurement record above, with `"payment_status": "paid"`.

Errors:
- `400` — already paid: `{"detail": "Only a PENDING payment can be marked as PAID."}`
- `403` — not an officer.

---

## Live queue status (farmer)

### `GET /api/queue-entries/<id>/status/`
The farmer's own live queue position and a naive wait estimate. Meant for frequent polling from a live-tracking screen (kept lightweight — doesn't include the full booking/slot payload).

Auth required: Yes (owning farmer only)

Response `200`: same shape as the check-in response above.

- `position` — number of farmers still `waiting` ahead of this entry, at the same centre, same day, with a lower token number.
- `estimated_wait_minutes` — **placeholder** calculation: `position × 5 minutes` (fixed constant, `PLACEHOLDER_AVG_SERVICE_MINUTES` in code). Not a real ETA model yet — that's a later phase; the field is stable so the frontend can wire against it now.

Errors:
- `404` — not your queue entry or doesn't exist.

---

## Queue controls (officer)

All endpoints below require an officer/staff account (`is_staff=True`), obtained via `/api/auth/officer-login/`. A farmer token gets `403`.

### `GET /api/centres/<id>/queue/`
Today's full queue for a centre, ordered by token number.

Auth required: Officer

Response `200`:
```json
[
  {
    "id": 1,
    "booking": 43,
    "status": "waiting",
    "token_number": 1,
    "centre": { "id": 22, "name": "Ludhiana Grain Procurement Centre — Demo", "code": "DEMO-PB01" },
    "date": "2026-09-09",
    "position": 0,
    "estimated_wait_minutes": 0,
    "checked_in_at": "2026-09-09T21:48:44.582551Z",
    "called_at": null,
    "served_at": null,
    "farmer": { "id": 35, "full_name": "Ramesh Singh", "phone_number": "7000000001" }
  }
]
```

### `POST /api/centres/<id>/queue/call-next/`
Advances the lowest-token `waiting` entry for this centre today to `called`, sets `called_at`.

Auth required: Officer

Response `200`: the called entry (same shape as above), or if nobody is waiting:
```json
{ "detail": "No farmers waiting in the queue." }
```

### `PATCH /api/queue-entries/<id>/serve/`
`called` → `serving`.

Auth required: Officer

Errors:
- `400` — entry isn't currently `called`: `{"detail": "Only a CALLED entry can be marked as SERVING."}`

### `PATCH /api/queue-entries/<id>/complete/`
`serving` → `served`, sets `served_at`.

Auth required: Officer

Errors:
- `400` — entry isn't currently `serving`: `{"detail": "Only a SERVING entry can be marked as SERVED."}`

### `PATCH /api/queue-entries/<id>/skip/`
`waiting` or `called` → `skipped` (e.g. farmer wasn't present when called).

Auth required: Officer

Errors:
- `400` — entry isn't `waiting`/`called`: `{"detail": "Only a WAITING or CALLED entry can be skipped."}`

---

## Field reference

**Booking status:** `booked`, `cancelled`, `completed`, `no_show` (`no_show` is not currently set by any endpoint — deferred)
**Slot status:** `open`, `closed`, `full`
**Queue status:** `waiting`, `called`, `serving`, `served`, `skipped`
**Procurement status:** `scheduled`, `in_progress`, `completed`, `rejected` (currently only `completed` is ever set, on recording)
**Payment status:** `pending`, `paid`

## Not built yet

- SMS/app notification sending
- Real ETA / queue-position prediction (current wait estimate is a naive placeholder — see above)
- Officer endpoints for managing centres/slots themselves (creation, capacity, closing)
- `Booking.status = no_show` is never set by any endpoint; a booking can also technically still be cancelled after check-in (`cancel` only checks the booking is `booked`, which check-in doesn't change) — a known gap, not yet addressed
