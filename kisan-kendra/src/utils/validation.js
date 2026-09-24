import { MAX_MOISTURE_PERCENT } from './constants.js'
import { translate } from '../i18n/translate.js'

// Messages are looked up when a field is validated, so they come out in the
// language chosen at that moment. `required` takes a translation key for its
// label (e.g. 'fields.village'); an unknown key is shown as given.

export const required = (labelKey) => (value) =>
  value === undefined || value === null || String(value).trim() === ''
    ? translate('validation.required', { label: translate(labelKey) })
    : ''

export function validateMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return translate('validation.mobileEmpty')
  if (digits.length !== 10) return translate('validation.mobileLength')
  if (!/^[6-9]/.test(digits)) return translate('validation.mobileStart')
  return ''
}

export function validateOtp(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter the 6-digit OTP'
  if (digits.length !== 6) return 'OTP must be 6 digits'
  return ''
}

export function validatePassword(value) {
  const password = String(value || '')
  if (!password) return translate('validation.passwordEmpty')
  if (password.length < 8) return translate('validation.passwordShort')
  if (/^\d+$/.test(password)) return translate('validation.passwordNumeric')
  return ''
}

export function validateName(value) {
  const name = String(value || '').trim()
  if (!name) return translate('validation.nameEmpty')
  if (name.length < 3) return translate('validation.nameShort')
  // Latin, Devanagari, Tamil, Telugu and Kannada, so a farmer can type their
  // name in the script they chose. The backend accepts any text here.
  if (!/^[A-Za-z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u200C\u200D .'-]+$/.test(name)) return translate('validation.nameLetters')
  return ''
}

export function validateAadhaar(value, { optional = false } = {}) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return optional ? '' : 'Enter your 12-digit Aadhaar number'
  if (digits.length !== 12) return 'Aadhaar number must be 12 digits'
  return ''
}

export function validateAccountNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter your bank account number'
  if (digits.length < 9 || digits.length > 18) return 'Account number must be 9 to 18 digits'
  return ''
}

export function validateIfsc(value) {
  const code = String(value || '').trim().toUpperCase()
  if (!code) return 'Enter the IFSC code of your branch'
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) return 'IFSC looks incorrect. Example: SBIN0001234'
  return ''
}

export function validatePincode(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter your PIN code'
  if (digits.length !== 6) return 'PIN code must be 6 digits'
  return ''
}

export function validateQuantity(value, { max = 2000 } = {}) {
  if (value === '' || value === null || value === undefined) return 'Enter the quantity you want to sell'
  const quantity = Number(value)
  if (Number.isNaN(quantity)) return 'Quantity must be a number'
  if (quantity <= 0) return 'Quantity must be more than 0'
  if (quantity > max) return `Quantity cannot be more than ${max} quintal in one lot`
  return ''
}

export function validateMoisture(value) {
  if (value === '' || value === null || value === undefined) return 'Enter the moisture reading'
  const moisture = Number(value)
  if (Number.isNaN(moisture)) return 'Moisture must be a number'
  if (moisture < 5 || moisture > 40) return 'Moisture must be between 5% and 40%'
  return ''
}

export function moistureWarning(value) {
  const moisture = Number(value)
  if (Number.isNaN(moisture) || value === '') return ''
  return moisture > MAX_MOISTURE_PERCENT
    ? `Above ${MAX_MOISTURE_PERCENT}% moisture the centre can refuse the lot. Dry the crop before you come.`
    : ''
}

export function validateLandSize(value) {
  if (value === '' || value === null || value === undefined) return 'Enter your land holding'
  const acres = Number(value)
  if (Number.isNaN(acres)) return 'Land holding must be a number'
  if (acres <= 0) return 'Land holding must be more than 0'
  if (acres > 500) return 'Land holding cannot be more than 500 acres'
  return ''
}

/** Runs a { field: validatorFn } map and returns { field: message }. */
export function runValidators(values, validators) {
  const errors = {}
  Object.entries(validators).forEach(([field, validator]) => {
    const message = validator(values[field], values)
    if (message) errors[field] = message
  })
  return errors
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean)
