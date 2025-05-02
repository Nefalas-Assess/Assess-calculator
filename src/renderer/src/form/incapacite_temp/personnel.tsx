import ActionMenuButton from '@renderer/generic/actionButton'
import Field from '@renderer/generic/field'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import DynamicTable from '@renderer/generic/dynamicTable'

const ITPersonnelForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)
  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const formValues = watch()

  const previousValuesRef = useRef({})

  const periodsValues = useWatch({
    control,
    name: 'periods'
  })

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
    const { amount = 0, percentage = 0 } = item

    return (
      (parseInt(days) || 0) *
      (parseFloat(amount) || 0) *
      ((parseFloat(percentage) || 0) / 100)
    ).toFixed(2)
  })

  const copyDate = useCallback(
    (name) => {
      const initial = get(data, name)
      let filteredData = initial.map(({ start, end }) => ({ start, end, amount: 32 }))
      const currentData = cloneDeep(formValues?.periods)
      if (formValues?.periods) {
        filteredData = currentData.concat(filteredData)
      }
      setValue('periods', filteredData)
    },
    [formValues]
  )

  const customActions = {
    label: 'Importer dates',
    actions: [
      { label: 'Ménagère', action: () => copyDate('incapacite_temp_menagere.periods') },
      { label: 'Economique net', action: () => copyDate('incapacite_temp_economique.net') },
      { label: 'Economique brut', action: () => copyDate('incapacite_temp_economique.brut') }
    ]
  }

  const columns = [
    { header: 'Début', key: 'start', type: 'start' },
    { header: 'Fin', key: 'end', type: 'end' },
    { header: 'Jours', key: 'days', type: 'calculated' },
    { header: 'Indemnité journalière (€)', key: 'amount', type: 'number' },
    { header: '%', key: 'percentage', type: 'number', width: 50 },
    { header: 'Total', key: 'total', type: 'calculated' },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'Intérêts', key: 'interest', type: 'interest', median: true, className: 'int' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Incapacités temporaires personnelles"
        columns={columns}
        control={control}
        name="periods"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ amount: 32 }}
        calculateTotal={getTotalAmount}
        customActions={customActions}
      />
    </form>
  )
}

export default ITPersonnelForm
