import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

const PrejudiceParticuliersForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      coefficient_quantum_doloris: '',
      coefficient_prejudice_esthétique: ''
    }
  })

  const prejudiceSexuelField = useFieldArray({
    control,
    name: 'prejudice_sexuels' // Champs dynamiques pour les enfants
  })

  const prejudiceAgrementField = useFieldArray({
    control,
    name: 'prejudice_agrements'
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const prejudiceSexuelValues = useWatch({
    control,
    name: 'prejudice_sexuels'
  })

  const prejudiceAgrementValues = useWatch({
    control,
    name: 'prejudice_agrements'
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
      JSON.stringify(prejudiceSexuelValues) !==
        JSON.stringify(previousValuesRef.current?.prejudice_sexuels) ||
      JSON.stringify(prejudiceAgrementValues) !==
        JSON.stringify(previousValuesRef.current?.prejudice_agrements)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        prejudice_sexuels: prejudiceSexuelValues,
        prejudice_agrements: prejudiceAgrementValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, prejudiceSexuelValues, prejudiceAgrementValues, submitForm, handleSubmit])

  const getTotalWithCoef = useCallback(
    (coefficient) => {
      const coef = coefficient && parseInt(coefficient) - 1
      const age = data?.computed_info?.age_consolidation
      const keys = Object.keys(data_pp)
      const ageKey = findClosestIndex(keys, age)
      return Object.values(data_pp)[ageKey][coef]
    },
    [data]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Quantum Doloris</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Coefficient</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>
              <select {...register('coefficient_quantum_doloris')}>
                <option value="" disabled>
                  Select
                </option>
                <option value={1}>1/7</option>
                <option value={2}>2/7</option>
                <option value={3}>3/7</option>
                <option value={4}>4/7</option>
                <option value={5}>5/7</option>
                <option value={6}>6/7</option>
                <option value={7}>7/7</option>
              </select>
            </td>
            <td>{getTotalWithCoef(formValues?.coefficient_quantum_doloris)}</td>
          </tr>
        </tbody>
      </table>
      <h1>Préjudice Esthétique</h1>
      <table id="ipTable">
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Coefficient</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>
              <select {...register('coefficient_prejudice_esthétique')}>
                <option value="" disabled>
                  Select
                </option>
                <option value={1}>1/7</option>
                <option value={2}>2/7</option>
                <option value={3}>3/7</option>
                <option value={4}>4/7</option>
                <option value={5}>5/7</option>
                <option value={6}>6/7</option>
                <option value={7}>7/7</option>
              </select>
            </td>
            <td>{getTotalWithCoef(formValues?.coefficient_prejudice_esthétique)}</td>
          </tr>
        </tbody>
      </table>
      <h1>Préjudice Sexuel</h1>
      <table>
        <thead>
          <tr>
            <th>Indemnités/Frais</th>
            <th>Payé</th>
            <th>Montant</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {prejudiceSexuelField?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <input type="text" {...register(`prejudice_sexuels.${index}.indemnite`)} />
              </td>
              <td>
                <select {...register(`prejudice_sexuels.${index}.paid`)}>
                  <option value={true}>Oui</option>
                  <option value={false}>Non</option>
                </select>
              </td>
              <td>
                <input type="number" {...register(`prejudice_sexuels.${index}.amount`)} />
              </td>
              <td>
                <button type="button" onClick={() => prejudiceSexuelField.remove(index)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={() => prejudiceSexuelField?.append({ paid: true })}>
        Ajouter une ligne
      </button>
      <h1>Préjudice d'Agrément</h1>
      <table>
        <thead>
          <tr>
            <th>Indemnités/Frais</th>
            <th>Payé</th>
            <th>Montant</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {prejudiceAgrementField?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <input type="text" {...register(`prejudice_agrements.${index}.indemnite`)} />
              </td>
              <td>
                <select {...register(`prejudice_agrements.${index}.paid`)}>
                  <option value={true}>Oui</option>
                  <option value={false}>Non</option>
                </select>
              </td>
              <td>
                <input type="number" {...register(`prejudice_agrements.${index}.amount`)} />
              </td>
              <td>
                <button type="button" onClick={() => prejudiceAgrementField.remove(index)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={() => prejudiceAgrementField?.append({ paid: true })}>
        Ajouter une ligne
      </button>
    </form>
  )
}

export default PrejudiceParticuliersForm
