import { useId } from 'react'
import Icon from './Icon.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

const baseControl =
  'w-full border bg-surface px-3 py-3 text-[16px] text-ink placeholder:text-muted/70 min-h-[48px] rounded ' +
  'disabled:bg-paper disabled:text-muted'

function controlClasses(hasError, extra = '') {
  return [
    baseControl,
    hasError ? 'border-danger-500' : 'border-line focus:border-brand-600',
    extra,
  ].join(' ')
}

// `hindiLabel` is still accepted so older callers keep working, but it is no
// longer shown: every label is now in the language the farmer chose.
// eslint-disable-next-line no-unused-vars
export function Field({ label, hindiLabel, hint, error, required, htmlFor, children, className = '' }) {
  const { t } = useI18n()
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}{' '}
        {required ? (
          <span className="ml-1 text-danger-500" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-sm font-normal text-muted">{t('common.optional')}</span>
        )}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="mb-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger-600">
          <Icon name="alert-circle" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput({
  label,
  hindiLabel,
  hint,
  error,
  required,
  name,
  prefix,
  className = '',
  ...rest
}) {
  const generatedId = useId()
  const id = rest.id || `${name}-${generatedId}`
  return (
    <Field
      label={label}
      hindiLabel={hindiLabel}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={className}
    >
      <div className={prefix ? 'flex' : undefined}>
        {prefix ? (
          <span className="flex min-h-[48px] items-center border border-r-0 border-line bg-paper px-3 text-[16px] font-medium text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          name={name}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined}
          className={controlClasses(error, prefix ? 'rounded-l-none' : '')}
          {...rest}
        />
      </div>
    </Field>
  )
}

export function SelectInput({
  label,
  hindiLabel,
  hint,
  error,
  required,
  name,
  options = [],
  placeholder,
  className = '',
  ...rest
}) {
  const { t } = useI18n()
  const generatedId = useId()
  const id = rest.id || `${name}-${generatedId}`
  return (
    <Field
      label={label}
      hindiLabel={hindiLabel}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={className}
    >
      <div className="relative">
        <select
          id={id}
          name={name}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined}
          className={controlClasses(error, 'appearance-none pr-10')}
          {...rest}
        >
          <option value="">{placeholder ?? t('common.select')}</option>
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const text = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
        <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
      </div>
    </Field>
  )
}

export function TextArea({ label, hindiLabel, hint, error, required, name, className = '', ...rest }) {
  const generatedId = useId()
  const id = rest.id || `${name}-${generatedId}`
  return (
    <Field
      label={label}
      hindiLabel={hindiLabel}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={3}
        aria-invalid={error ? 'true' : undefined}
        className={controlClasses(error, 'min-h-[96px]')}
        {...rest}
      />
    </Field>
  )
}

export function Checkbox({ label, hint, name, checked, onChange, className = '' }) {
  const generatedId = useId()
  const id = `${name}-${generatedId}`
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-5 w-5 shrink-0 border-line text-brand-600 accent-brand-600"
      />
      <label htmlFor={id} className="text-[15px] text-ink">
        <span className="font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-muted">{hint}</span> : null}
      </label>
    </div>
  )
}

export default Field
