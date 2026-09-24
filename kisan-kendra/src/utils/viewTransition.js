import { flushSync } from 'react-dom'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const supportsViewTransitions = () =>
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function'

/**
 * Runs a React state update inside a View Transition when the browser has
 * them and the person has not asked for reduced motion; otherwise just runs
 * it. `kind` is added as a class on <html> for the duration, which is how the
 * CSS picks the choreography (vt-page, vt-theme, vt-lang).
 *
 * Returns the ViewTransition, or null when it ran without one.
 */
export function runViewTransition(kind, update) {
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    update()
    return null
  }
  const root = document.documentElement
  root.classList.add(kind)
  const transition = document.startViewTransition(() => {
    flushSync(update)
  })
  transition.finished.finally(() => root.classList.remove(kind))
  return transition
}
