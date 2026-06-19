import constants from '@renderer/constants'
import { getDamageMatVehicleRate } from '@renderer/data/damage_mat'
import DynamicTable from '@renderer/generic/dynamicTable'
import Field from '@renderer/generic/field'
import Money from '@renderer/generic/money'
import TextItem from '@renderer/generic/textItem'
import useAutosaveForm from '@renderer/hooks/autosaveForm'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import { getDays } from '@renderer/helpers/general'
import { useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

const toNumber = (value, fallback = 0): number => {
  const parsed = Number.parseFloat(`${value ?? ''}`)
  return Number.isFinite(parsed) ? parsed : fallback
}

const getVatAmount = (amount, rate): number => {
  return toNumber(amount) * (toNumber(rate) / 100)
}

const getLossOfUseTotal = (days, dailyRate): number => {
  return toNumber(days) * toNumber(dailyRate)
}

const getStorageRowValues = (row, tvaRate): { days: number; vatPerDay: number; total: number } => {
  const days = toNumber(getDays(row), 0)
  const dailyAmount = toNumber(row?.daily_amount)
  const vatPerDay = getVatAmount(dailyAmount, tvaRate)

  return {
    days,
    vatPerDay,
    total: days * (dailyAmount + vatPerDay)
  }
}

const getRentalRowValues = (row, tvaRate): { days: number; vatPerDay: number; total: number } => {
  const days = toNumber(getDays(row), 0)
  const baseDailyAmount = toNumber(row?.daily_amount)
  const effectiveDailyAmount = row?.deduct_ten_percent ? baseDailyAmount * 0.9 : baseDailyAmount
  const vatPerDay = getVatAmount(effectiveDailyAmount, tvaRate)

  return {
    days,
    vatPerDay,
    total: days * (effectiveDailyAmount + vatPerDay)
  }
}

interface DamageMatFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  initialValues?: Record<string, unknown>
  editable?: boolean
}

