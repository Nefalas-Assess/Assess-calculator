import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { intervalToDuration } from 'date-fns'
import data_f from '@renderer/data/data_ff_f'
import data_h from '@renderer/data/data_ff_h'

const FraisFunForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      ref: 'schryvers',
      charges: [{}]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'charges' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
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
      JSON.stringify(chargesValues) !== JSON.stringify(previousValuesRef.current?.charges)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, submitForm, handleSubmit])

  const contributionOptions = [0.5, 0.8, 1, 1.5, 2, 3]

  const getTotalAnticipated = useCallback(
    (index) => {
      const amount = parseFloat(formValues?.charges?.[index]?.amount, 10)
      const { years: age } = intervalToDuration({
        start: data?.general_info?.date_naissance,
        end: formValues?.date
      })
      const rate = contributionOptions?.findIndex((e) => e === parseFloat(formValues?.rate))
      const table = data?.general_info?.sexe === 'homme' ? data_h : data_f

      const coef = table?.[age]?.[rate]

      return amount * coef
    },
    [formValues, data]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Frais funéraires anticipés</h1>
      <h3>Variables</h3>
      <table id="IPVariables">
        <tr>
          <td>Tables de référence</td>
          <td>
            <select {...register('ref')}>
              <option value="schryvers">Schryvers 2024 | Paiement anticipé frais funéraires</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Taux d'intérêt</td>
          <td>
            <select style={{ width: 120 }} {...register(`rate`)}>
              {contributionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </select>
          </td>
        </tr>
        <tr>
          <td>Date du décès</td>
          <td>
            <input type="date" {...register('date')} />
          </td>
        </tr>
      </table>

      <h3>Frais</h3>
      <table id="itebTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant (€)</th>
            <th>Total anticipé</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            return (
              <tr key={child.id}>
                <td>
                  <input {...register(`charges.${index}.name`)} />
                </td>
                <td>
                  <input type="number" {...register(`charges.${index}.amount`)} />
                </td>
                <td>
                  <Money value={getTotalAnticipated(index)} />
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
      <button type="button" onClick={() => append({})}>
        Ajouter une ligne
      </button>
    </form>
  )
}

export default FraisFunForm
