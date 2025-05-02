import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { AppContext } from '@renderer/providers/AppProvider'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
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
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'periods' // Champs dynamiques pour les enfants
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

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.periods?.[formValues?.periods?.length - 1]?.end

      if (lastRowEnd) {
        const finDate = new Date(lastRowEnd)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
          append({ start: finDate.toISOString().split('T')[0], ...initial })
        }
      } else {
        append({ ...initial })
      }
    },
    [formValues]
  )

  const columns = [
    { header: 'Début', key: 'start', type: 'start' },
    { header: 'Fin', key: 'end', type: 'end' },
    { header: 'Jours', key: 'days', type: 'calculated' },
    { header: 'Coefficient', key: 'coefficient', type: 'select', options: coefficients },
    { header: 'Total (€)', key: 'total', type: 'calculated' },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'Intérêts (€)', key: 'interest', type: 'interest', median: true, className: 'int' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Pretium Doloris Temporaire"
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
