import { USE_MOCK_API } from './config.js'

/**
 * Binds a live endpoint to its mock stand-in.
 *
 *   export const listCentres = route(mock.listCentres, (params) =>
 *     httpClient.get(ENDPOINTS.centres.list, { params }))
 *
 * Flip VITE_USE_MOCK_API to "false" and every call goes to Django instead.
 * There is deliberately no silent fallback: if the real API fails, the UI must
 * show the failure rather than quietly serve fake data.
 */
export function route(mockFn, liveFn) {
  return (...args) => (USE_MOCK_API ? mockFn(...args) : liveFn(...args))
}

export { USE_MOCK_API }
