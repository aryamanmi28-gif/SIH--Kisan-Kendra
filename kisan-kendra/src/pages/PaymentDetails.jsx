import { useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import PaymentTimeline from '../components/farmer/PaymentTimeline.jsx'
import { paymentApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { PAYMENT_STATUS, HELPLINE } from '../utils/constants.js'
import { formatCurrency, formatDate, formatQuantity, maskAccount } from '../utils/format.js'

export default function PaymentDetails() {
  const { paymentId } = useParams()
  const { data: payment, loading, error, refetch } = useApi(() => paymentApi.detail(paymentId), [paymentId], {
    pollMs: 15000,
  })
  useDocumentTitle(payment ? `Payment ${payment.id}` : 'Payment')

  if (loading && !payment) return <LoadingState label="Loading payment details" />
  if (error && !payment) return <ErrorState error={error} onRetry={refetch} title="Payment did not load" />
  if (!payment) return null

  const credited = payment.status === PAYMENT_STATUS.PAYMENT_CREDITED
  const failed = payment.status === PAYMENT_STATUS.FAILED

  return (
    <>
      <PageHeader
        back={{ to: '/payments', label: 'All payments' }}
        title="Payment status"
        hindiTitle="भुगतान की स्थिति"
        description={`${payment.cropName}, ${formatQuantity(payment.quantityQuintal)}`}
        meta={<StatusBadge kind="payment" status={payment.status} />}
      />

      {failed ? (
        <Alert tone="danger" title="The transfer did not go through" className="mb-5">
          This usually happens when the bank account is not seeded with Aadhaar or the account is dormant. Visit
          your branch, then call the helpline {HELPLINE} to have the payment re-sent.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader
            title="Progress of your payment"
            subtitle={
              credited
                ? 'Money has reached your bank account'
                : `Expected in your account by ${formatDate(payment.expectedBy)}`
            }
          />
          <CardBody>
            <PaymentTimeline stages={payment.stages} failed={failed} />
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card className={credited ? 'border-l-4 border-l-brand-600' : undefined}>
            <CardBody>
              <p className="text-sm text-muted">{credited ? 'Amount credited' : 'Amount payable'}</p>
              <p className="mt-1 text-3xl font-bold text-ink tnum">{formatCurrency(payment.amount)}</p>
              {credited ? (
                <p className="mt-2 flex items-center gap-1.5 text-[15px] font-medium text-brand-700">
                  <Icon name="check-circle" className="h-5 w-5" />
                  Credited on {formatDate(payment.stages[payment.stages.length - 1].at)}
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Where the money goes" icon={<Icon name="bank" className="h-5 w-5 text-brand-600" />} />
            <CardBody>
              <DetailList
                columns={1}
                items={[
                  { label: 'Bank', value: payment.bankName },
                  { label: 'Account', value: maskAccount(payment.accountNumber) },
                  { label: 'Transfer mode', value: 'Direct benefit transfer (DBT)' },
                  { label: 'UTR number', value: payment.utr || 'Generated after transfer' },
                  { label: 'Against procurement', value: payment.procurementId },
                ]}
              />
            </CardBody>
          </Card>

          {!credited && !failed ? (
            <Alert tone="info" title="Payment usually takes up to three working days">
              You will get an SMS from your bank when the amount is credited. There is no need to visit the
              centre for this.
            </Alert>
          ) : null}

          <Card>
            <CardHeader title="Money not received?" />
            <CardBody>
              <p className="text-[15px] text-muted">
                If the amount has not reached your account after the expected date, call the helpline with your
                acknowledgement slip number ready.
              </p>
              <Button
                href={`tel:${HELPLINE.replace(/-/g, '')}`}
                variant="secondary"
                fullWidth
                className="mt-3"
                icon={<Icon name="phone" className="h-4 w-4" />}
              >
                Call {HELPLINE}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
