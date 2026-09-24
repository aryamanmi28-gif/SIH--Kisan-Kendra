import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs a request on mount and exposes the three states every screen needs:
 * loading, error and data. `deps` behaves like a useEffect dependency list.
 */
export function useApi(requestFn, deps = [], { skip = false, pollMs = 0 } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const mounted = useRef(true)
  const requestRef = useRef(requestFn)
  requestRef.current = requestFn

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (skip) return null
      if (!quiet) setLoading(true)
      try {
        const result = await requestRef.current()
        if (mounted.current) {
          setData(result)
          setError(null)
        }
        return result
      } catch (err) {
        if (mounted.current) setError(err)
        return null
      } finally {
        if (mounted.current && !quiet) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skip, ...deps],
  )

  useEffect(() => {
    load()
  }, [load])

  // Background refresh keeps the queue and payment screens current without
  // flashing a spinner over data the farmer is already reading.
  useEffect(() => {
    if (!pollMs || skip) return undefined
    const id = setInterval(() => load({ quiet: true }), pollMs)
    return () => clearInterval(id)
  }, [pollMs, skip, load])

  return { data, error, loading, refetch: load, setData }
}

/**
 * One-shot actions (book, check in, cancel, save). The in-flight ref is what
 * stops a double tap from creating two bookings.
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inFlight = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const mutate = useCallback(
    async (...args) => {
      if (inFlight.current) return { ok: false, ignored: true }
      inFlight.current = true
      setLoading(true)
      setError(null)
      try {
        const data = await mutationFn(...args)
        return { ok: true, data }
      } catch (err) {
        if (mounted.current) setError(err)
        return { ok: false, error: err }
      } finally {
        inFlight.current = false
        if (mounted.current) setLoading(false)
      }
    },
    [mutationFn],
  )

  return { mutate, loading, error, setError, isSubmitting: loading }
}
