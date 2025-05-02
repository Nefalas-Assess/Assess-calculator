import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import DynamicTable from '@renderer/generic/dynamicTable'

const ProvisionsForm = ({ initialValues, onSubmit, editable = true }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      provisions: [{}]
    }
  })

  const formValues = watch()
  const provisionsValues = useWatch({
    control,
    name: 'provisions'
  })

  const previousValuesRef = useRef({})

  const submitForm = useCallback(
    (data) => {
      onSubmit(data)
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(provisionsValues) !== JSON.stringify(previousValuesRef.current?.provisions)

    if (valuesChanged) {
      previousValuesRef.current = {
        formValues,
        provisions: provisionsValues
      }

      handleSubmit(submitForm)()
    }
  }, [formValues, provisionsValues, submitForm, handleSubmit])

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
      totalAmount: totalAmount * -1,
      totalInterest: totalInterest * -1
    }
  }, [provisionsValues])

  const columns = [
    { header: 'Date de provision', key: 'date_provision', type: 'start' },
    { header: 'Montant', key: 'amount', type: 'number' },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'Intérêts (€)', key: 'interest', type: 'interest', className: 'int' }
  ]

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DynamicTable
          title="Provisions"
          columns={columns}
          control={control}
          name="provisions"
          formValues={formValues}
          editable={editable}
          calculateTotal={(e) => e?.amount}
        />
      </form>
      <div className="total-box">
        <strong>Total des provisions : </strong> <Money value={totals.totalAmount.toFixed(2)} />
      </div>
    </>
  )
}

export default ProvisionsForm
