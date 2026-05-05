import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

const PrejudiceEXHForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const indicativeAmount = getIndicativeAmount(generalInfo?.config?.prejudice_exh, 75)

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const formValues = useWatch({ control })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const getTotalAmount = useCallback((item, days) => {
    const { amount = 0 } = item

    return ((parseInt(days) || 0) * (parseFloat(amount) || 0)).toFixed(2)
  })

  const renderToolTipAmount = useCallback((rowData, days) => {
    return (
      <>
        <div>
          <math>
            <mn>{days}</mn>
            <mo>x</mo>
            <mn>{rowData?.amount}</mn>
          </math>
        </div>
      </>
    )
  }, [])

  const columns = [
    { header: 'common.start', key: 'start', type: 'date' },
    { header: 'common.end', key: 'end', type: 'date' },
    { header: 'common.days', key: 'days', type: 'calculated' },
    {
      header: 'common.indemnite_journaliere',
      key: 'amount',
      type: 'number',
      width: 100
    },
    {
      header: 'common.total',
      key: 'total',
      type: 'calculated',
      tooltipContent: (rowData, days) => renderToolTipAmount(rowData, days)
    },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interests',
      type: 'interest',
      className: 'int',
      median: true
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="nav.deces.prejudice_exh"
        columns={columns}
        control={control}
        name="periods"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{
          amount: indicativeAmount,
          date_paiement: generalInfo?.config?.date_paiement
        }}
        calculateTotal={getTotalAmount}
      />
    </form>
  )
}

export default PrejudiceEXHForm
