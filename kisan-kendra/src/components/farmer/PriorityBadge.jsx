import Badge from '../ui/Badge.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { TIER_TONE, tierForCrop } from '../../utils/priority.js'

/** "High priority" / "Medium priority" / "Standard" for a crop or a tier. */
export default function PriorityBadge({ cropCode, tier: tierProp, className = '' }) {
  const { t } = useI18n()
  const tier = tierProp || tierForCrop(cropCode)
  if (!tier) return null
  return (
    <Badge tone={TIER_TONE[tier]} dot className={className}>
      {t(`priority.tier.${tier}`)}
    </Badge>
  )
}
