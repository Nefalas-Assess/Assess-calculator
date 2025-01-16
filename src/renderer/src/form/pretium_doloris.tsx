import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { findClosestIndex, getDays } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'

const PretiumDolorisForm = ({ initialValues, onSubmit }) => {
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
      <table>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Coefficient</th>
            <th>Total (€)</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.periods[index]
            const days = getDays(values)
            const total = getAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`periods.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`periods.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <select {...register(`periods.${index}.coefficient`)}>
                    <option value="1.15">1/7</option>
                    <option value="3.50">2/7</option>
                    <option value="7">3/7</option>
                    <option value="11.50">4/7</option>
                    <option value="17">5/7</option>
                    <option value="24">6/7</option>
                    <option value="32">7/7</option>
                  </select>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <input type="date" {...register(`periods.${index}.date_paiement`)} />
                </td>
                <td className="int">Nombre de jours entre [Date médiane entre (Début	Fin) & Date du paiement] * Total * (%int de infog / 365)</td>
                <td>
                  <button type="button" onClick={() => remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(append, {})}>
        Ajouter une ligne
      </button>
    </form>
  )
}

export default PretiumDolorisForm
