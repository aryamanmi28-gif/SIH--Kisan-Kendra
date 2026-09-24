import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import Modal from '../components/ui/Modal.jsx'
import { TextInput, SelectInput, TextArea } from '../components/ui/Field.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import CropLotCard from '../components/farmer/CropLotCard.jsx'
import { cropApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { CROPS, CROP_VARIETIES, MAX_MOISTURE_PERCENT } from '../utils/constants.js'
import { formatCurrency, toISODate } from '../utils/format.js'
import { moistureWarning, required, validateMoisture, validateQuantity } from '../utils/validation.js'

const STORAGE_OPTIONS = ['Own godown', 'Rented godown', 'Kept in the field', 'Loaded on trolley', 'Cooperative store']

const emptyLot = {
  cropCode: '',
  variety: '',
  quantityQuintal: '',
  bags: '',
  harvestDate: '',
  moisturePercent: '',
  storage: '',
  notes: '',
}

const validators = {
  cropCode: required('Crop'),
  variety: required('Variety'),
  quantityQuintal: (value) => validateQuantity(value),
  harvestDate: required('Harvest date'),
  moisturePercent: validateMoisture,
  storage: required('Where the crop is kept'),
}

export default function CropDetails() {
  useDocumentTitle('My crops')
  const location = useLocation()
  const { notify } = useToast()
  const { data: lots, loading, error, refetch } = useApi(() => cropApi.list())
  const [formOpen, setFormOpen] = useState(Boolean(location.state?.firstVisit))
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const saveLot = useMutation((values) =>
    editing ? cropApi.update(editing.id, values) : cropApi.create(values),
  )
  const removeLot = useMutation((lotId) => cropApi.remove(lotId))

  const form = useForm({
    initialValues: emptyLot,
    validators,
    onSubmit: async (values, { setFormError }) => {
      const result = await saveLot.mutate(values)
      if (result.ok) {
        notify(editing ? 'Crop entry updated' : `${result.data.cropName} added to your crops`, 'success')
        form.reset(emptyLot)
        setEditing(null)
        setFormOpen(false)
        refetch()
      } else if (result.error) {
        setFormError(result.error.message)
      }
    },
  })

  const selectedCrop = CROPS.find((crop) => crop.code === form.values.cropCode)
  const varieties = CROP_VARIETIES[form.values.cropCode] || []
  const expectedValue = useMemo(() => {
    if (!selectedCrop || !form.values.quantityQuintal) return null
    return selectedCrop.msp * Number(form.values.quantityQuintal)
  }, [selectedCrop, form.values.quantityQuintal])

  const wetWarning = moistureWarning(form.values.moisturePercent)

  const startEdit = (lot) => {
    setEditing(lot)
    setFormOpen(true)
    form.reset({
      cropCode: lot.cropCode,
      variety: lot.variety,
      quantityQuintal: String(lot.quantityQuintal),
      bags: lot.bags ? String(lot.bags) : '',
      harvestDate: lot.harvestDate,
      moisturePercent: String(lot.moisturePercent),
      storage: lot.storage,
      notes: lot.notes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = async () => {
    const result = await removeLot.mutate(pendingDelete.id)
    setPendingDelete(null)
    if (result.ok) {
      notify('Crop entry removed', 'success')
      refetch()
    } else if (result.error) {
      notify(result.error.message, 'error')
    }
  }

  const bind = (field) => ({
    name: field,
    value: form.values[field],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.fieldError(field),
  })

  return (
    <>
      <PageHeader
        title="My crops"
        hindiTitle="मेरी फसल"
        description="Enter each lot you want to sell. One booking is made against one lot."
        actions={
          !formOpen ? (
            <Button onClick={() => setFormOpen(true)} icon={<Icon name="plus" className="h-4 w-4" />}>
              Add a crop lot
            </Button>
          ) : null
        }
      />

      {formOpen ? (
        <Card className="mb-6">
          <CardHeader
            title={editing ? `Edit lot ${editing.id}` : 'Add a crop lot'}
            subtitle="Give the reading from the moisture meter if you have one. The centre will check it again."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormOpen(false)
                  setEditing(null)
                  form.reset(emptyLot)
                }}
              >
                Cancel
              </Button>
            }
          />
          <CardBody>
            {form.formError ? (
              <Alert tone="danger" className="mb-4">
                {form.formError}
              </Alert>
            ) : null}

            <form onSubmit={form.handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
              <SelectInput
                label="Crop"
                hindiLabel="फसल"
                required
                placeholder="Select the crop"
                options={CROPS.map((crop) => ({ value: crop.code, label: `${crop.name} - ${crop.hindi}` }))}
                {...bind('cropCode')}
                onChange={(event) => {
                  form.setValue('cropCode', event.target.value)
                  form.setValue('variety', '')
                }}
                disabled={Boolean(editing)}
                hint={selectedCrop ? `Support price ${formatCurrency(selectedCrop.msp)} per quintal` : undefined}
              />
              <SelectInput
                label="Variety"
                required
                placeholder={form.values.cropCode ? 'Select the variety' : 'Choose a crop first'}
                options={varieties}
                disabled={!form.values.cropCode}
                {...bind('variety')}
              />
              <TextInput
                label="Quantity to sell"
                hindiLabel="मात्रा"
                required
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                hint="In quintal. 1 quintal = 100 kg"
                {...bind('quantityQuintal')}
              />
              <TextInput
                label="Number of bags"
                type="number"
                inputMode="numeric"
                min="0"
                hint="Helps the centre plan unloading"
                {...bind('bags')}
              />
              <TextInput
                label="Harvest date"
                required
                type="date"
                max={toISODate(new Date())}
                {...bind('harvestDate')}
              />
              <TextInput
                label="Moisture reading"
                required
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                hint={`Percentage. Centres accept up to ${MAX_MOISTURE_PERCENT}%`}
                {...bind('moisturePercent')}
              />
              <SelectInput
                label="Where is the crop now"
                required
                placeholder="Select"
                options={STORAGE_OPTIONS}
                {...bind('storage')}
              />
              <TextArea
                label="Anything the centre should know"
                placeholder="For example: cleaned twice, two trolleys"
                {...bind('notes')}
              />

              {wetWarning ? (
                <Alert tone="warning" className="sm:col-span-2">
                  {wetWarning}
                </Alert>
              ) : null}

              {expectedValue ? (
                <div className="border border-line bg-paper px-4 py-3 sm:col-span-2">
                  <p className="text-sm text-muted">Value of this lot at the support price</p>
                  <p className="text-xl font-bold text-ink tnum">{formatCurrency(expectedValue)}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    Final amount depends on the weight and grade recorded at the centre.
                  </p>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <Button type="submit" size="lg" fullWidth loading={form.submitting || saveLot.loading}>
                  {editing ? 'Save changes' : 'Add this lot'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {loading && !lots ? <SkeletonRows rows={2} /> : null}
      {error && !lots ? <ErrorState error={error} onRetry={refetch} title="Your crops did not load" /> : null}

      {lots ? (
        lots.length === 0 ? (
          <EmptyState
            icon="wheat"
            title="No crop entered yet"
            description="Add the crop you want to sell. You will need the quantity in quintal and a moisture reading."
            action={
              !formOpen ? (
                <Button onClick={() => setFormOpen(true)} size="lg">
                  Add your first crop lot
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="space-y-4">
            {lots.map((lot) => (
              <CropLotCard
                key={lot.id}
                lot={lot}
                onEdit={startEdit}
                onDelete={setPendingDelete}
                deleting={removeLot.loading && pendingDelete?.id === lot.id}
              />
            ))}
          </div>
        )
      ) : null}

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove this crop entry?"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button variant="solidDanger" onClick={confirmDelete} loading={removeLot.loading}>
              Remove entry
            </Button>
            <Button variant="neutral" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
          </div>
        }
      >
        {pendingDelete ? (
          <p>
            {pendingDelete.cropName}, {pendingDelete.quantityQuintal} quintal will be removed from your crop list.
            You can add it again later.
          </p>
        ) : null}
      </Modal>
    </>
  )
}
