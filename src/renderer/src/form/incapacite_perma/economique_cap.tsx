import { getDays, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { format, intervalToDuration, isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import menTable from '@renderer/data/data_cap_h'
import womenTable from '@renderer/data/data_cap_f'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'

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
      <h1>Incapacités permanentes économiques capitalisées</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Table de référence</td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.reference}
                name={`reference`}
                editable={editable}
              ></Field>
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt de la capitalisation</td>
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
            <td>Date du paiement</td>
            <td>
              <Field control={control} type="date" name={`paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>
      <FadeIn show={formValues?.paiement && formValues?.reference && formValues?.interet}>
        <h3>Période entre la consolidation et le paiement</h3>
        <table id="ippcTable" style={{ width: 1000 }}>
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Salaire annuel brut (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total brut</th>
              <th className="int">Intérêts</th>
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

        <table id="ippcTable" style={{ width: 1000 }}>
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Salaire annuel net (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total net</th>
              <th className="int">Intérêts</th>
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
                  amount={getConsoAmount(formValues?.brut, 'net')}
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

        <h3>Incapacités permanentes économiques</h3>
        <table id="itebTable" style={{ width: 1000 }}>
          <thead>
            <tr>
              <th>Salaire annuel brut (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total</th>
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

        <table id="itebTable" style={{ width: 1000 }}>
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
