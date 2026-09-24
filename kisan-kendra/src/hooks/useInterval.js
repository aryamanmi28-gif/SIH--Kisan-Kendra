import { useEffect, useRef } from 'react'

/** setInterval that always calls the latest callback and cleans itself up. */
export function useInterval(callback, delayMs) {
  const saved = useRef(callback)
  saved.current = callback

  useEffect(() => {
    if (!delayMs) return undefined
    const id = setInterval(() => saved.current(), delayMs)
    return () => clearInterval(id)
  }, [delayMs])
}

export default useInterval
