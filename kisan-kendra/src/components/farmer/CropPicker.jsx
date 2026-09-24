import PriorityBadge from './PriorityBadge.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { cropsByTier, tierForCrop } from '../../utils/priority.js'

/**
 * Crop choice for a booking, laid out by priority tier so the farmer sees
 * straight away which crops are served first. Tapping the chosen crop again
 * clears it; the choice is optional.
 */
export default function CropPicker({ value, onChange }) {
  const { t } = useI18n()
  const tier = tierForCrop(value)

  return (
    <div>
      <div className="divide-y divide-line border-y border-line">
        {cropsByTier().map((group) => (
          <div key={group.tier} className="grid gap-2 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
            <div>
              <PriorityBadge tier={group.tier} />
              <p className="mt-1 text-sm text-muted">{t(`priority.short.${group.tier}`)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.crops.map((crop) => {
                const selected = value === crop.code
                return (
                  <button
                    key={crop.code}
                    type="button"
                    onClick={() => onChange(selected ? '' : crop.code)}
                    aria-pressed={selected}
                    className={`min-h-[44px] border px-3 py-2 text-[15px] font-medium ${
                      selected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-line bg-surface text-ink hover:border-brand-600'
                    }`}
                  >
                    {t(`crops.${crop.code}`)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {tier ? (
        <p className="mt-3 flex items-start gap-2 text-[15px] text-ink/90" role="status">
          <PriorityBadge tier={tier} className="shrink-0" />
          <span>{t(`priority.reason.${tier}`)}</span>
        </p>
      ) : null}
    </div>
  )
}
