import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import Masthead from './Masthead.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a href="#main" className="skip-link">
        {t('app.skipToContent')}
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
