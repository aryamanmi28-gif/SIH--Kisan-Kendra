import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function NotFound() {
  const { t } = useI18n()
  useDocumentTitle(t('notFound.docTitle'))
  const { isAuthenticated } = useAuth()

  return (
    <Container className="max-w-xl py-16 text-center">
      <Icon name="alert-circle" className="mx-auto h-10 w-10 text-muted" />
      <h1 className="mt-4 text-2xl font-bold text-ink">{t('notFound.title')}</h1>
      <p className="mx-auto mt-2 text-[15px] text-muted">
        {t('notFound.text')}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to={isAuthenticated ? '/dashboard' : '/'} size="lg">
          {isAuthenticated ? t('notFound.goDashboard') : t('notFound.goHome')}
        </Button>
        <Button to="/help" variant="secondary" size="lg">
          {t('notFound.help')}
        </Button>
      </div>
    </Container>
  )
}
