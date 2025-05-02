import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'

const PrejudiceEXHForm = ({ initialValues, onSubmit, editable = true }) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const periodsValues = useWatch({
    control,
    name: 'periods'
  })

  // Référence pour suivre les anciennes valeurs
  const previousValuesRef = useRef({})

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(periodsValues) !== JSON.stringify(previousValuesRef.current?.periods)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        periods: periodsValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, periodsValues, submitForm, handleSubmit])

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
    { header: 'Début', key: 'start', type: 'date' },
    { header: 'Fin', key: 'end', type: 'date' },
    { header: 'Jours', key: 'days', type: 'calculated' },
    { header: 'Indemnité journalière (€)', key: 'amount', type: 'number', width: 100 },
    {
      header: 'Total (€)',
      key: 'total',
      type: 'calculated',
      tooltipContent: (rowData, days) => renderToolTipAmount(rowData, days)
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Préjudice ex haerede"
        columns={columns}
        control={control}
        name="periods"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ amount: 75 }}
        calculateTotal={getTotalAmount}
      />
    </form>
  )
}

export default PrejudiceEXHForm
