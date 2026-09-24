import { useI18n } from '../../i18n/I18nProvider.jsx'

/** The large token number. Used on the confirmation slip and the tracker. */
export default function TokenPlate({ tokenNumber, caption, size = 'lg' }) {
  const { t } = useI18n()
  return (
    <div className={`border-2 border-forest-800 bg-forest-800 px-5 text-center text-white ${size === 'lg' ? 'py-5' : 'py-3'}`}>
      <p className="text-sm font-medium text-white/80">{caption ?? t('queue.yourToken')}</p>
      <p className={`font-bold tnum leading-none ${size === 'lg' ? 'mt-2 text-[56px]' : 'mt-1 text-4xl'}`}>
        #{tokenNumber}
      </p>
    </div>
  )
}
