import React, { useCallback, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'

const coefficients = [
  { value: 1.15, label: '1/7' },
  { value: 3.5, label: '2/7' },
  { value: 7, label: '3/7' },
  { value: 11.5, label: '4/7' },
  { value: 17, label: '5/7' },
  { value: 24, label: '6/7' },
  { value: 32, label: '7/7' }
]

const PretiumDolorisForm = ({ initialValues, onSubmit, editable = true }) => {
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

  const getAmount = useCallback((values, days) => {
    return (parseInt(days || 0) * parseFloat(values?.coefficient || 0)).toFixed(2)
  }, [])

  const columns = [
    { header: 'common.start', key: 'start', type: 'start' },
    { header: 'common.end', key: 'end', type: 'end' },
    { header: 'common.days', key: 'days', type: 'calculated' },
    { header: 'common.coefficient', key: 'coefficient', type: 'select', options: coefficients },
    { header: 'common.total', key: 'total', type: 'calculated' },
    { header: 'common.date_paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'common.interest', key: 'interest', type: 'interest', median: true, className: 'int' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="incapacite_temp.pretium.title"
        columns={columns}
        control={control}
        name="periods"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ amount: 30 }}
        calculateTotal={getAmount}
      />
    </form>
  )
}

export default PretiumDolorisForm
