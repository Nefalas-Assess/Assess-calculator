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

const ITEconomiqueForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues || {
      net: [{}],
      brut: [{}]
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Incapacités économiques temporaires</h1>
      <h3>Indemnisation nette</h3>
      <table id="ipTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel net</th>
            <th>%</th>
            <th>Total Net</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {netFields?.fields.map((child, index) => {
            const values = formValues?.net[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`net.${index}.start`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`net.${index}.end`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{days}</td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`net.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`net.${index}.percentage`}
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 50 }} {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name={`net.${index}.date_paiement`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest amount={total} start={getMedDate(values)} end={values?.date_paiement} />
                </td>

                {editable && (
                  <td>
                    <button type="button" onClick={() => netFields.remove(index)}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <div className="buttons-row">
          <button type="button" onClick={() => addNext(netFields?.append, 'net')}>
            Ajouter durée
          </button>
          <ActionMenuButton
            label="Importer dates"
            actions={[
              {
                label: 'Personnel',
                action: () => copyDate('incapacite_temp_personnel.periods', 'net')
              },
              {
                label: 'Ménagère',
                action: () => copyDate('incapacite_temp_menagere.periods', 'net')
              },
              {
                label: 'Economique brut',
                action: () => copyDate(formValues?.brut, 'net')
              }
            ]}
          />
        </div>
      )}

      <h3>Indemnisation brute</h3>
      <table id="ipTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel brut</th>
            <th>%</th>
            <th>Total Brut</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {brutFields?.fields.map((child, index) => {
            const values = formValues?.brut[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`brut.${index}.start`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`brut.${index}.end`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{days}</td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`brut.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`brut.${index}.percentage`}
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 50 }} {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name={`brut.${index}.date_paiement`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest amount={total} start={getMedDate(values)} end={values?.date_paiement} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => brutFields.remove(index)}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <div className="buttons-row">
          <button type="button" onClick={() => addNext(brutFields?.append, 'brut')}>
            Ajouter durée
          </button>
          <ActionMenuButton
            label="Importer dates"
            actions={[
              {
                label: 'Personnel',
                action: () => copyDate('incapacite_temp_personnel.periods', 'brut')
              },
              {
                label: 'Ménagère',
                action: () => copyDate('incapacite_temp_menagere.periods', 'brut')
              },
              {
                label: 'Economique net',
                action: () => copyDate(formValues?.net, 'brut')
              }
            ]}
          />
        </div>
      )}
    </form>
  )
}

export default ITEconomiqueForm
