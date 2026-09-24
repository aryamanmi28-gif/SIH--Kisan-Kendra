import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

export default function Modal({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="print-hide fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg border border-line bg-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label={t('common.close')}>
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>
        <div className="px-5 py-4 text-[15px] text-ink/90">{children}</div>
        {footer ? <div className="border-t border-line bg-paper px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
