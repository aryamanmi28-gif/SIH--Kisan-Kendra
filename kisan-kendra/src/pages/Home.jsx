import { Link } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'
import { CROPS, HELPLINE } from '../utils/constants.js'
import { formatCurrency } from '../utils/format.js'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function Home() {
  const { t, tRaw } = useI18n()
  useDocumentTitle(t('home.docTitle'))
  const { isAuthenticated } = useAuth()
  const steps = tRaw('home.steps')
  const keepReady = tRaw('home.keepReadyItems')

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="py-3">
          <Alert tone="warning" title={t('home.bannerTitle')}>{t('home.bannerText')}</Alert>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h1 className="hero-title max-w-[18ch] text-3xl font-bold leading-tight text-ink sm:text-[40px]">
              {t('home.title')}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink/85">
              {t('home.lead')}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button to="/dashboard" size="lg">
                  {t('home.goDashboard')}
                </Button>
              ) : (
                <>
                  <Button to="/register" size="lg">
                    {t('nav.registerFarmer')}
                  </Button>
                  <Button to="/login" variant="secondary" size="lg">
                    {t('home.loginMobile')}
                  </Button>
                </>
              )}
            </div>
            {isAuthenticated ? null : (
              <p className="mt-3 text-[15px] text-muted">
                <Link to="/centre" className="font-semibold text-brand-700 underline">
                  {t('home.officerSignIn')}
                </Link>
              </p>
            )}
            <p className="mt-3 text-[15px] text-muted">
              {t('home.alreadyBooked')}{' '}
              <Link to={isAuthenticated ? '/queue' : '/login'} className="font-semibold text-brand-700 underline">
                {t('home.checkToken')}
              </Link>
            </p>

            <h2 className="mt-12 text-xl font-semibold text-ink">{t('home.howItWorks')}</h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-brand-600 text-[15px] font-bold text-brand-700 tnum">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[15px] text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader
                title={t('home.mspTitle')}
                subtitle={t('home.mspSubtitle')}
                icon={<Icon name="rupee" className="h-5 w-5 text-brand-600" />}
              />
              <CardBody className="p-0 sm:p-0">
                <table className="w-full">
                  <caption className="sr-only">{t('home.mspCaption')}</caption>
                  <tbody className="divide-y divide-line">
                    {CROPS.slice(0, 6).map((crop) => (
                      <tr key={crop.code}>
                        <th scope="row" className="px-4 py-2.5 text-left text-[15px] font-medium text-ink">
                          <span className="block">{t(`crops.${crop.code}`)}</span>
                          <PriorityBadge cropCode={crop.code} className="mt-1 text-xs" />
                        </th>
                        <td className="px-4 py-2.5 text-right font-semibold text-ink tnum">
                          {formatCurrency(crop.msp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-line px-4 py-2.5 text-sm text-muted">
                  {t('priority.homeLegend')} {t('home.mspNote')}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={t('home.keepReady')}
                icon={<Icon name="list" className="h-5 w-5 text-brand-600" />}
              />
              <CardBody>
                <ul className="space-y-2.5">
                  {keepReady.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] text-ink/90">
                      <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-brand-600">
              <CardBody>
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                  <Icon name="phone" className="h-5 w-5 text-brand-600" />
                  {t('home.troubleTitle')}
                </h2>
                <p className="mt-1 text-[15px] text-muted">
                  {t('home.troubleText')}
                </p>
                <a
                  href={`tel:${HELPLINE.replace(/-/g, '')}`}
                  className="mt-3 inline-block text-2xl font-bold text-brand-700 tnum"
                >
                  {HELPLINE}
                </a>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
}
