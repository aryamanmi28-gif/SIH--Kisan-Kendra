import Button from '../ui/Button.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import Icon from '../ui/Icon.jsx'
import { CROPS, MAX_MOISTURE_PERCENT } from '../../utils/constants.js'
import { formatCurrency, formatDate, formatQuantity } from '../../utils/format.js'

export default function CropLotCard({ lot, onEdit, onDelete, deleting }) {
  const crop = CROPS.find((item) => item.code === lot.cropCode)
  const expected = crop ? crop.msp * lot.quantityQuintal : null
  const wetLot = lot.moisturePercent > MAX_MOISTURE_PERCENT

  return (
    <article className="border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">
            {lot.cropName}{' '}
            <span className="ml-2 text-[15px] font-normal text-muted">{lot.variety}</span>
          </h3>
          <p className="mt-0.5 text-sm text-muted tnum">
            Lot {lot.id} added on {formatDate(lot.createdAt)}
          </p>
        </div>
        <StatusBadge kind="lot" status={lot.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line px-4 py-3 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-muted">Quantity</dt>
          <dd className="font-semibold text-ink tnum">{formatQuantity(lot.quantityQuintal)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Bags</dt>
          <dd className="font-semibold text-ink tnum">{lot.bags ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Moisture</dt>
          <dd className={`font-semibold tnum ${wetLot ? 'text-danger-600' : 'text-ink'}`}>{lot.moisturePercent}%</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Value at MSP</dt>
          <dd className="font-semibold text-ink tnum">{formatCurrency(expected)}</dd>
        </div>
      </dl>

      {wetLot ? (
        <p className="flex items-start gap-2 border-t border-line bg-grain-50 px-4 py-2.5 text-sm text-grain-700">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          Moisture is above {MAX_MOISTURE_PERCENT}%. Dry this lot before you bring it, or the centre can refuse it.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line bg-paper px-4 py-3">
        {lot.status === 'ready' ? (
          <>
            <Button to="/centres" size="sm">
              Find a centre
            </Button>
            <Button variant="neutral" size="sm" onClick={() => onEdit(lot)} icon={<Icon name="edit" className="h-4 w-4" />}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(lot)}
              loading={deleting}
              icon={<Icon name="trash" className="h-4 w-4" />}
            >
              Remove
            </Button>
          </>
        ) : lot.status === 'booked' ? (
          <Button to={`/bookings/${lot.bookingId}`} variant="secondary" size="sm">
            View token
          </Button>
        ) : (
          <Button to="/payments" variant="neutral" size="sm">
            See payment
          </Button>
        )}
      </div>
    </article>
  )
}
