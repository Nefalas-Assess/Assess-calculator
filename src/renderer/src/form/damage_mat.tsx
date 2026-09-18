import constants from '@renderer/constants'
import { getDamageMatVehicleRate } from '@renderer/data/damage_mat'
import DynamicTable from '@renderer/generic/dynamicTable'
import Field from '@renderer/generic/field'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import TextItem from '@renderer/generic/textItem'
import useAutosaveForm from '@renderer/hooks/autosaveForm'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import { getDays, getMedDate } from '@renderer/helpers/general'
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

const getSafeMedianDate = (period) => {
  if (!period?.start || !period?.end) {
    return undefined
  }

  return getMedDate(period)
}

const getStorageRowValues = (
  row,
  tvaRate
): { days: number; vatPerDay: number; totalVat: number; total: number } => {
  const days = toNumber(getDays(row), 0)
  const dailyAmount = toNumber(row?.daily_amount)
  const vatPerDay = getVatAmount(dailyAmount, tvaRate)

  return {
    days,
    vatPerDay,
    totalVat: vatPerDay * days,
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

const isImmobilizedValue = (value): boolean => value === true || value?.toString?.() === 'true'

export const computeDamageMatTotal = (values?: any, config?: Record<string, number>): number => {
  if (!values) return 0

  const tvaRate = toNumber(values.tva_rate, 0)
  const vehicleDailyRate = getDamageMatVehicleRate(
    config,
    values.vehicle_type || '',
    values.vehicle_tonnage
  )
  const isImmobilized = isImmobilizedValue(values.immobilized)
  const isTotalLoss = values.damage_type === 'total_loss'

  const repairTotal = toNumber(values.repair?.amount) + getVatAmount(values.repair?.amount, tvaRate)
  const totalLossTotal =
    toNumber(values.total_loss?.amount) +
    getVatAmount(values.total_loss?.amount, tvaRate) -
    toNumber(values.total_loss?.wreck)

  let total = isTotalLoss ? totalLossTotal : repairTotal
  total += getLossOfUseTotal(
    toNumber(getDays(isTotalLoss ? values.transfer : values.repair_loss), 0),
    vehicleDailyRate
  )

  if (isImmobilized) {
    total += getLossOfUseTotal(toNumber(getDays(values.waiting), 0), vehicleDailyRate)
    total += toNumber(values.storage_direct_amount)
    total += (values.storage || []).reduce(
      (sum, row) => sum + getStorageRowValues(row, tvaRate).total,
      0
    )
  }

  total += (values.breakdown || []).reduce((sum, row) => sum + toNumber(row?.amount), 0)
  total += (values.rental || []).reduce(
    (sum, row) => sum + getRentalRowValues(row, tvaRate).total,
    0
  )

  if (values.damage_type !== 'repair') {
    total += toNumber(values.circulation_tax)
  }

  return total
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
        end: '',
        date_paiement: generalInfo?.config?.date_paiement || ''
      },
      repair: {
        amount: '',
        wreck: '',
        date_paiement: generalInfo?.config?.date_paiement || ''
      },
      total_loss: {
        amount: '',
        wreck: '',
        date_paiement: generalInfo?.config?.date_paiement || ''
      },
      circulation_tax: '',
      circulation_tax_date_paiement: generalInfo?.config?.date_paiement || '',
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
  const isImmobilized = isImmobilizedValue(formValues?.immobilized)
  const accidentDate = generalInfo?.date_accident
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

  const damageSectionKey = formValues?.damage_type === 'total_loss' ? 'total_loss' : 'repair'
  const damageSectionTitle =
    damageSectionKey === 'total_loss' ? 'damage_mat.total_loss.title' : 'damage_mat.repair.title'
  const damageVatAmount = damageSectionKey === 'total_loss' ? totalLossVatAmount : repairVatAmount
  const damageTotal = damageSectionKey === 'total_loss' ? totalLossTotal : repairTotal

  const waitingDays = toNumber(getDays(formValues?.waiting), 0)
  const waitingTotal = getLossOfUseTotal(waitingDays, vehicleDailyRate)

  const lossOfUseSectionKey = formValues?.damage_type === 'total_loss' ? 'transfer' : 'repair_loss'
  const lossOfUseSection = formValues?.[lossOfUseSectionKey]
  const lossOfUseDays = toNumber(getDays(lossOfUseSection), 0)
  const lossOfUseTotal = getLossOfUseTotal(lossOfUseDays, vehicleDailyRate)

  const storageColumns = useMemo(
    () => [
      { header: 'common.start', key: 'start', type: 'start' },
      { header: 'common.end', key: 'end', type: 'end' },
      { header: 'common.days', key: 'days', type: 'calculated' },
      { header: 'damage_mat.daily_amount', key: 'daily_amount', type: 'number' },
      {
        header: 'damage_mat.vat_amount',
        key: 'vat_amount',
        render: (_, rowData) => (
          <Money value={getStorageRowValues(rowData, tvaRate).totalVat} ignore />
        )
      },
      {
        header: 'common.total',
        key: 'total',
        type: 'calculated'
      },
      {
        header: 'common.date_paiement',
        key: 'date_paiement',
        type: 'date',
        className: 'int'
      },
      {
        header: 'common.interest',
        key: 'interest',
        type: 'interest',
        className: 'int',
        median: true
      }
    ],
    [tvaRate]
  )

  const breakdownColumns = useMemo(
    () => [
      {
        header: 'damage_mat.fee_date',
        key: 'start',
        type: 'start'
      },
      {
        header: 'common.amount',
        key: 'amount',
        type: 'number',
        additionalContent: (rowData) => (
          <div className="hide">
            <Money value={rowData?.amount} />
          </div>
        )
      },
      {
        header: 'common.date_paiement',
        key: 'date_paiement',
        type: 'date',
        className: 'int'
      },
      {
        header: 'common.interest',
        key: 'interest',
        type: 'interest',
        className: 'int'
      }
    ],
    []
  )

  const rentalColumns = useMemo(
    () => [
      { header: 'common.start', key: 'start', type: 'start' },
      { header: 'common.end', key: 'end', type: 'end' },
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
      },
      {
        header: 'common.date_paiement',
        key: 'date_paiement',
        type: 'date',
        className: 'int'
      },
      {
        header: 'common.interest',
        key: 'interest',
        type: 'interest',
        className: 'int',
        median: true
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

      {(editable || formValues?.repair?.amount) && (
        <>
          <TextItem path={damageSectionTitle} tag="h3" />
          <table key={damageSectionKey} style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.amount" tag="th" />
                <TextItem path="damage_mat.vat_amount" tag="th" />
                {damageSectionKey === 'total_loss' && <TextItem path="damage_mat.wreck" tag="th" />}
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`${damageSectionKey}.amount`}
                    editable={editable}
                  >
                    {(props) => <input min={0} step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={damageVatAmount} ignore />
                </td>
                {damageSectionKey === 'total_loss' && (
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
                )}
                <td>
                  <Money value={damageTotal} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name={`${damageSectionKey}.date_paiement`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest
                    amount={damageTotal}
                    start={accidentDate}
                    end={formValues?.[damageSectionKey]?.date_paiement}
                  />
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
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
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
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="waiting.date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest
                    amount={waitingTotal}
                    start={getSafeMedianDate(formValues?.waiting)}
                    end={formValues?.waiting?.date_paiement}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {(editable || formValues?.repair_loss?.start) && (
        <>
          <TextItem
            path={
              formValues?.damage_type === 'total_loss'
                ? 'damage_mat.transfer.title'
                : 'damage_mat.repair_loss.title'
            }
            tag="h3"
          />
          <table key={lossOfUseSectionKey} style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.start" tag="th" />
                <TextItem path="common.end" tag="th" />
                <TextItem path="common.days" tag="th" />
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field
                    control={control}
                    type="date"
                    name={`${lossOfUseSectionKey}.start`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="date"
                    name={`${lossOfUseSectionKey}.end`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{lossOfUseDays}</td>
                <td>
                  <Money value={lossOfUseTotal} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name={`${lossOfUseSectionKey}.date_paiement`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest
                    amount={lossOfUseTotal}
                    start={getSafeMedianDate(lossOfUseSection)}
                    end={lossOfUseSection?.date_paiement}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {isImmobilized && (
        <>
          <TextItem path="damage_mat.storage.title" tag="h3" />
          {(editable || formValues?.storage_direct_amount) && (
            <table style={{ width: 'auto', minWidth: 'auto' }}>
              <thead>
                <tr>
                  <TextItem path="damage_mat.direct_amount" tag="th" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Field
                      control={control}
                      type="number"
                      name="storage_direct_amount"
                      editable={editable}
                    >
                      {(props) => <input min={0} step="0.01" {...props} />}
                    </Field>
                    <div className="hide">
                      <Money value={formValues?.storage_direct_amount} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          <DynamicTable
            columns={storageColumns}
            control={control}
            name="storage"
            formValues={formValues}
            editable={editable}
            calculateTotal={(rowData) => getStorageRowValues(rowData, tvaRate).total.toFixed(2)}
          />
        </>
      )}

      <DynamicTable
        subtitle="damage_mat.breakdown.title"
        columns={breakdownColumns}
        control={control}
        name="breakdown"
        formValues={formValues}
        editable={editable}
        calculateTotal={(rowData) => toNumber(rowData?.amount).toFixed(2)}
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
      {formValues?.damage_type !== 'repair' && (
        <>
          <TextItem path="damage_mat.circulation_tax.title" tag="h3" />
          <table style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.amount" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
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
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="circulation_tax_date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest
                    amount={formValues?.circulation_tax}
                    start={accidentDate}
                    end={formValues?.circulation_tax_date_paiement}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </form>
  )
}

export default DamageMatForm
