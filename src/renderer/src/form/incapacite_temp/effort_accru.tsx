import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'

const EffortAccruForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {}
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const effortsValues = useWatch({
    control,
    name: 'efforts'
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
      JSON.stringify(effortsValues) !== JSON.stringify(previousValuesRef.current?.efforts)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        efforts: effortsValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, effortsValues, submitForm, handleSubmit])

  const getTotalAmount = useCallback((values, days) => {
    return (
      parseInt(days || 0) *
      parseFloat(values?.amount || 0) *
      parseFloat((values?.pourcentage || 0) / 100) *
      (parseInt(values?.coefficient || 0) / 5)
    ).toFixed(2)
  }, [])

  const columns = [
    { header: 'Début', key: 'start', type: 'date', width: 140 },
    { header: 'Fin', key: 'end', type: 'date', width: 140 },
    { header: 'Jours', key: 'days', type: 'calculated' },
    {
      header: 'Indemnité journalière (€)',
      key: 'amount',
      type: 'number',
      props: { step: '0.01' }
    },
    {
      header: '%',
      key: 'pourcentage',
      type: 'number',
      width: 50,
      props: { style: { width: 50 } }
    },
    {
      header: 'Coefficient',
      key: 'coefficient',
      type: 'select',
      width: 50,
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: '7' }
      ]
    },
    { header: 'Total', key: 'total', type: 'calculated' },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'Intérêts', key: 'interest', type: 'interest', median: true, className: 'int' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Efforts accrus"
        columns={columns}
        control={control}
        name="efforts"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ coefficient: 5, amount: 30 }}
        calculateTotal={getTotalAmount}
      />
    </form>
  )
}

export default EffortAccruForm
