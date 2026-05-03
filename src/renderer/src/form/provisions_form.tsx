import { useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

const ProvisionsForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues || {
      provisions: [
        {
          date_paiement: generalInfo?.config?.date_paiement
        }
      ]
    }
  })

  const formValues = useWatch({ control })
  const provisionsValues = useWatch({
    control,
    name: 'provisions'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data)
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  // Calcul des totaux pour Montant et Intérêts
  const totals = useMemo(() => {
    const totalAmount = provisionsValues.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    )

    const totalInterest = provisionsValues.reduce((acc, curr) => {
      const interest =
        curr.date_provision && curr.date_paiement ? (
          <Interest
            amount={curr.amount || 0}
            start={curr.date_provision}
            end={curr.date_paiement}
          />
        ) : (
          0
        )
      return acc + parseFloat(interest)
    }, 0)

    return {
      totalAmount: totalAmount,
      totalInterest: totalInterest
    }
  }, [provisionsValues])

  const columns = [
    {
      header: 'provisions.provision_date',
      key: 'date_provision',
      type: 'start'
    },
    { header: 'common.amount', key: 'amount', type: 'number' },
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
  ]

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DynamicTable
          base="provisions"
          title="nav.provisions"
          columns={columns}
          control={control}
          name="provisions"
          formValues={formValues}
          editable={editable}
          calculateTotal={(e) => e?.amount}
          addRowDefaults={{
            date_paiement: generalInfo?.config?.date_paiement
          }}
        />
      </form>
      <div className="total-box">
        <TextItem path="provisions.total" tag="strong" />
        <Money value={totals.totalAmount.toFixed(2)} className={'total'} />
      </div>
    </>
  )
}

export default ProvisionsForm
