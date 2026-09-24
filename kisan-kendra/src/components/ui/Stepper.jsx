import Icon from './Icon.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

/**
 * Progress through the booking flow. Numbered because this genuinely is a
 * sequence: crop, centre, slot, token.
 */
export default function Stepper({ steps, current }) {
  const { t } = useI18n()
  return (
    <nav aria-label={t('common.bookingProgress')} className="print-hide">
      <ol className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={step} className="flex shrink-0 items-center gap-1">
              <span
                className={`flex items-center gap-2 border px-2.5 py-1.5 text-sm font-medium ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : done
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-line bg-surface text-muted'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs tnum">
                  {done ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
                </span>
                {step}
              </span>
              {index < steps.length - 1 ? <span className="h-px w-3 bg-line" aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
