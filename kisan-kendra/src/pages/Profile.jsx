import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Badge from '../components/ui/Badge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { HELPLINE } from '../utils/constants.js'
import { formatDate, formatMobile } from '../utils/format.js'

/**
 * Read-only for now: the backend only exposes GET /auth/me/ — there is no
 * endpoint to edit a farmer's profile, and Farmer has no bank-account fields
 * at all, so the old edit forms and bank section have no backend to save to.
 *
 * Language and theme are display preferences kept on the phone, so they can
 * be changed here without any API.
 */
export default function Profile() {
  const { t, meta, openPicker } = useI18n()
  const { isDark, setTheme } = useTheme()
  useDocumentTitle(t('profile.docTitle'))
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        description={t('profile.registeredOn', { date: formatDate(user.created_at) })}
        actions={
          <Button variant="danger" size="sm" onClick={handleLogout} icon={<Icon name="logout" className="h-4 w-4" />}>
            {t('nav.logout')}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title={t('profile.yourDetails')} />
            <CardBody>
              <DetailList
                items={[
                  { label: t('profile.name'), value: user.full_name },
                  { label: t('profile.mobile'), value: `+91 ${formatMobile(user.phone_number)}` },
                  { label: t('profile.farmerId'), value: user.id },
                  { label: t('profile.village'), value: user.village },
                  { label: t('profile.district'), value: `${user.district}, ${user.state}` },
                ]}
              />
              <div className="mt-4">
                {user.is_verified ? (
                  <Badge tone="success" dot>
                    {t('profile.verified')}
                  </Badge>
                ) : (
                  <Badge tone="warning" dot>
                    {t('profile.notVerified')}
                  </Badge>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('profile.settingsTitle')} />
            <CardBody className="space-y-5">
              <div>
                <p className="text-sm text-muted">{t('profile.languageLabel')}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-ink">{meta.native}</span>
                  <Button variant="secondary" size="sm" onClick={openPicker} icon={<Icon name="language" className="h-4 w-4" />}>
                    {t('language.change')}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted">{t('profile.themeLabel')}</p>
                <div className="mt-1.5 inline-flex border border-line" role="group" aria-label={t('profile.themeLabel')}>
                  {[
                    { value: 'light', icon: 'sun', label: t('theme.light') },
                    { value: 'dark', icon: 'moon', label: t('theme.dark') },
                  ].map((option) => {
                    const active = (option.value === 'dark') === isDark
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={(event) => setTheme(option.value, event)}
                        className={`inline-flex min-h-[44px] items-center gap-2 px-4 text-[15px] font-semibold ${
                          active ? 'bg-brand-600 text-white' : 'bg-surface text-ink hover:bg-paper'
                        }`}
                      >
                        <Icon name={option.icon} className="h-4 w-4" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title={t('profile.needHelp')} />
            <CardBody>
              <p className="text-[15px] text-muted">{t('profile.helpText')}</p>
              <a
                href={`tel:${HELPLINE.replace(/-/g, '')}`}
                className="mt-2 inline-block text-xl font-bold text-brand-700 tnum"
              >
                {HELPLINE}
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
