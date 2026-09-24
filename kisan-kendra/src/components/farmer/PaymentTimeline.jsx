import Icon from '../ui/Icon.jsx'
import { PAYMENT_STAGES } from '../../utils/constants.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * Procurement completed -> Payment initiated -> DBT processing -> Credited.
 * Reached stages carry a timestamp; the current stage says what is happening
 * now; later stages stay quiet rather than looking broken.
 */
export default function PaymentTimeline({ stages = [], failed = false }) {
  const reached = new Map(stages.map((stage) => [stage.key, stage.at]))
  const currentIndex = PAYMENT_STAGES.reduce(
    (last, stage, index) => (reached.has(stage.key) ? index : last),
    -1,
  )

  return (
    <ol className="relative">
      {PAYMENT_STAGES.map((stage, index) => {
        const done = reached.has(stage.key)
        const isCurrent = index === currentIndex && currentIndex < PAYMENT_STAGES.length - 1
        const isLast = index === PAYMENT_STAGES.length - 1
        const isFailedHere = failed && isCurrent

        return (
          <li key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                  isFailedHere
                    ? 'border-danger-500 bg-danger-500 text-white'
                    : done
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-white text-muted'
                }`}
              >
                {isFailedHere ? (
                  <Icon name="close" className="h-5 w-5" strokeWidth={2.4} />
                ) : done ? (
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-line" />
                )}
              </span>
              {!isLast ? (
                <span
                  className={`w-0.5 flex-1 ${index < currentIndex ? 'bg-brand-600' : 'bg-line'}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <div className="flex flex-wrap items-center gap-x-3">
                <p className={`text-[16px] font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{stage.label}</p>
                {isCurrent && !failed ? (
                  <span className="flex items-center gap-1.5 border border-grain-200 bg-grain-50 px-2 py-0.5 text-sm font-medium text-grain-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-grain-500 animate-pulseDot" />
                    In progress
                  </span>
                ) : null}
              </div>
              {done ? (
                <p className="mt-0.5 text-sm text-muted tnum">{formatDateTime(reached.get(stage.key))}</p>
              ) : null}
              <p className={`mt-1 text-[15px] ${done || isCurrent ? 'text-ink/80' : 'text-muted'}`}>{stage.hint}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
