import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import Masthead from './Masthead.jsx'
import SiteFooter from './SiteFooter.jsx'
import BottomNav from './BottomNav.jsx'
import Container from './Container.jsx'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a href="#main" className="skip-link">
        {t('app.skipToContent')}
      </a>
      <Masthead />
      <main id="main" className="flex-1 pb-24 pt-5 sm:pt-6 lg:pb-8">
        {/* Keyed by path so browsers without View Transitions still get an entrance. */}
        <Container key={pathname} className="page-enter">
          <Outlet />
        </Container>
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  )
}
