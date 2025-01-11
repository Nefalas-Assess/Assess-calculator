import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex } from '@renderer/helpers/general'
import { useForm, useWatch } from 'react-hook-form'

const PrejudiceParticuliersForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues || {
      coefficient_quantum_doloris: '',
      coefficient_prejudice_esthétique: ''
    }
  })

  const formValues = watch()

  const previousValuesRef = useRef(formValues)

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  // Utilisation de useEffect pour soumettre dès que le champ change
  useEffect(() => {
    // Comparer les anciennes et nouvelles valeurs
    const valuesChanged = Object.keys(formValues).some(
      (key) => formValues[key] !== previousValuesRef.current[key]
    )

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      handleSubmit(submitForm)() // Soumet le formulaire
      previousValuesRef.current = formValues // Mettre à jour les anciennes valeurs
    }
  }, [formValues, submitForm])

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
    </form>
  )
}

export default PrejudiceParticuliersForm
