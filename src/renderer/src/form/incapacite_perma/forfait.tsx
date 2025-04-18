import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { AppContext } from '@renderer/providers/AppProvider'
import { isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'

export const ForfaitForm = ({ onSubmit, initialValues, editable = true }) => {
  const { data } = useContext(AppContext)

  const { register, handleSubmit, watch, control } = useForm({
    defaultValues: initialValues || {
      contribution_imp: data?.general_info?.config?.default_contribution
    }
  })

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

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <Field control={control} name={`pourcentage_ipp`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} {...props} />}
              </Field>
            </td>
            <td>
              <Money value={(point * parseInt(formValues?.pourcentage_ipp || 0)).toFixed(2)} />
            </td>
            <td className="int">
              <Field control={control} type="date" name={`perso_date_paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={point * parseInt(formValues?.pourcentage_ipp || 0)}
                start={data?.general_info?.date_consolidation}
                end={formValues?.perso_date_paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h1>Incapacités ménagères permanentes</h1>

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th style={{ width: 50 }}>%</th>
            <th style={{ width: 120 }}>Contribution (%)</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <Field control={control} name={`pourcentage_imp`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} {...props} />}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                style={{ width: 120 }}
                type="select"
                options={constants.contribution}
                name={`contribution_imp`}
                editable={editable}
              ></Field>
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
            <td className="int">
              <Field
                control={control}
                type="date"
                name={`menage_date_paiement`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={
                  point *
                  parseInt(formValues?.pourcentage_imp || 0) *
                  ((formValues?.contribution_imp || 0) / 100)
                }
                start={data?.general_info?.date_consolidation}
                end={formValues?.menage_date_paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h1>Incapacités économiques permanentes</h1>

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Points</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>{point}</td>
            <td>
              <Field control={control} name={`pourcentage_iep`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} {...props} />}
              </Field>
            </td>
            <td>
              <Money value={(point * parseInt(formValues?.pourcentage_iep || 0)).toFixed(2)} />
            </td>
            <td className="int">
              <Field control={control} type="date" name={`eco_date_paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={point * parseInt(formValues?.pourcentage_iep || 0)}
                start={data?.general_info?.date_consolidation}
                end={formValues?.eco_date_paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default ForfaitForm
