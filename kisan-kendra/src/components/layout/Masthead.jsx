import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Container from './Container.jsx'
import Icon from '../ui/Icon.jsx'
import { LanguageButton, ThemeToggle } from './DisplayControls.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { HELPLINE } from '../../utils/constants.js'

// /crops and /payments are hidden for this prototype (no backend support).
const PRIMARY_NAV = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/centres', key: 'nav.centres' },
  { to: '/queue', key: 'nav.queue' },
  { to: '/procurement', key: 'nav.procurement' },
]

const stripButton = 'min-h-[32px] px-2 text-white/85 hover:bg-white/10 hover:text-white'

function Wordmark() {
  const { t } = useI18n()
  return (
    <Link to="/" className="flex items-center gap-3 text-white">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/70">
        <Icon name="wheat" className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight sm:text-xl">Kisan Suvidha</span>
        <span className="block text-[13px] text-white/80">{t('app.tagline')}</span>
      </span>
    </Link>
  )
}

export default function Masthead() {
  const { isAuthenticated, user, logout } = useAuth()
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginMenuOpen, setLoginMenuOpen] = useState(false)
  const loginMenuRef = useRef(null)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  const handleRoleLogin = (path) => {
    setLoginMenuOpen(false)
    navigate(path)
  }

  useEffect(() => {
    if (!loginMenuOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!loginMenuRef.current?.contains(event.target)) setLoginMenuOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [loginMenuOpen])

  return (
    <header className="vt-masthead print-hide">
      <div className="bg-forest-900 text-white/85">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1 text-[13px]">
          <p className="py-1">{t('app.department')}</p>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <a
              href={`tel:${HELPLINE.replace(/-/g, '')}`}
              className="mr-2 flex items-center gap-1.5 py-1 hover:text-white"
            >
              <Icon name="phone" className="h-3.5 w-3.5" />
              {t('app.helpline', { number: HELPLINE })}
            </a>
            <LanguageButton className={stripButton} />
            <ThemeToggle className={`${stripButton} border-l border-white/20`} />
          </div>
        </Container>
      </div>

      <div className="bg-forest-800">
        <Container className="flex items-center justify-between gap-4 py-3">
          <Wordmark />

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 sm:flex"
                >
                  <Icon name="user" className="h-4 w-4" />
                  {user?.full_name?.split(' ')[0] || t('nav.profile')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 sm:flex"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <div ref={loginMenuRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setLoginMenuOpen((open) => !open)}
                    className="flex items-center gap-2 border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    aria-expanded={loginMenuOpen}
                    aria-haspopup="menu"
                  >
                    {t('nav.login')}
                    <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${loginMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {loginMenuOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-2 w-56 border border-line bg-surface p-1.5 text-ink shadow-xl" role="menu">
                      <button
                        type="button"
                        onClick={() => handleRoleLogin('/login')}
                        className="flex w-full items-center px-3 py-2.5 text-left text-sm font-semibold hover:bg-brand-50 hover:text-brand-700"
                        role="menuitem"
                      >
                        {t('nav.roleFarmer')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleLogin('/centre')}
                        className="flex w-full items-center px-3 py-2.5 text-left text-sm font-semibold hover:bg-brand-50 hover:text-brand-700"
                        role="menuitem"
                      >
                        {t('nav.roleOfficer')}
                      </button>
                    </div>
                  ) : null}
                </div>
                <Link
                  to="/register"
                  className="hidden bg-white px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-white/90 sm:block"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center border border-white/30 text-white lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </div>

      {isAuthenticated ? (
        <nav aria-label={t('nav.main')} className="hidden border-b border-line bg-surface lg:block">
          <Container>
            <ul className="flex flex-wrap items-center">
              {PRIMARY_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block border-b-[3px] px-4 py-3 text-[15px] font-medium ${
                        isActive
                          ? 'border-brand-600 text-brand-700'
                          : 'border-transparent text-ink hover:border-line hover:text-brand-700'
                      }`
                    }
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      ) : null}

      {menuOpen ? (
        <div id="mobile-menu" className="border-b border-line bg-surface lg:hidden">
          <Container className="py-2">
            <ul className="divide-y divide-line">
              {(isAuthenticated ? PRIMARY_NAV : []).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 text-[16px] font-medium ${
                        isActive ? 'text-brand-700' : 'text-ink'
                      }`
                    }
                  >
                    {t(item.key)}
                    <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                  </NavLink>
                </li>
              ))}
              {isAuthenticated ? (
                <>
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                    >
                      {t('nav.myProfile')}
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </NavLink>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between py-3 text-left text-[16px] font-medium text-danger-600"
                    >
                      {t('nav.logout')}
                      <Icon name="logout" className="h-5 w-5" />
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                    >
                      {t('nav.roleFarmer')}
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/centre"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                    >
                      {t('nav.roleOfficer')}
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-brand-700"
                    >
                      {t('nav.registerFarmer')}
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/help"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                >
                  {t('nav.help')}
                  <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                </Link>
              </li>
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
