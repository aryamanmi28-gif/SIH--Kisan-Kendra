import Container from '../components/layout/Container.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PriorityBadge from '../components/farmer/PriorityBadge.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { HELPLINE, MAX_MOISTURE_PERCENT } from '../utils/constants.js'
import { cropsByTier } from '../utils/priority.js'

export default function Help() {
  const { t, tRaw } = useI18n()
  useDocumentTitle(t('help.docTitle'))
  const rules = tRaw('help.rules')

  return (
    <Container className="max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{t('help.title')}</h1>
      <p className="mt-1.5 text-[15px] text-muted">{t('help.lead')}</p>

      <div className="mt-6 space-y-4">
        {rules.map((rule) => (
          <Card key={rule.q}>
            <CardHeader title={rule.q} />
            <CardBody>
              <p className="text-[15px] text-ink/90">{rule.a.replace('{moisture}', MAX_MOISTURE_PERCENT)}</p>
            </CardBody>
          </Card>
        ))}

        <Card className="border-l-4 border-l-grain-500">
          <CardHeader title={t('priority.helpQuestion')} />
          <CardBody>
            <p className="text-[15px] text-ink/90">{t('priority.helpAnswer')}</p>
            <table className="mt-4 w-full border-t border-line">
              <caption className="sr-only">{t('priority.helpTableTitle')}</caption>
              <tbody className="divide-y divide-line">
                {cropsByTier().map((group) => (
                  <tr key={group.tier} className="align-top">
                    <th scope="row" className="w-[40%] py-3 pr-3 text-left font-normal">
                      <PriorityBadge tier={group.tier} />
                      <span className="mt-1 block text-sm text-muted">{t(`priority.short.${group.tier}`)}</span>
                    </th>
                    <td className="py-3 text-[15px] text-ink">
                      {group.crops.map((crop) => t(`crops.${crop.code}`)).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6 border-l-4 border-l-brand-600">
        <CardBody>
          <h2 className="text-lg font-semibold text-ink">{t('help.stuckTitle')}</h2>
          <p className="mt-1 text-[15px] text-muted">{t('help.stuckText')}</p>
          <Button href={`tel:${HELPLINE.replace(/-/g, '')}`} className="mt-4" size="lg">
            {t('help.call', { number: HELPLINE })}
          </Button>
        </CardBody>
      </Card>
    </Container>
  )
}
