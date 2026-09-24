import axios from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config.js'
import { readStorage, removeStorage, STORAGE_KEYS } from '../utils/storage.js'

/**
 * A single error shape for the whole app, so pages never have to know whether a
 * failure came from axios, the network, or the mock backend.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'error', fieldErrors = null, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.data = data
  }

  get isNetworkError() {
    return this.status === 0
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = readStorage(STORAGE_KEYS.TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Django REST Framework returns {"detail": "..."} for most errors and
// {"field": ["msg"]} for serializer errors. Normalise both.
function normaliseDjangoError(error) {
  if (!error.response) {
    return new ApiError(
      'Could not reach the server. Check your internet connection and try again.',
      { status: 0, code: 'network_error' },
    )
  }

  const { status, data } = error.response

  if (status === 401) {
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.USER)
    return new ApiError('Your session has ended. Please log in again.', {
      status,
      code: 'unauthenticated',
    })
  }

  let message = 'Something went wrong. Please try again.'
  let fieldErrors = null

  if (typeof data === 'string' && data) {
    message = data
  } else if (data && typeof data === 'object') {
    if (data.detail) {
      message = data.detail
    } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
      message = data.non_field_errors[0]
    } else {
      const entries = Object.entries(data).filter(([, value]) => value)
      if (entries.length) {
        fieldErrors = entries.reduce((acc, [field, value]) => {
          acc[field] = Array.isArray(value) ? value[0] : String(value)
          return acc
        }, {})
        message = fieldErrors[entries[0][0]]
      }
    }
  }

  if (status === 500) message = 'The server had a problem. Please try again in a few minutes.'

  return new ApiError(message, { status, code: data?.code || 'error', fieldErrors, data })
}

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normaliseDjangoError(error)),
)

export default httpClient
