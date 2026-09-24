import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { runViewTransition } from '../../utils/viewTransition.js'

/**
 * Page transitions without changing how routing works.
 *
 * The router moves to the new URL straight away, exactly as before. What is
 * *shown* (`displayLocation`) follows it inside a View Transition: the
 * browser snapshots the old screen, React renders the new route, and the CSS
 * in index.css plays the field wipe between the two snapshots (forward on a
 * link, reversed on Back). Browsers without View Transitions, and anyone with
 * reduced motion switched on, get the new page immediately, with a quiet
 * rise-in from the `page-enter` class instead.
 *
 * Nothing here touches data, API calls or route matching.
 */

const RouterLocationContext = createContext(null)

/** Where the router actually is, even while the old page is still on screen. */
export const useRouterLocation = () => useContext(RouterLocationContext)

export function RouterLocationProvider({ value, children }) {
  return <RouterLocationContext.Provider value={value}>{children}</RouterLocationContext.Provider>
}

export function useTransitionedLocation() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [displayLocation, setDisplayLocation] = useState(location)
  const shownRef = useRef(location)
  const transitionCount = useRef(0)

  useLayoutEffect(() => {
    if (location.key === shownRef.current.key) return
    const previous = shownRef.current
    shownRef.current = location

    // Same page, new query string or state: swap without a wipe.
    if (location.pathname === previous.pathname) {
      setDisplayLocation(location)
      return
    }

    const isBack = navigationType === 'POP'
    const root = document.documentElement
    const id = ++transitionCount.current
    root.dataset.navDir = isBack ? 'back' : 'forward'
    const clearDirection = () => {
      if (id === transitionCount.current) delete root.dataset.navDir
    }

    const transition = runViewTransition('vt-page', () => {
      setDisplayLocation(location)
      // A new page starts at the top; Back keeps the browser's own scroll.
      if (!isBack) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
    if (transition) transition.finished.finally(clearDirection)
    else clearDirection()
  }, [location, navigationType])

  return { location, displayLocation }
}
