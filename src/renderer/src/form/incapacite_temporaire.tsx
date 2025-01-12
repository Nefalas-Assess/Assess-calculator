import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

const IncapaciteTemporaireForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      personnel: [{ amount: 32 }],
      menage: [{ amount: 30 }],
      ecoNet: [{}],
      brutNet: [{}]
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
    const { amount = 0, percentage = 0, contribution = 0 } = item

    if (contribution) {
      const baseAmount = parseFloat(amount) + (data?.computed_info?.enfant_charge || 0) * 10
      return (
        (parseInt(days) || 0) *
        (parseFloat(baseAmount) || 0) *
        ((parseFloat(percentage) || 0) / 100) *
        (parseFloat(contribution || 0) / 100)
      )
    }

    return (parseInt(days) || 0) * (parseFloat(amount) || 0) * ((parseFloat(percentage) || 0) / 100)
  })

  const getSalaryTotalAmount = useCallback((item, days) => {
    const { amount = 0, percentage = 0 } = item
    return (
      (parseInt(days) || 0) *
      ((parseFloat(amount) || 0) / 365) *
      ((parseFloat(percentage) || 0) / 100)
    ).toFixed(2)
  }, [])

  const persoFields = useFieldArray({
    control,
    name: 'personnel' // Champs dynamiques pour les enfants
  })

  const menageFields = useFieldArray({
    control,
    name: 'menage' // Champs dynamiques pour les enfants
  })

  const ecoNetFields = useFieldArray({
    control,
    name: 'ecoNet' // Champs dynamiques pour les enfants
  })

  const brutNetFields = useFieldArray({
    control,
    name: 'brutNet' // Champs dynamiques pour les enfants
  })

  const addNext = useCallback(
    (fields, name, initial = {}) => {
      const lastRowEnd = formValues?.[name][fields?.fields.length - 1]?.end

      if (lastRowEnd) {
        const finDate = new Date(lastRowEnd)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
          fields.append({ start: finDate.toISOString().split('T')[0], ...initial })
        }
      } else {
        fields.append({ ...initial })
      }
    },
    [formValues]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Incapacités temporaires personnelles</h1>
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
      <button type="button" onClick={() => addNext(persoFields, 'personnel', { amount: 32 })}>
        Ajouter durée
      </button>
      <h1>Incapacités temporaires menagères</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Enfant(s)</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Contribution (%)</th>
            <th>Total (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {menageFields?.fields.map((child, index) => {
            const values = formValues?.menage[index]
            const days = getDays(values)
            const total = getTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`menage.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`menage.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>{data?.computed_info?.enfant_charge || 0}</td>
                <td>
                  <input type="number" step="0.01" {...register(`menage.${index}.amount`)} />( +{' '}
                  {(data?.computed_info?.enfant_charge || 0) * 10}€ )
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`menage.${index}.percentage`)} />
                </td>
                <td>
                  <select {...register(`menage.${index}.contribution`)}>
                    <option value="0">0</option>
                    <option value="100">100</option>
                    <option value="65">65</option>
                    <option value="50">50</option>
                    <option value="35">35</option>
                  </select>
                </td>
                <td>{total}</td>
                <td>
                  <button type="button" onClick={() => menageFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(menageFields, 'menage')}>
        Ajouter durée
      </button>
      <h1>Temporaire économique brut</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel brut</th>
            <th>%</th>
            <th>Total Brut (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ecoNetFields?.fields.map((child, index) => {
            const values = formValues?.ecoNet[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`ecoNet.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`ecoNet.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`ecoNet.${index}.amount`)} />
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`ecoNet.${index}.percentage`)} />
                </td>
                <td>{total}</td>
                <td>
                  <button type="button" onClick={() => ecoNetFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(ecoNetFields, 'ecoNet')}>
        Ajouter durée
      </button>
      <h1>Temporaire économique net</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel Net</th>
            <th>%</th>
            <th>Total Net (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {brutNetFields?.fields.map((child, index) => {
            const values = formValues?.brutNet[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`brutNet.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`brutNet.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`brutNet.${index}.amount`)} />
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`brutNet.${index}.percentage`)} />
                </td>
                <td>{total}</td>
                <td>
                  <button type="button" onClick={() => brutNetFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(brutNetFields, 'brutNet')}>
        Ajouter durée
      </button>
      <button type="submit">Enregistrer</button>
    </form>
  )
}

export default IncapaciteTemporaireForm
