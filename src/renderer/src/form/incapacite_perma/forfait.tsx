import Money from '@renderer/generic/money'
import { AppContext } from '@renderer/providers/AppProvider'
import { isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

export const ForfaitForm = ({ onSubmit, initialValues }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {}
  })

  const { data } = useContext(AppContext)

  const formValues = watch()

  const previousValuesRef = useRef({})

  const submitForm = (values) => {
    onSubmit(values)
  }

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, submitForm, handleSubmit])

  const contributionOptions = [0, 100, 65, 50, 35]

  const getPoint = useCallback((age) => {
    if (age <= 15) return 3660
    else if (age >= 85) return 495
    else if (age === 16) return 3600
    else if (age === 17) return 3555
    else {
      const mult = age - 17
      return 3555 - mult * 45
    }
  }, [])

  const point = useMemo(() => getPoint(data?.computed_info?.age_consolidation), [getPoint, data])

  const getTotalSum = useCallback(
    (values) => {
      const sum1 = point * parseInt(values?.pourcentage_ipp || 0)
      const sum2 =
        point * parseInt(values?.pourcentage_imp || 0) * ((values?.contribution_imp || 0) / 100)
      const sum3 = point * parseInt(values?.pourcentage_iep || 0)

      return (sum1 + sum2 + sum3).toFixed(2)
    },
    [point]
  )

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>Incapacités personnelles permanentes</h1>

      <table id="ipTable">
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th>%</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <input type="number" {...register(`pourcentage_ipp`)} />
            </td>
            <td>
              <Money value={(point * parseInt(formValues?.pourcentage_ipp || 0)).toFixed(2)} />
            </td>
          </tr>
        </tbody>
      </table>

      <h1>Incapacités ménagères permanentes</h1>

      <table id="ipTable">
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th>%</th>
            <th>Contribution (%)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <input type="number" {...register(`pourcentage_imp`)} />
            </td>
            <td>
              <select {...register(`contribution_imp`)}>
                {contributionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}%
                  </option>
                ))}
              </select>
            </td>
            <td>
              <Money
                value={(
                  point *
                  parseInt(formValues?.pourcentage_imp || 0) *
                  ((formValues?.contribution_imp || 0) / 100)
                ).toFixed(2)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h1>Incapacités économiques permanentes</h1>

      <table id="ipTable">
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th>%</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <input type="number" {...register(`pourcentage_iep`)} />
            </td>
            <td>
              <Money value={(point * parseInt(formValues?.pourcentage_iep || 0)).toFixed(2)} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="total-box">
        <strong>Total : </strong> <Money value={getTotalSum(formValues)} />
      </div>
    </form>
  )
}

export default ForfaitForm
