# Kisan Kendra — Farmer Procurement Queue & Slot Management (frontend)

React frontend for a government crop-procurement service: a farmer books a slot at a
procurement centre, gets a token, checks in at the gate, watches the queue move towards their
number, and follows the payment until it reaches their bank account.

Frontend only. The Django REST API and MySQL database are built separately; every screen here
already runs through an API layer that is one environment variable away from talking to them.

## Stack

React 18 + Vite · Tailwind CSS · React Router 6 · Axios · JavaScript (no TypeScript)

## Running it

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build
```

The app starts on an in-browser mock backend, so the whole journey works with no server running.

**Sample login:** mobile `9876543210`, OTP `123456` — a farmer with an active token, a past sale
and a credited payment. Register any other 10-digit number to see the empty states a new farmer
gets. Mock data lives in `localStorage`; clearing site data resets it.

## Connecting the Django API

Two steps, no component changes:

1. Set the environment:

   ```
   VITE_API_BASE_URL=/api        # or http://127.0.0.1:8000/api
   VITE_USE_MOCK_API=false
   ```

   `vite.config.js` already proxies `/api` to `http://127.0.0.1:8000` in development.

2. Make the Django routes match `src/api/endpoints.js`, or edit that file to match your routes.

`src/api/services.js` declares each operation once, with its mock implementation and its live
Axios call side by side:

```js
list: route(mock.listCentres, (params) => httpClient.get(ENDPOINTS.centres.list, { params })),
```

`route()` picks one based on `VITE_USE_MOCK_API`. There is deliberately **no** silent fallback to
mock data when a live call fails — a broken API must surface as an error state, not as fake data.

### What the client already handles

- Bearer token from `localStorage` attached to every request.
- DRF error shapes normalised into one `ApiError`: `{"detail": "..."}`, `{"field": ["msg"]}` and
  `non_field_errors` all become `error.message` plus `error.fieldErrors`, which forms map straight
  onto the offending input.
- `401` clears the session; `500` and network failures get plain-language messages.
- Responses are unwrapped, so `await centreApi.list()` returns the payload, not an Axios response.

### Status values the API should return

| Domain | Values |
| --- | --- |
| Booking | `booked`, `checked_in`, `serving`, `completed`, `cancelled`, `missed` |
| Procurement | `awaiting`, `weighing`, `quality_check`, `completed`, `rejected` |
| Payment | `procurement_completed`, `payment_initiated`, `dbt_processing`, `payment_credited`, `failed` |

Payments carry a `stages` array of `{ key, at }` in that order; the timeline renders reached
stages with timestamps and leaves the rest quiet. Times are `HH:MM` (24h) and dates `YYYY-MM-DD`;
formatting for display happens in `src/utils/format.js`.

### Server-side rules the frontend assumes

The UI blocks these cases before submitting, but the API must enforce them too:

- One active booking per crop lot (`409`, code `duplicate_booking`).
- One booking per farmer per centre per day (`409`).
- A slot that filled up between load and submit (`409`, code `slot_full` — the UI reloads slots).
- Quantity beyond the centre's remaining capacity (`409`, code `capacity_exceeded`).
- Check-in only on the slot date (`409`, code `not_slot_day`).

## Project structure

```
src/
  api/
    client.js        Axios instance, auth header, DRF error normalisation, ApiError
    config.js        env reading (base URL, mock flag)
    endpoints.js     every server path in one map
    apiRouter.js     route(mockFn, liveFn) switch
    services.js      the only API surface components may import
    mock/            in-browser backend: seeded db + handlers (delete once live)
  components/
    ui/              Button, Card, Badge, StatusBadge, Field, Alert, Modal, Stepper,
                     CapacityBar, DetailList, States (loading/empty/error), Icon, Spinner
    layout/          Masthead, BottomNav, SiteFooter, PageHeader, Container,
                     AppLayout, PublicLayout, ProtectedRoute
    farmer/          CentreCard, CropLotCard, QueueRail, TokenPlate, PaymentTimeline
  context/           AuthContext (session), ToastContext (confirmations)
  hooks/             useApi (load/poll/refetch), useMutation (submit guard), useForm,
                     useInterval, useDocumentTitle
  pages/             13 screens, one file each
  utils/             constants (crops, MSP, statuses), format, validation, storage
```

