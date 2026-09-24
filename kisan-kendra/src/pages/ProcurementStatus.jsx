import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import { procurementApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatCurrency, formatDateTime, formatWeightKg } from '../utils/format.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

/**
 * The real Procurement record is much leaner than the mock model — commodity,
 * quantity_kg, rate_per_kg, total_amount, status and payment_status. There is
 * no weighment/grade/deduction breakdown, so this card shows what's actually
 * recorded, including payment status (there is no separate Payment model).
 */
function ProcurementCard({ record }) {
  const { t } = useI18n()
  const done = record.status === 'completed'

  return (
    <Card>
      <CardHeader
        title={record.commodity}
        subtitle={record.procured_at ? formatDateTime(record.procured_at) : t('procurement.notYet')}
        action={<StatusBadge kind="procurement" status={record.status} />}
      />
      <CardBody>
        <DetailList
          columns={3}
          items={[
            { label: t('procurement.quantity'), value: formatWeightKg(record.quantity_kg) },
            {
              label: t('procurement.rate'),
              value: record.rate_per_kg ? t('format.perKg', { amount: formatCurrency(record.rate_per_kg) }) : null,
            },
            { label: t('procurement.amount'), value: formatCurrency(record.total_amount) },
          ]}
        />

        {done ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-[15px] text-ink/90">{t('procurement.paymentStatus')}</p>
            <StatusBadge kind="procurementPayment" status={record.payment_status} />
          </div>
        ) : (
          <p className="mt-4 flex items-start gap-2 border border-grain-200 bg-grain-50 px-4 py-3 text-[15px] text-grain-700">
            <Icon name="scale" className="mt-0.5 h-5 w-5 shrink-0" />
            {t('procurement.processing')}
          </p>
        )}
      </CardBody>
    </Card>
  )
}

export default function ProcurementStatus() {
  const { t } = useI18n()
  useDocumentTitle(t('procurement.docTitle'))
  const { data: records, loading, error, refetch } = useApi(() => procurementApi.list(), [], { pollMs: 20000 })

  return (
    <>
      <PageHeader
        title={t('procurement.title')}
        description={t('procurement.lead')}
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            {t('common.refresh')}
          </Button>
        }
      />

      {loading && !records ? <SkeletonRows rows={2} /> : null}
      {error && !records ? <ErrorState error={error} onRetry={refetch} title={t('procurement.failed')} /> : null}

      {records ? (
        records.length === 0 ? (
          <EmptyState
            icon="scale"
            title={t('procurement.emptyTitle')}
            description={t('procurement.emptyText')}
            action={
              <Button to="/centres" size="lg">
                {t('procurement.findCentre')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            {records.map((record) => (
              <ProcurementCard key={record.id} record={record} />
            ))}
          </div>
        )
      ) : null}
    </>
  )
}
