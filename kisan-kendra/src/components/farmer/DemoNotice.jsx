import { USE_MOCK_API } from '../../api/config.js'
import Alert from '../ui/Alert.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'

/**
 * Visible only while the app runs on the in-browser mock backend, so nobody
 * mistakes simulated queue movement for a live centre.
 */
export default function DemoNotice({ children, className = '' }) {
  const { t } = useI18n()
  if (!USE_MOCK_API) return null
  return (
    <Alert tone="info" title={t('demo.title')} className={className}>
      {children || t('demo.text')}
    </Alert>
  )
}
