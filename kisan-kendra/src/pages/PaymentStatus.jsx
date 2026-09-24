import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import { paymentApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { PAYMENT_STAGES, PAYMENT_STATUS } from '../utils/constants.js'
import { formatCurrency, formatDate, formatQuantity } from '../utils/format.js'

function StageDots({ stages }) {
  const reached = new Set(stages.map((stage) => stage.key))
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {PAYMENT_STAGES.map((stage) => (
        <span
          key={stage.key}
          className={`h-2 w-8 ${reached.has(stage.key) ? 'bg-brand-600' : 'bg-line'}`}
        />
      ))}
    </div>
  )
}

export default function PaymentStatus() {
  useDocumentTitle('Payment status')
  const { data: payments, loading, error, refetch } = useApi(() => paymentApi.list(), [], { pollMs: 20000 })

  const credited = (payments || [])
    .filter((payment) => payment.status === PAYMENT_STATUS.PAYMENT_CREDITED)
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pending = (payments || [])
    .filter((payment) => payment.status !== PAYMENT_STATUS.PAYMENT_CREDITED)
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <>
      <PageHeader
        title="Payment status"
        hindiTitle="भुगतान की स्थिति"
        description="Every sale moves through four stages, from procurement to money in your bank account."
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Refresh
          </Button>
        }
      />

      {loading && !payments ? <SkeletonRows rows={2} /> : null}
      {error && !payments ? <ErrorState error={error} onRetry={refetch} title="Payments did not load" /> : null}

      {payments ? (
        payments.length === 0 ? (
          <EmptyState
            icon="rupee"
            title="No payment yet"
            description="After your crop is procured, the payment for it appears here and you can follow each stage until it reaches your bank."
            action={
              <Button to="/centres" size="lg">
                Find a procurement centre
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="border border-line bg-white px-4 py-3">
                <p className="text-sm text-muted">Credited to your account</p>
                <p className="mt-1 text-2xl font-bold text-brand-700 tnum">{formatCurrency(credited)}</p>
              </div>
              <div className="border border-line bg-white px-4 py-3">
                <p className="text-sm text-muted">Still in process</p>
                <p className="mt-1 text-2xl font-bold text-ink tnum">{formatCurrency(pending)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardBody>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-ink">
                          <Link to={`/payments/${payment.id}`} className="hover:underline">
                            {payment.cropName}, {formatQuantity(payment.quantityQuintal)}
                          </Link>
                        </h2>
                        <p className="mt-0.5 text-sm text-muted tnum">
                          Payment {payment.id} | procurement {payment.procurementId}
                        </p>
                      </div>
                      <StatusBadge kind="payment" status={payment.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted">Amount</p>
                        <p className="text-2xl font-bold text-ink tnum">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted">
                          {payment.status === PAYMENT_STATUS.PAYMENT_CREDITED
                            ? 'Credited on'
                            : 'Expected by'}
                        </p>
                        <p className="font-semibold text-ink tnum">
                          {payment.status === PAYMENT_STATUS.PAYMENT_CREDITED
                            ? formatDate(payment.stages[payment.stages.length - 1].at)
                            : formatDate(payment.expectedBy)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <StageDots stages={payment.stages} />
                      <Button to={`/payments/${payment.id}`} variant="secondary" size="sm">
                        See all stages
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )
      ) : null}
    </>
  )
}
