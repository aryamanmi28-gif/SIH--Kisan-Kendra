import { SelectInput } from '../ui/Field.jsx'
import PriorityBadge from './PriorityBadge.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { CROPS } from '../../utils/constants.js'

/**
 * Lets a farmer attach a crop to a booking made on another phone (or before
 * the priority lane existed). Stored locally; never sent to the server.
 */
export default function BookingCropField({ value, onChange, className = '' }) {
  const { t } = useI18n()
  return (
    <div className={`print-hide ${className}`}>
      <SelectInput
        label={t('priority.cropForBooking')}
        name="bookingCrop"
        hint={t('priority.cropForBookingHint')}
        placeholder={t('priority.chooseCrop')}
        options={CROPS.map((crop) => ({ value: crop.code, label: t(`crops.${crop.code}`) }))}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? <PriorityBadge cropCode={value} className="mt-2" /> : null}
    </div>
  )
}