export const DamageMatForm = ({
  onSubmit,
  initialValues,
  editable = true
}: DamageMatFormProps): JSX.Element => {
  const generalInfo = useGeneralInfo()

  const damageTypeOptions = useMemo(
    () => [
      {
        value: 'repair',
        label: { fr: 'Réparation', en: 'Repair', nl: 'Herstelling' }
      },
      {
        value: 'total_loss',
        label: { fr: 'Perte totale', en: 'Total loss', nl: 'Totaal verlies' }
      }
    ],
    []
  )

  const defaultValues = useMemo(
    () => ({
      tva_rate: 21,
      damage_type: 'repair',
      immobilized: false,
      vehicle_type: 'car',
      vehicle_tonnage: '',
      waiting: {
        start: generalInfo?.date_accident || '',
        end: ''
      },
      transfer: {
        start: '',
        end: ''
      },
      repair_loss: {
        start: '',
        end: ''
      },
      repair: {
        amount: '',
        wreck: ''
      },
      total_loss: {
        amount: '',
        wreck: ''
      },
      storage: [],
      breakdown: [],
      rental: [],
      circulation_tax: '',
      ...(initialValues || {})
    }),
    [generalInfo?.date_accident, initialValues]
  )

  const { control, handleSubmit } = useForm({
    defaultValues
  })

  const formValues = useWatch({ control })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data)
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const tvaRate = toNumber(formValues?.tva_rate, 0)
  const isImmobilized =
    formValues?.immobilized === true || formValues?.immobilized?.toString?.() === 'true'
  const vehicleDailyRate = useMemo(
    () =>
      getDamageMatVehicleRate(
        generalInfo?.config,
        formValues?.vehicle_type,
        formValues?.vehicle_tonnage
      ),
    [generalInfo?.config, formValues?.vehicle_type, formValues?.vehicle_tonnage]
  )

  const repairVatAmount = getVatAmount(formValues?.repair?.amount, tvaRate)
  const repairTotal = toNumber(formValues?.repair?.amount) + repairVatAmount

  const totalLossVatAmount = getVatAmount(formValues?.total_loss?.amount, tvaRate)
  const totalLossTotal =
    toNumber(formValues?.total_loss?.amount) +
    totalLossVatAmount -
    toNumber(formValues?.total_loss?.wreck)

  const waitingDays = toNumber(getDays(formValues?.waiting), 0)
  const waitingTotal = getLossOfUseTotal(waitingDays, vehicleDailyRate)

  const transferDays = toNumber(getDays(formValues?.transfer), 0)
  const transferTotal = getLossOfUseTotal(transferDays, vehicleDailyRate)

  const repairDays = toNumber(getDays(formValues?.repair_loss), 0)
  const repairLossTotal = getLossOfUseTotal(repairDays, vehicleDailyRate)

  const storageColumns = useMemo(
    () => [
      { header: 'common.start', key: 'start', type: 'date' },
      { header: 'common.end', key: 'end', type: 'date' },
      { header: 'common.days', key: 'days', type: 'calculated' },
      { header: 'damage_mat.daily_amount', key: 'daily_amount', type: 'number' },
      {
        header: 'damage_mat.vat_amount',
        key: 'vat_amount',
        render: (_, rowData) => (
          <Money value={getStorageRowValues(rowData, tvaRate).vatPerDay} ignore />
        )
      },
      {
        header: 'common.total',
        key: 'total',
        type: 'calculated'
      }
    ],
    [tvaRate]
  )

  const breakdownColumns = useMemo(
    () => [
      {
        header: 'common.amount',
        key: 'amount',
        type: 'number',
        additionalContent: (rowData) => (
          <div className="hide">
            <Money value={rowData?.amount} />
          </div>
        )
      }
    ],
    []
  )

  const rentalColumns = useMemo(
    () => [
      { header: 'common.start', key: 'start', type: 'date' },
      { header: 'common.end', key: 'end', type: 'date' },
      { header: 'common.days', key: 'days', type: 'calculated' },
      { header: 'damage_mat.daily_amount', key: 'daily_amount', type: 'number' },
      {
        header: 'damage_mat.vat_amount',
        key: 'vat_amount',
        render: (_, rowData) => (
          <Money value={getRentalRowValues(rowData, tvaRate).vatPerDay} ignore />
        )
      },
      {
        header: 'damage_mat.deduct_ten_percent',
        key: 'deduct_ten_percent',
        type: 'checkbox'
      },
      {
        header: 'common.total',
        key: 'total',
        type: 'calculated'
      }
    ],
    [tvaRate]
  )

  const shouldShowTopSection =
    editable ||
    formValues?.damage_type ||
    formValues?.vehicle_type ||
    formValues?.repair?.amount ||
    formValues?.total_loss?.amount

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextItem path="damage_mat.title" tag="h1" />

      {shouldShowTopSection && (
        <table id="IPVariables">
          <tbody>
            <tr>
              <TextItem path="damage_mat.tva_rate" tag="td" />
              <td>
                <Field control={control} type="number" name="tva_rate" editable={editable}>
                  {(props) => <input min={0} max={21} step="0.01" {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="damage_mat.damage_type" tag="td" />
              <td>
                <Field
                  control={control}
                  type="select"
                  name="damage_type"
                  options={damageTypeOptions}
                  editable={editable}
                />
              </td>
            </tr>
            <tr>
              <TextItem path="damage_mat.immobilized" tag="td" />
              <td>
                <Field
                  control={control}
                  type="select"
                  name="immobilized"
                  options={constants.boolean}
                  editable={editable}
                />
              </td>
            </tr>
            <tr>
              <TextItem path="damage_mat.vehicle_type" tag="td" />
              <td>
                <Field
                  control={control}
                  type="select"
                  name="vehicle_type"
                  options={constants.damage_mat_vehicle_type}
                  editable={editable}
                />
              </td>
            </tr>
            {formValues?.vehicle_type === 'truck_over_3_5' && (
              <tr>
                <TextItem path="damage_mat.vehicle_tonnage" tag="td" />
                <td>
                  <Field control={control} type="number" name="vehicle_tonnage" editable={editable}>
                    {(props) => <input min={0} step="0.01" {...props} />}
                  </Field>
                </td>
              </tr>
            )}
            <tr>
              <TextItem path="damage_mat.daily_rate" tag="td" />
              <td>
                <Money value={vehicleDailyRate} ignore span />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {formValues?.damage_type === 'repair' ? (
        <>
          <TextItem path="damage_mat.repair.title" tag="h3" />
          <table style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.amount" tag="th" />
                <TextItem path="damage_mat.vat_amount" tag="th" />
                <TextItem path="common.total" tag="th" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field control={control} type="number" name="repair.amount" editable={editable}>
                    {(props) => <input min={0} step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={repairVatAmount} ignore />
                </td>
                <td>
                  <Money value={repairTotal} />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <>
          <TextItem path="damage_mat.total_loss.title" tag="h3" />
          <table style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.amount" tag="th" />
                <TextItem path="damage_mat.vat_amount" tag="th" />
                <TextItem path="damage_mat.wreck" tag="th" />
                <TextItem path="common.total" tag="th" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name="total_loss.amount"
                    editable={editable}
                  >
                    {(props) => <input min={0} step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={totalLossVatAmount} ignore />
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name="total_loss.wreck"
                    editable={editable}
                  >
                    {(props) => <input min={0} step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={totalLossTotal} />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {(editable || isImmobilized) && isImmobilized && (
        <>
          <TextItem path="damage_mat.waiting.title" tag="h3" />
          <table style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.start" tag="th" />
                <TextItem path="common.end" tag="th" />
                <TextItem path="common.days" tag="th" />
                <TextItem path="common.total" tag="th" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field control={control} type="date" name="waiting.start" editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field control={control} type="date" name="waiting.end" editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{waitingDays}</td>
                <td>
                  <Money value={waitingTotal} />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <TextItem
        path={
          formValues?.damage_type === 'total_loss'
            ? 'damage_mat.transfer.title'
            : 'damage_mat.repair_loss.title'
        }
        tag="h3"
      />
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="common.start" tag="th" />
            <TextItem path="common.end" tag="th" />
            <TextItem path="common.days" tag="th" />
            <TextItem path="common.total" tag="th" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Field
                control={control}
                type="date"
                name={
                  formValues?.damage_type === 'total_loss' ? 'transfer.start' : 'repair_loss.start'
                }
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                type="date"
                name={formValues?.damage_type === 'total_loss' ? 'transfer.end' : 'repair_loss.end'}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td>{formValues?.damage_type === 'total_loss' ? transferDays : repairDays}</td>
            <td>
              <Money
                value={formValues?.damage_type === 'total_loss' ? transferTotal : repairLossTotal}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <DynamicTable
        subtitle="damage_mat.storage.title"
        columns={storageColumns}
        control={control}
        name="storage"
        formValues={formValues}
        editable={editable}
        calculateTotal={(rowData) => getStorageRowValues(rowData, tvaRate).total.toFixed(2)}
      />

      <DynamicTable
        subtitle="damage_mat.breakdown.title"
        columns={breakdownColumns}
        control={control}
        name="breakdown"
        formValues={formValues}
        editable={editable}
      />

      <DynamicTable
        subtitle="damage_mat.rental.title"
        columns={rentalColumns}
        control={control}
        name="rental"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ deduct_ten_percent: true }}
        calculateTotal={(rowData) => getRentalRowValues(rowData, tvaRate).total.toFixed(2)}
      />

      <TextItem path="damage_mat.circulation_tax.title" tag="h3" />
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="common.amount" tag="th" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Field control={control} type="number" name="circulation_tax" editable={editable}>
                {(props) => <input min={0} step="0.01" {...props} />}
              </Field>
              <div className="hide">
                <Money value={formValues?.circulation_tax} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default DamageMatForm
