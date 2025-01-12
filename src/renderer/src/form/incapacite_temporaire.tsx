import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

const IncapaciteTemporaireForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      personnel: [{ amount: 32 }]
    }
  })

  const formValues = watch()

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

  const getTotalAmount = useCallback((item, days) => {
    const { amount = 0, percentage = 0 } = item
    return (
      (parseInt(days) || 0) *
      (parseFloat(amount) || 0) *
      ((parseFloat(percentage) || 0) / 100)
    ).toFixed(2)
  })

  const persoFields = useFieldArray({
    control,
    name: 'personnel' // Champs dynamiques pour les enfants
  })

  const addNext = useCallback((fields, initial = {}) => {
    const lastRowEnd = fields?.fields[fields?.fields.length - 1].end
    if (lastRowEnd) {
      const finDate = new Date(lastRowEnd)
      if (!isNaN(finDate)) {
        finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
        fields.append({ start: finDate.toISOString().split('T')[0], ...initial })
      }
    } else {
      fields.append({ ...initial })
    }
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Personnelles</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Total (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {persoFields?.fields.map((child, index) => {
            const values = formValues?.personnel[index]
            const days = getDays(values)
            const total = getTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`personnel.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`personnel.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`personnel.${index}.amount`)} />
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`personnel.${index}.percentage`)} />
                </td>
                <td>{total}</td>
                <td>
                  <button type="button" onClick={() => persoFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(persoFields, { amount: 32 })}>
        Ajouter durée
      </button>
    </form>
  )
}

export default IncapaciteTemporaireForm
