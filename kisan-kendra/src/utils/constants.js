// Domain vocabulary shared by the UI and the API layer.
// Status strings match what the Django API is expected to return.

export const BOOKING_STATUS = {
  BOOKED: 'booked',
  CHECKED_IN: 'checked_in',
  SERVING: 'serving',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
}

export const BOOKING_STATUS_LABEL = {
  booked: 'Slot booked',
  checked_in: 'Checked in',
  serving: 'At the counter',
  completed: 'Procurement done',
  cancelled: 'Cancelled',
  missed: 'Slot missed',
  no_show: 'No show',
}

// The backend keeps queue progress on a separate QueueEntry, not on the
// booking itself. These are QueueEntry.status values.
export const QUEUE_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  SERVING: 'serving',
  SERVED: 'served',
  SKIPPED: 'skipped',
}

export const QUEUE_STATUS_LABEL = {
  waiting: 'Waiting',
  called: 'Called - head to the counter',
  serving: 'At the counter',
  served: 'Served',
  skipped: 'Skipped',
}

export const PROCUREMENT_STATUS = {
  AWAITING: 'awaiting',
  WEIGHING: 'weighing',
  QUALITY_CHECK: 'quality_check',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
}

export const PROCUREMENT_STATUS_LABEL = {
  awaiting: 'Waiting at centre',
  weighing: 'Weighing in progress',
  quality_check: 'Quality check',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Procurement completed',
  rejected: 'Lot rejected',
}

// The four payment stages the farmer is shown, in order.
export const PAYMENT_STAGES = [
  {
    key: 'procurement_completed',
    label: 'Procurement completed',
    hint: 'Your crop was weighed and accepted at the centre.',
  },
  {
    key: 'payment_initiated',
    label: 'Payment initiated',
    hint: 'The centre raised your payment request against the acknowledgement slip.',
  },
  {
    key: 'dbt_processing',
    label: 'DBT processing',
    hint: 'The amount is being transferred to your Aadhaar-linked bank account.',
  },
  {
    key: 'payment_credited',
    label: 'Payment credited',
    hint: 'Money has reached your bank account.',
  },
]

export const PAYMENT_STATUS = {
  PROCUREMENT_COMPLETED: 'procurement_completed',
  PAYMENT_INITIATED: 'payment_initiated',
  DBT_PROCESSING: 'dbt_processing',
  PAYMENT_CREDITED: 'payment_credited',
  FAILED: 'failed',
}

export const PAYMENT_STATUS_LABEL = {
  procurement_completed: 'Awaiting payment request',
  payment_initiated: 'Payment initiated',
  dbt_processing: 'DBT processing',
  payment_credited: 'Credited',
  failed: 'Transfer failed',
}

// Procurement.payment_status on the real backend has just these two states —
// unrelated to the four-stage PAYMENT_STATUS above, which belonged to the
// (currently hidden) standalone payments feature.
export const PROCUREMENT_PAYMENT_STATUS_LABEL = {
  pending: 'Payment pending',
  paid: 'Paid',
}

// Indicative minimum support prices, per quintal. The API will replace these
// with the notified rates for the running season.
export const CROPS = [
  { code: 'paddy_common', name: 'Paddy (common)', hindi: 'धान', msp: 2369, unit: 'quintal' },
  { code: 'paddy_grade_a', name: 'Paddy (Grade A)', hindi: 'धान (ग्रेड ए)', msp: 2389, unit: 'quintal' },
  { code: 'wheat', name: 'Wheat', hindi: 'गेहूँ', msp: 2425, unit: 'quintal' },
  { code: 'maize', name: 'Maize', hindi: 'मक्का', msp: 2400, unit: 'quintal' },
  { code: 'bajra', name: 'Bajra', hindi: 'बाजरा', msp: 2775, unit: 'quintal' },
  { code: 'jowar', name: 'Jowar', hindi: 'ज्वार', msp: 3421, unit: 'quintal' },
  { code: 'gram', name: 'Gram', hindi: 'चना', msp: 5875, unit: 'quintal' },
  { code: 'tur', name: 'Tur / Arhar', hindi: 'अरहर', msp: 8000, unit: 'quintal' },
  { code: 'mustard', name: 'Mustard', hindi: 'सरसों', msp: 5950, unit: 'quintal' },
  { code: 'groundnut', name: 'Groundnut', hindi: 'मूँगफली', msp: 6783, unit: 'quintal' },
  { code: 'soybean', name: 'Soybean', hindi: 'सोयाबीन', msp: 5328, unit: 'quintal' },
  { code: 'cotton', name: 'Cotton (medium staple)', hindi: 'कपास', msp: 7121, unit: 'quintal' },
]

export const CROP_VARIETIES = {
  paddy_common: ['Swarna', 'MTU-1010', 'IR-64', 'Sona Masuri', 'Other'],
  paddy_grade_a: ['Pusa Basmati 1121', 'Pusa Basmati 1509', 'PR-126', 'Other'],
  wheat: ['HD-2967', 'HD-3086', 'PBW-343', 'Lok-1', 'Other'],
  maize: ['Pioneer 3396', 'NK-6240', 'Local hybrid', 'Other'],
  bajra: ['HHB-67', 'Pusa Composite', 'Other'],
  jowar: ['CSV-15', 'Local', 'Other'],
  gram: ['JG-11', 'Kabuli', 'Desi', 'Other'],
  tur: ['Asha', 'Maruti', 'Local', 'Other'],
  mustard: ['Pusa Bold', 'RH-749', 'Varuna', 'Other'],
  groundnut: ['TAG-24', 'GG-20', 'Local', 'Other'],
  soybean: ['JS-9560', 'JS-335', 'Other'],
  cotton: ['Bt Hybrid', 'Desi', 'Other'],
}

export const STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
]

export const HELPLINE = '1800-180-1551'

// Moisture above this is normally refused at the gate for foodgrains.
export const MAX_MOISTURE_PERCENT = 17
