import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { AppContext } from '@renderer/providers/AppProvider'
import { isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import TextItem from '@renderer/generic/textItem'

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

  const getAmount = useCallback((point, pourcentage, pourcentage2) => {
    return {
      tooltip: (
        <div>
          <math>
            <mn>{point}</mn>
            <mo>x</mo>
            <mn>{parseInt(pourcentage || 0)}</mn>
            {pourcentage2 && (
              <>
                <mo>x</mo>
                <mfrac>
                  <mn>{parseInt(pourcentage2 || 0)}</mn>
                  <mn>100</mn>
                </mfrac>
              </>
            )}
          </math>
        </div>
      ),
      value: (point * parseInt(pourcentage || 0) * (parseInt(pourcentage2 || 100) / 100)).toFixed(2)
    }
  }, [])

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextItem path={'incapacite_perma.forfait.title_inc_perma'} tag="h1" />

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path={'common.age_consolidation'} tag="th" />
            <TextItem path={'common.points'} tag="th" />
            <th style={{ width: 50 }}>%</th>
            <TextItem path={'common.total'} tag="th" />
            <TextItem path={'common.date_paiement'} tag="th" className="int" />
            <TextItem path={'common.interest'} tag="th" className="int" />
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
              <Money
                value={getAmount(point, formValues?.pourcentage_ipp)?.value}
                tooltip={getAmount(point, formValues?.pourcentage_ipp)?.tooltip}
              />
            </td>
            <td className="int">
              <Field control={control} type="date" name={`perso_date_paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={getAmount(point, formValues?.pourcentage_ipp)?.value}
                start={data?.general_info?.date_consolidation}
                end={formValues?.perso_date_paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <TextItem path={'incapacite_perma.forfait.title_menage'} tag="h1" />

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path={'common.age_consolidation'} tag="th" />
            <TextItem path={'common.points'} tag="th" />
            <th style={{ width: 50 }}>%</th>
            <TextItem path={'common.contribution'} tag="th" style={{ width: 120 }} />
            <TextItem path={'common.total'} tag="th" />
            <TextItem path={'common.date_paiement'} tag="th" className="int" />
            <TextItem path={'common.interest'} tag="th" className="int" />
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
                value={
                  getAmount(point, formValues?.pourcentage_imp, formValues?.contribution_imp)?.value
                }
                tooltip={
                  getAmount(point, formValues?.pourcentage_imp, formValues?.contribution_imp)
                    ?.tooltip
                }
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
                  getAmount(point, formValues?.pourcentage_imp, formValues?.contribution_imp)?.value
                }
                start={data?.general_info?.date_consolidation}
                end={formValues?.menage_date_paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <TextItem path={'incapacite_perma.forfait.title_eco'} tag="h1" />

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path={'common.age_consolidation'} tag="th" />
            <TextItem path={'common.points'} tag="th" />
            <th style={{ width: 50 }}>%</th>
            <TextItem path={'common.total'} tag="th" />
            <TextItem path={'common.date_paiement'} tag="th" className="int" />
            <TextItem path={'common.interest'} tag="th" className="int" />
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
              <Money
                value={getAmount(point, formValues?.pourcentage_iep)?.value}
                tooltip={getAmount(point, formValues?.pourcentage_iep)?.tooltip}
              />
            </td>
            <td className="int">
              <Field control={control} type="date" name={`eco_date_paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={getAmount(point, formValues?.pourcentage_iep)?.value}
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
