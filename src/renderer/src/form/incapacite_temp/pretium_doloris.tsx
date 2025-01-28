import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { AppContext } from '@renderer/providers/AppProvider'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'

const PretiumDolorisForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: [{}]
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Pretium Doloris Temporaire</h1>
      <table style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Coefficient</th>
            <th>Total (€)</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.periods[index]
            const days = getDays(values)
            const total = getAmount(values, days)
            return (
              <tr key={child.id}>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`periods.${index}.start`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`periods.${index}.end`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{days}</td>
                <td>
                  <Field
                    control={control}
                    name={`periods.${index}.coefficient`}
                    editable={editable}
                  >
                    {(props) => (
                      <select {...props}>
                        <option>Select</option>
                        <option value="1.15">1/7</option>
                        <option value="3.50">2/7</option>
                        <option value="7">3/7</option>
                        <option value="11.50">4/7</option>
                        <option value="17">5/7</option>
                        <option value="24">6/7</option>
                        <option value="32">7/7</option>
                      </select>
                    )}
                  </Field>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    name={`periods.${index}.date_paiement`}
                    editable={editable}
                    type="date"
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest amount={total} start={getMedDate(values)} end={values?.date_paiement} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => remove(index)}>
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
        <button type="button" onClick={() => addNext(append, {})}>
          Ajouter une ligne
        </button>
      )}
    </form>
  )
}

export default PretiumDolorisForm
