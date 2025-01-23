import { getDays, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { format, intervalToDuration, isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import menTable from '@renderer/data/data_cap_h'
import womenTable from '@renderer/data/data_cap_f'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'

export const IPMenageCapForm = ({ onSubmit, initialValues, editable = true }) => {
  const { data } = useContext(AppContext)

  const { register, handleSubmit, watch, control } = useForm({
    defaultValues: initialValues || {
      reference: 'schryvers',
      conso_amount: 32,
      perso_amount: 32
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

  const days = useMemo(() => {
    return getDays(formValues, ['conso_start', 'paiement'])
  }, [formValues])

  const getConsoAmount = useCallback(
    (values) => {
      const { conso_amount, conso_pourcentage } = values || {}
      return (
        parseInt(days || 0) *
        parseFloat(conso_amount || 0) *
        (parseFloat(conso_pourcentage || 0) / 100)
      ).toFixed(2)
    },
    [days]
  )

  const getCapAmount = useCallback(
    (values) => {
      const { paiement = '', interet = 0, perso_amount = 0, perso_pourcentage = 0 } = values
      const { years } = intervalToDuration({
        start: data?.general_info?.date_naissance,
        end: paiement
      })

      const table = data?.general_info?.sexe === 'homme' ? menTable : womenTable

      const index = constants.interet_amount?.findIndex((e) => e === parseFloat(interet || 0))

      const coefficient = table?.[years]?.[index]

      return (
        parseFloat(perso_amount) *
        (parseFloat(perso_pourcentage) / 100) *
        365 *
        parseFloat(coefficient)
      ).toFixed(2)
    },
    [data]
  )

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>Incapacités permanentes ménagères capitalisées</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Tables de référence</td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.reference_light}
                name="reference"
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
                name="interet"
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

      <h3>Période entre la consolidation et le paiement</h3>
      <table id="ippcTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Date de consolidation</th>
            <th>Date du paiement</th>
            <th>Jours</th>
            <th>Indemnité journalière (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total (€)</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Field control={control} type="date" name={`conso_start`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>

            <td style={{ width: 50 }}>{days || 0}</td>
            <td>
              <Field control={control} name={`conso_amount`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} {...props} />}
              </Field>
            </td>
            <td>
              <Field control={control} name={`conso_pourcentage`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
              </Field>
            </td>
            <td>
              <Money value={getConsoAmount(formValues)} />
            </td>
            <td className="int">
              <Interest
                amount={getConsoAmount(formValues)}
                start={getMedDate(formValues, ['conso_start', 'paiement'])}
                end={formValues?.paiement}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Incapacités personnelles permanentes</h3>
      <table id="IPCAPTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Date du paiement</th>
            <th>Indemnité journalière (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>

            <td>
              <Field control={control} name={`perso_amount`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} {...props} />}
              </Field>
            </td>
            <td>
              <Field control={control} name={`perso_pourcentage`} type="number" editable={editable}>
                {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
              </Field>
            </td>
            <td>
              <Money value={getCapAmount(formValues)} />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default IPMenageCapForm
