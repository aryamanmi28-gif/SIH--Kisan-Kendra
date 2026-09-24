import { useLocation, useNavigate, Link } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { TextInput } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { validateMobile, required } from '../utils/validation.js'
import { HELPLINE } from '../utils/constants.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function Login() {
  const { t, tServer } = useI18n()
  useDocumentTitle(t('login.docTitle'))
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { notify } = useToast()

  const redirectTo = location.state?.from || '/dashboard'

  const form = useForm({
    initialValues: { mobile: '', password: '' },
    validators: { mobile: validateMobile, password: required('fields.password') },
    onSubmit: async (values, { setFormError }) => {
      try {
        const user = await login(values.mobile, values.password)
        notify(t('login.welcome', { name: user.full_name.split(' ')[0] }), 'success')
        navigate(redirectTo, { replace: true })
      } catch (error) {
        setFormError(tServer(error.message))
      }
    },
  })

  return (
    <Container className="max-w-xl py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">
        {t('login.title')}
      </h1>
      <p className="mt-1.5 text-[15px] text-muted">
        {t('login.lead')}
      </p>

      <Card className="mt-6">
        <CardHeader title={t('login.cardTitle')} />
        <CardBody>
          <form onSubmit={form.handleSubmit} noValidate>
            {form.formError ? (
              <Alert tone="danger" className="mb-4">
                {form.formError}
              </Alert>
            ) : null}

            <TextInput
              label={t('fields.mobile')}
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              prefix="+91"
              required
              placeholder={t('login.mobilePlaceholder')}
              value={form.values.mobile}
              onChange={(event) => form.setValue('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={form.handleBlur}
              error={form.fieldError('mobile')}
            />

            <TextInput
              label={t('fields.password')}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-5"
              value={form.values.password}
              onChange={(event) => form.setValue('password', event.target.value)}
              onBlur={form.handleBlur}
              error={form.fieldError('password')}
            />

            <Button type="submit" size="lg" fullWidth className="mt-5" loading={form.submitting}>
              {form.submitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[15px] text-ink">
          {t('login.newHere')}{' '}
          <Link to="/register" className="font-semibold text-brand-700 underline">
            {t('nav.registerFarmer')}
          </Link>
        </p>
        <p className="mt-2 text-[15px] text-muted">
          {t('login.cannotLogin')}{' '}
          <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="font-semibold text-brand-700 underline tnum">
            {HELPLINE}
          </a>
          .
        </p>
      </div>
    </Container>
  )
}
