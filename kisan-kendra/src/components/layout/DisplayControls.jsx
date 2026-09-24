import Icon from '../ui/Icon.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

/** Sun/moon switch. The new theme spreads out from this button. */
export function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const label = isDark ? t('theme.toLight') : t('theme.toDark')
  return (
    <button
      type="button"
      onClick={(event) => toggleTheme(event)}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
      {showLabel ? <span>{isDark ? t('theme.light') : t('theme.dark')}</span> : null}
    </button>
  )
}

/** Opens the language chooser; shows the current language in its own script. */
export function LanguageButton({ className = '' }) {
  const { meta, openPicker, t } = useI18n()
  return (
    <button
      type="button"
      onClick={openPicker}
      aria-label={`${t('language.change')}: ${meta.native}`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <Icon name="language" className="h-4 w-4" />
      <span>{meta.native}</span>
    </button>
  )
}
