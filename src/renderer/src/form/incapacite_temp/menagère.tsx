import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import { getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

const ITMenagereForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: [{ amount: 30 }]
    }
  })

  const formValues = watch()

  const previousValuesRef = useRef({})

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'periods' // Champs dynamiques pour les enfants
  })

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

  const getDays = useCallback((item) => {
    const { start, end } = item

    if (start && end) {
      const debutDate = new Date(start)
      const finDate = new Date(end)

      // Vérification des dates valides
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates en tenant compte de la date de début et de fin
        const timeDiff = finDate.getTime() - debutDate.getTime() // En millisecondes
        const jours = Math.max(0, timeDiff / (1000 * 3600 * 24) + 1) // Conversion en jours
        return jours
      }
    }
  }, [])

  const getTotalAmount = useCallback(
    (item, days) => {
      const { amount = 0, percentage = 0, contribution = 0 } = item

      const baseAmount = parseFloat(amount) + (data?.computed_info?.enfant_charge || 0) * 10
      return (
        (parseInt(days) || 0) *
        (parseFloat(baseAmount) || 0) *
        ((parseFloat(percentage) || 0) / 100) *
        (parseFloat(contribution || 0) / 100)
      ).toFixed(2)
    },
    [data]
  )

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
      <h1>Menagères</h1>
      <table id="ipTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Enfant(s)</th>
            <th>Indemnité journalière (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Contribution (%)</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.periods[index]
            const days = getDays(values)
            const total = getTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td style={{ width: 140 }}>
                  <input type="date" {...register(`periods.${index}.start`)} />
                </td>
                <td style={{ width: 140 }}>
                  <input type="date" {...register(`periods.${index}.end`)} />
                </td>
                <td style={{ width: 50 }}>{days}</td>
                <td style={{ width: 50 }}>{data?.computed_info?.enfant_charge || 0}</td>
                <td style={{ width: 200 }}>
                  <input
                    type="number"
                    style={{ width: 50 }}
                    {...register(`periods.${index}.amount`)}
                  />
                  ( + {(data?.computed_info?.enfant_charge || 0) * 10}€ )
                </td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    {...register(`periods.${index}.percentage`)}
                  />
                </td>
                <td style={{ width: 140 }}>
                  <select {...register(`periods.${index}.contribution`)}>
                    <option value="0">0</option>
                    <option value="100">100</option>
                    <option value="65">65</option>
                    <option value="50">50</option>
                    <option value="35">35</option>
                  </select>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <input type="date" {...register(`periods.${index}.date_paiement`)} />
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
      <button type="button" onClick={() => addNext(append, { amount: 30 })}>
        Ajouter durée
      </button>
    </form>
  )
}

export default ITMenagereForm
