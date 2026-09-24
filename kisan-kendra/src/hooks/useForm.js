import { useCallback, useState } from 'react'
import { runValidators, hasErrors } from '../utils/validation.js'

/**
 * Small controlled-form helper: values, per-field errors, touched state and a
 * submit guard. Fields validate on blur and on submit, never on every keypress,
 * so a half-typed mobile number does not turn red.
 */
export function useForm({ initialValues, validators = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const setValue = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: '' } : current))
  }, [])

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target
      setValue(name, type === 'checkbox' ? checked : value)
    },
    [setValue],
  )

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target
      setTouched((current) => ({ ...current, [name]: true }))
      const validator = validators[name]
      if (validator) {
        setValues((current) => {
          const message = validator(current[name], current)
          setErrors((existing) => ({ ...existing, [name]: message }))
          return current
        })
      }
    },
    [validators],
  )

  const validateAll = useCallback(() => {
    const nextErrors = runValidators(values, validators)
    setErrors(nextErrors)
    setTouched(Object.keys(validators).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    return !hasErrors(nextErrors)
  }, [values, validators])

  const handleSubmit = useCallback(
    async (event) => {
      if (event?.preventDefault) event.preventDefault()
      if (submitting) return
      setFormError('')
      if (!validateAll()) {
        // Move the farmer to the first thing that needs fixing.
        const firstInvalid = document.querySelector('[aria-invalid="true"]')
        if (firstInvalid) firstInvalid.focus({ preventScroll: false })
        return
      }
      setSubmitting(true)
      try {
        await onSubmit(values, { setFieldError: (field, message) => setErrors((c) => ({ ...c, [field]: message })), setFormError })
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, validateAll, onSubmit, values],
  )

  const reset = useCallback(
    (nextValues = initialValues) => {
      setValues(nextValues)
      setErrors({})
      setTouched({})
      setFormError('')
    },
    [initialValues],
  )

  return {
    values,
    errors,
    touched,
    submitting,
    formError,
    setFormError,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    fieldError: (name) => (touched[name] ? errors[name] : ''),
  }
}
