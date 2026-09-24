import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'

const ToastContext = createContext(null)

const TONE_STYLES = {
  success: 'border-brand-600 bg-brand-50 text-brand-800',
  error: 'border-danger-500 bg-danger-50 text-danger-600',
  info: 'border-steel-500 bg-steel-50 text-steel-600',
}

const TONE_ICON = { success: 'check-circle', error: 'alert-circle', info: 'info' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const { t } = useI18n()

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message, tone = 'success', timeout = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current, { id, message, tone }])
      if (timeout) setTimeout(() => dismiss(id), timeout)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="vt-toasts print-hide pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-3"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 border-l-4 bg-surface px-4 py-3 shadow-md ${TONE_STYLES[toast.tone] || TONE_STYLES.info}`}
          >
            <Icon name={TONE_ICON[toast.tone] || 'info'} className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-muted hover:text-ink"
              aria-label={t('common.dismiss')}
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
