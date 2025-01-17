import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'

const EffortAccruForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      efforts: [{ coefficient: 5, amount: 30 }]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'efforts' // Champs dynamiques pour les enfants
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

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.efforts?.[formValues?.efforts?.length - 1]?.end

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
      <h1>Efforts accrus</h1>
      <table style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Coefficient</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.efforts[index]
            const days = getDays(values)
            const total = getTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`efforts.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`efforts.${index}.end`)} />
                </td>
                <td style={{ width: 50 }}>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`efforts.${index}.amount`)} />
                </td>
                <td style={{ width: 50 }}>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    {...register(`efforts.${index}.pourcentage`)}
                  />
                </td>
                <td style={{ width: 50 }}>
                  <select {...register(`efforts.${index}.coefficient`)}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                  </select>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <input type="date" {...register(`efforts.${index}.date_paiement`)} />
                </td>
                <td className="int">
                  <Interest amount={total} start={getMedDate(values)} end={values?.date_paiement} />
                </td>
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
      <button type="button" onClick={() => addNext(append, { coefficient: 5, amount: 30 })}>
        Ajouter une ligne
      </button>
    </form>
  )
}

export default EffortAccruForm
