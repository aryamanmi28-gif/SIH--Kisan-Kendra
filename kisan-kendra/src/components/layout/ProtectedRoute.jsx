import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LoadingState } from '../ui/States.jsx'
import Container from './Container.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { useRouterLocation } from './RouteTransition.jsx'

export default function ProtectedRoute() {
  const { isAuthenticated, restoring } = useAuth()
  // `location` is the page on screen; `routerLocation` is where the router
  // already is. They differ only for the instant a page transition is
  // capturing the old screen.
  const location = useLocation()
  const routerLocation = useRouterLocation()
  const { t } = useI18n()

  if (restoring) {
    return (
      <Container className="py-16">
        <LoadingState label={t('common.checkingLogin')} />
      </Container>
    )
  }

  if (!isAuthenticated) {
    // A navigation is already in flight (e.g. "Log out" sent the farmer to
    // the home page) while the transition still shows the old page. Render
    // nothing for that frame: re-rendering <Navigate> would redirect to
    // /login a second time, and re-rendering the page would re-mount it and
    // fire its API calls without a token.
    if (routerLocation && routerLocation.key !== location.key) return null
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
