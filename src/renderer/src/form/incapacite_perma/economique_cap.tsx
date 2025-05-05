import { getDays, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { format, intervalToDuration, isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'
import TextItem from '@renderer/generic/textItem'

export const IPEcoCapForm = ({ onSubmit, initialValues, editable = true }) => {
  const { data } = useContext(AppContext)

  const { handleSubmit, watch, control } = useForm({
    defaultValues: initialValues || {}
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const brutValues = useWatch({
    control,
    name: 'brut'
  })

  const netValues = useWatch({
    control,
    name: 'net'
  })

  const previousValuesRef = useRef({})

  const submitForm = (values) => {
    onSubmit(values)
  }

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(brutValues) !== JSON.stringify(previousValuesRef.current.brut) ||
      JSON.stringify(netValues) !== JSON.stringify(previousValuesRef.current.net)

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
  }, [formValues, submitForm, handleSubmit, netValues, brutValues])

  const days = useMemo(() => {
    return {
      brut: getDays({
        start: data?.general_info?.date_consolidation,
        end: formValues?.paiement
      }),
      net: getDays({
        start: data?.general_info?.date_consolidation,
        end: formValues?.paiement
      })
    }
  }, [formValues, data])

  const getConsoAmount = useCallback(
    (values, name) => {
      const { conso_amount, conso_pourcentage } = values || {}
      const numDays = days[name || 'brut']

      return (
        parseInt(numDays || 0) *
        (parseFloat(conso_amount || 0) / 365) *
        (parseFloat(conso_pourcentage || 0) / 100)
      ).toFixed(2)
    },
    [days]
  )

  const getCapAmount = useCallback(
    (values) => {
      const { amount = 0, pourcentage = 0 } = values || {}

      const index = constants?.interet_amount?.findIndex(
        (e) => e?.value === parseFloat(formValues?.interet || 0)
      )

      const coef = useCapitalization({
        end: formValues?.paiement,
        ref: formValues?.reference,
        index
      })

      return (parseFloat(amount) * (parseFloat(pourcentage) / 100) * parseFloat(coef)).toFixed(2)
    },
    [data, formValues]
  )

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextItem path={'incapacite_perma.eco_cap.title'} tag="h1" />
      <TextItem path={'common.variables_cap'} tag="h3" />
      <table id="IPVariables">
        <tbody>
          <tr>
            <TextItem path={'common.ref_table'} tag="td" />
            <td>
              <Field
                control={control}
                type="reference"
                options={constants.reference}
                name={`reference`}
                editable={editable}
              ></Field>
            </td>
          </tr>
          <tr>
            <TextItem path={'common.taux_interet_capitalisation'} tag="td" />
            <td>
              <Field
                control={control}
                type="select"
                options={constants.interet_amount}
                name={`interet`}
                editable={editable}
              ></Field>
            </td>
          </tr>
          <tr>
            <TextItem path={'common.date_paiement'} tag="td" />
            <td>
              <Field control={control} type="date" name={`paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>
      <FadeIn show={formValues?.paiement && formValues?.reference && formValues?.interet}>
        <TextItem path={'common.period_consolidation_payment'} tag="h3" />
        <table id="ippcTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <TextItem path={'common.date_consolidation'} tag="th" />
              <TextItem path={'common.date_paiement'} tag="th" />
              <TextItem path={'common.days'} tag="th" />
              <TextItem path={'incapacite_perma.eco_cap.salary_yearly_brut'} tag="th" />
              <th style={{ width: 50 }}>%</th>
              <TextItem path={'common.total_brut'} tag="th" />
              <TextItem path="common.interest" tag="th" className="int" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {data?.general_info?.date_consolidation &&
                  format(data?.general_info?.date_consolidation, 'dd/MM/yyyy')}
              </td>
              <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>
              <td style={{ width: 50 }}>{days?.brut || 0}</td>
              <td>
                <Field
                  control={control}
                  type="number"
                  name={`brut.conso_amount`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  type="number"
                  name={`brut.conso_pourcentage`}
                  editable={editable}
                >
                  {(props) => <input style={{ width: 50 }} {...props} />}
                </Field>
              </td>
              <td>
                <Money value={getConsoAmount(formValues?.brut, 'brut')} />
              </td>
              <td className="int">
                <Interest
                  amount={getConsoAmount(formValues?.brut, 'brut')}
                  start={getMedDate({
                    start: data?.general_info?.date_consolidation,
                    end: formValues?.paiement
                  })}
                  end={formValues?.paiement}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <table id="ippcTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <TextItem path={'common.date_consolidation'} tag="th" />
              <TextItem path={'common.date_paiement'} tag="th" />
              <TextItem path={'common.days'} tag="th" />
              <TextItem path={'common.salary_yearly_net'} tag="th" />
              <th style={{ width: 50 }}>%</th>
              <TextItem path={'common.total_net'} tag="th" />
              <TextItem path="common.interest" tag="th" className="int" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {data?.general_info?.date_consolidation &&
                  format(data?.general_info?.date_consolidation, 'dd/MM/yyyy')}
              </td>
              <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>
              <td style={{ width: 50 }}>{days?.net || 0}</td>
              <td>
                <Field control={control} name={`net.conso_amount`} editable={editable}>
                  {(props) => <input type="number" {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  type="number"
                  name={`net.conso_pourcentage`}
                  editable={editable}
                >
                  {(props) => <input style={{ width: 50 }} {...props} />}
                </Field>
              </td>
              <td>
                <Money value={getConsoAmount(formValues?.net, 'net')} />
              </td>
              <td className="int">
                <Interest
                  amount={getConsoAmount(formValues?.net, 'net')}
                  start={getMedDate({
                    start: data?.general_info?.date_consolidation,
                    end: formValues?.paiement
                  })}
                  end={formValues?.paiement}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <TextItem path={'incapacite_perma.eco_cap.title_eco'} tag="h3" />
        <table id="itebTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <TextItem path={'incapacite_perma.eco_cap.salary_yearly_brut'} tag="th" />
              <th style={{ width: 50 }}>%</th>
              <TextItem path={'common.total'} tag="th" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Field control={control} type="number" name={`brut.amount`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  type="number"
                  name={`brut.pourcentage`}
                  editable={editable}
                >
                  {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
                </Field>
              </td>
              <td>
                <Money value={getCapAmount(formValues?.brut)} />
              </td>
            </tr>
          </tbody>
        </table>

        <table id="itebTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th>Salaire annuel net (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Field control={control} type="number" name={`net.amount`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field control={control} type="number" name={`net.pourcentage`} editable={editable}>
                  {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
                </Field>
              </td>
              <td>
                <Money value={getCapAmount(formValues?.net)} />
              </td>
            </tr>
          </tbody>
        </table>
      </FadeIn>
    </form>
  )
}

export default IPEcoCapForm
