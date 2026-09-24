import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { TextInput, SelectInput } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { STATES } from '../utils/constants.js'
import { validateMobile, validateName, validatePassword, required } from '../utils/validation.js'
import { translate } from '../i18n/translate.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

// Fields here match FarmerRegistrationSerializer exactly (full_name,
// phone_number, village, district, state, password). The backend has no
// Aadhaar, land-record or bank-account fields, so this form no longer
// collects them — see PS 26032 Phase 8 notes.
const initialValues = {
  fullName: '',
  mobile: '',
  village: '',
  district: '',
  state: '',
  password: '',
  confirmPassword: '',
}

const validators = {
  fullName: validateName,
  mobile: validateMobile,
  village: required('fields.village'),
  district: required('fields.district'),
  state: required('fields.state'),
  password: validatePassword,
  confirmPassword: (value, values) => (value !== values.password ? translate('validation.passwordMismatch') : ''),
}

export default function Register() {
  const { t, tServer } = useI18n()
  useDocumentTitle(t('register.docTitle'))
  const navigate = useNavigate()
  const { register } = useAuth()
  const { notify } = useToast()

  const form = useForm({
    initialValues,
    validators,
    onSubmit: async (values, { setFieldError, setFormError }) => {
      try {
        const user = await register({
          full_name: values.fullName,
          phone_number: values.mobile,
          village: values.village,
          district: values.district,
          state: values.state,
          password: values.password,
        })
        notify(t('register.welcome', { name: user.full_name.split(' ')[0] }), 'success', 7000)
        navigate('/dashboard', { replace: true })
      } catch (error) {
        if (error.fieldErrors) {
          const fieldMap = { full_name: 'fullName', phone_number: 'mobile' }
          Object.entries(error.fieldErrors).forEach(([field, message]) =>
            setFieldError(fieldMap[field] || field, tServer(message)),
          )
        }
        setFormError(tServer(error.message))
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
  })

  const bind = (field) => ({
    name: field,
    value: form.values[field],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.fieldError(field),
  })

  return (
    <Container className="max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">
        {t('register.title')}
      </h1>
      <p className="mt-1.5 max-w-[60ch] text-[15px] text-muted">
        {t('register.lead')}
      </p>

      {form.formError ? (
        <Alert tone="danger" title={t('register.failed')} className="mt-5">
          {form.formError}
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit} noValidate className="mt-6 space-y-6">
        <Card>
          <CardHeader title={t('register.yourDetails')} />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label={t('fields.fullName')}
              required
              autoComplete="name"
              placeholder="Ramesh Kumar"
              {...bind('fullName')}
            />
            <TextInput
              label={t('fields.mobile')}
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              prefix="+91"
              autoComplete="tel-national"
              hint={t('register.mobileHint')}
              {...bind('mobile')}
              onChange={(event) => form.setValue('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('register.villageTitle')} subtitle={t('register.villageSubtitle')} />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput label={t('fields.village')} required {...bind('village')} />
            <TextInput label={t('fields.district')} required {...bind('district')} />
            <SelectInput
              label={t('fields.state')}
              required
              options={STATES.map((state) => ({ value: state, label: t(`states_list.${state}`) }))}
              placeholder={t('register.selectState')}
              className="sm:col-span-2"
              {...bind('state')}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('register.passwordTitle')} subtitle={t('register.passwordSubtitle')} />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label={t('fields.password')}
              required
              type="password"
              autoComplete="new-password"
              {...bind('password')}
            />
            <TextInput
              label={t('fields.confirmPassword')}
              required
              type="password"
              autoComplete="new-password"
              {...bind('confirmPassword')}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Button type="submit" size="lg" fullWidth loading={form.submitting}>
              {form.submitting ? t('register.submitting') : t('register.submit')}
            </Button>
            <p className="mt-3 text-[15px] text-muted">
              {t('register.already')}{' '}
              <Link to="/login" className="font-semibold text-brand-700 underline">
                {t('register.loginLink')}
              </Link>
            </p>
          </CardBody>
        </Card>
      </form>
    </Container>
  )
}
