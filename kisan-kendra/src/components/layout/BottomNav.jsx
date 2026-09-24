import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

const TABS = [
  { to: '/dashboard', key: 'bottomNav.home', icon: 'home' },
  { to: '/centres', key: 'bottomNav.centres', icon: 'map-pin' },
  { to: '/queue', key: 'bottomNav.queue', icon: 'ticket' },
  { to: '/procurement', key: 'bottomNav.procurement', icon: 'scale' },
  { to: '/profile', key: 'bottomNav.profile', icon: 'user' },
]

/** Thumb-reachable navigation for the five things a farmer opens most. */
export default function BottomNav() {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t('nav.quick')}
      className="vt-bottomnav print-hide fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex min-h-[58px] flex-col items-center justify-center gap-0.5 border-t-[3px] px-1 py-1.5 text-center text-xs font-medium leading-tight ${
                  isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted'
                }`
              }
            >
              <Icon name={tab.icon} className="h-6 w-6" />
              <span className="line-clamp-2 break-words">{t(tab.key)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
