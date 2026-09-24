import { Link } from 'react-router-dom'
import Container from './Container.jsx'
import { HELPLINE } from '../../utils/constants.js'
import { useI18n } from '../../i18n/I18nProvider.jsx'

export default function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="print-hide mt-12 border-t border-line bg-surface">
      <Container className="grid gap-6 py-8 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-ink">Kisan Suvidha</p>
          <p className="mt-1 text-sm text-muted">
            {t('footer.about')}
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">{t('footer.needHelp')}</p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            <li>
              {t('footer.helplineLabel')}{' '}
              <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="font-medium text-brand-700 underline">
                {HELPLINE}
              </a>
            </li>
            <li>{t('footer.hours')}</li>
            <li>
              <Link to="/help" className="font-medium text-brand-700 underline">
                {t('footer.rules')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink">{t('footer.aboutService')}</p>
          <p className="mt-1 text-sm text-muted">
            {t('footer.aboutServiceText')}
          </p>
        </div>
      </Container>
      <div className="border-t border-line bg-paper py-3">
        <Container>
          <p className="text-sm text-muted">
            {t('footer.owner')}
          </p>
        </Container>
      </div>
    </footer>
  )
}
