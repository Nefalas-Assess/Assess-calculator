import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

const ITEconomiqueForm = ({ initialValues, onSubmit }) => {
  const { control, register, handleSubmit, watch } = useForm({
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>NET</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel net</th>
            <th>%</th>
            <th>Total Net (€)</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {netFields?.fields.map((child, index) => {
            const values = formValues?.net[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`net.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`net.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`net.${index}.amount`)} />
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`net.${index}.percentage`)} />
                </td>
                <td>{total}</td>
                <td className="int">
                  <input type="date" {...register(`iten.${index}.date_paiement`)} />
                </td>
                <td className="int"></td>
                <td>
                  <button type="button" onClick={() => netFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(netFields?.append, 'net')}>
        Ajouter durée
      </button>

      <h1>BRUT</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Salaire annuel brut</th>
            <th>%</th>
            <th>Total Brut (€)</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {brutFields?.fields.map((child, index) => {
            const values = formValues?.brut[index]
            const days = getDays(values)
            const total = getSalaryTotalAmount(values, days)
            return (
              <tr key={child.id}>
                <td>
                  <input type="date" {...register(`brut.${index}.start`)} />
                </td>
                <td>
                  <input type="date" {...register(`brut.${index}.end`)} />
                </td>
                <td>{days}</td>
                <td>
                  <input type="number" step="0.01" {...register(`brut.${index}.amount`)} />
                </td>
                <td>
                  <input type="number" step="0.01" {...register(`brut.${index}.percentage`)} />
                </td>
                <td>{total}</td>
                <td className="int">
                  <input type="date" {...register(`iteb.${index}.date_paiement`)} />
                </td>
                <td className="int"></td>
                <td>
                  <button type="button" onClick={() => brutFields.remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(brutFields?.append, 'brut')}>
        Ajouter durée
      </button>
    </form>
  )
}

export default ITEconomiqueForm