### Routes

| Path | Screen |
| --- | --- |
| `/` | Landing |
| `/login`, `/register` | Mobile + OTP login, farmer registration |
| `/dashboard` | Farmer dashboard |
| `/crops` | Crop lots (add, edit, remove) |
| `/centres`, `/centres/:centreId` | Centre list, centre detail with capacity and queue |
| `/book/:centreId` | Slot booking |
| `/bookings/:bookingId` | Confirmation and printable token slip |
| `/check-in/:bookingId` | Check-in at the gate |
| `/queue`, `/queue/:bookingId` | Live queue tracker |
| `/procurement` | Weighment, grade and amount per lot |
| `/payments`, `/payments/:paymentId` | Payment list and four-stage tracker |
| `/profile`, `/help` | Profile and bank account, help and rules |

Everything except the landing, auth and help pages sits behind `ProtectedRoute`, which waits for
the session to restore before deciding, so a refresh does not bounce a logged-in farmer out.

## Notes on a few decisions

**Duplicate submissions.** `useMutation` holds an in-flight ref, so a double tap on "Confirm and
get token" fires one request. The button also disables while loading, and the mock rejects a
second booking for the same lot with `409` — the same constraint the API needs.

**Loading without flicker.** `useApi(fn, deps, { pollMs })` refreshes the queue and payment
screens in the background without dropping a spinner over content the farmer is reading. First
load shows a skeleton or a loading state; failures show a retry.

**Queue simulation.** In mock mode the centre clock runs 12× real time, so a queue that moves one
farmer every 9 minutes visibly advances every ~45 seconds and the whole journey (token → check-in
→ counter → weighment → payment credited) can be watched end to end in a few minutes. The tracker
labels this as sample data; the notice disappears when `VITE_USE_MOCK_API=false`.

**Design.** Government service, not a product site: one dark surface (the masthead), 4px corners,
1px rules instead of shadows, no gradients, 46–54px touch targets, tabular figures everywhere
numbers matter. The one place with visual emphasis is the
queue rail, where served tokens dim, the counter token carries the only pulsing indicator in the
app, and the farmer's own token sits solid and larger at the end.

**Accessibility.** Skip link, labelled fields with `aria-invalid` and described errors, focus
moves to the first invalid field on submit, visible focus rings, `prefers-reduced-motion`
respected, and text contrast at AA against every background used.

## Language, dark mode, transitions and crop priority

All four are frontend only: no API route, request body or response shape changed.

**Languages.** First launch opens a chooser for English, हिन्दी, ಕನ್ನಡ, தமிழ் and తెలుగు; it can be
reopened from the top bar or the profile page. Strings live in `src/i18n/locales/` (one file per
language, identical keys; missing keys fall back to English). Known English messages from the
Django API are translated on screen in `src/i18n/translate.js` (`SERVER_MESSAGES`). Dates use the
browser's own locale data. Choice is stored in `localStorage` as `kk.ui.language`.

**Dark mode.** Every colour is a CSS variable (`src/index.css`) consumed by Tailwind
(`tailwind.config.js`). `data-theme="dark"` on `<html>` switches the palette; a script in
`index.html` sets it before first paint. Printing always uses the light palette.

**Page transitions.** `src/components/layout/RouteTransition.jsx` shows each new route inside a
View Transition; the choreography is in `index.css` (`vt-page`). Browsers without View
Transitions get a simple fade-in, and reduced-motion users get none.

**Crop priority.** `src/utils/priority.js`. Crops are ranked by how fast they spoil while waiting
(high: paddy, maize, groundnut; medium: soybean, cotton, bajra, jowar; standard: wheat, gram,
tur, mustard). The earliest third of each day's slots is the priority window: high-priority crops
are steered into it, standard crops are asked to leave it free. The crop is saved per booking on
the phone (`kk.priority.cropByBooking`) and shown on the slip, dashboard, check-in and queue so gate
staff can use a priority lane. The backend queue order itself is unchanged (first come, first
served); reordering it would need a `crop` field on `Booking`.

## Not included

The Django backend, the database, and any centre-operator or admin screens (this is the farmer's
side of the service). Real OTP delivery, DBT integration and land-record verification are backend
concerns.
