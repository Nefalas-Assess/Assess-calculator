import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import ActionMenuButton from '@renderer/generic/actionButton'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import DynamicTable from '@renderer/generic/dynamicTable'

const ITEconomiqueForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues || {
      net: [],
      brut: []
    }
  })

  const brutFields = useFieldArray({
    control,
    name: 'brut' // Champs dynamiques pour les enfants
  })

  const netFields = useFieldArray({
    control,
    name: 'net' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const brutValues = useWatch({
    control,
    name: 'brut'
  })

  // Utiliser useWatch pour surveiller les FieldArrays
  const netValues = useWatch({
    control,
    name: 'net'
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
      JSON.stringify(brutValues) !== JSON.stringify(previousValuesRef.current?.brut) ||
      JSON.stringify(netValues) !== JSON.stringify(previousValuesRef.current?.net)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        brut: brutValues,
        net: netValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, brutValues, netValues, submitForm, handleSubmit])

  const addNext = useCallback(
    (append, name, initial = {}) => {
      const lastRowEnd = formValues?.[name]?.[formValues?.[name]?.length - 1]?.end

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

  const getSalaryTotalAmount = useCallback((item = {}, days) => {
    const { amount = 0, percentage = 0 } = item
    return (
      (parseInt(days) || 0) *
      ((parseFloat(amount) || 0) / 365) *
      ((parseFloat(percentage) || 0) / 100)
    ).toFixed(2)
  }, [])

  const copyDate = useCallback(
    (name, fieldName) => {
      const initial = typeof name === 'string' ? get(data, name) : name
      let filteredData = initial.map(({ start, end }) => ({ start, end }))
      const currentData = cloneDeep(formValues?.[fieldName])
      if (currentData) {
        filteredData = currentData.concat(filteredData)
      }
      setValue(fieldName, filteredData)
    },
    [formValues]
  )

  const columns = [
    { header: 'Début', key: 'start', type: 'start' },
    { header: 'Fin', key: 'end', type: 'end' },
    { header: 'Jours', key: 'days', type: 'calculated' },
    { header: 'Salaire annuel net', key: 'amount', type: 'number' },
    { header: '%', key: 'percentage', type: 'number', width: 50 },
    { header: 'Total net', key: 'total', type: 'calculated' },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    { header: 'Intérêts', key: 'interest', type: 'interest', median: true, className: 'int' }
  ]

  const customActions = (name) => ({
    label: 'Importer dates',
    actions: [
      { label: 'Personnel', action: () => copyDate('incapacite_temp_personnel.periods', name) },
      { label: 'Ménagère', action: () => copyDate('incapacite_temp_menagere.periods', name) },
      {
        label: `Economique ${name === 'net' ? 'brut' : 'net'}`,
        action: () => copyDate(name === 'net' ? formValues?.brut : formValues?.net, name)
      }
    ]
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Incapacités temporaires économiques"
        subtitle="Indemnisation nette"
        columns={columns}
        control={control}
        name="net"
        formValues={formValues}
        editable={editable}
        calculateTotal={getSalaryTotalAmount}
        customActions={customActions('net')}
      />

      <DynamicTable
        subtitle="Indemnisation brute"
        columns={columns}
        control={control}
        name="brut"
        formValues={formValues}
        editable={editable}
        calculateTotal={getSalaryTotalAmount}
        customActions={customActions('brut')}
      />
      <table style={{ maxWidth: 1200 }}>
        <tr>
          <td>Estimation/Réclamation</td>
          <td>
            <Field control={control} type="number" name={`estimate`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
          </td>
          {editable && (
            <td>
              <button type="button" onClick={() => setValue('estimate', '')}>
                Supprimer
              </button>
            </td>
          )}
        </tr>
      </table>
    </form>
  )
}

export default ITEconomiqueForm
