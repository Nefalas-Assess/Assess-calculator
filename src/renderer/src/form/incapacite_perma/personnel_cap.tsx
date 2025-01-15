import { getDays } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { intervalToDuration, isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

export const IPPersonnelCapForm = ({ onSubmit, initialValues }) => {
  const { data } = useContext(AppContext)

  const { register, handleSubmit, watch } = useForm({
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

  const getAge = useCallback(
    (date) => {
      const { years } = intervalToDuration({
        start: data?.general_info?.date_naissance,
        end: date
      })

      return years
    },
    [data]
  )

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>Incapacités permanentes personnelles capitalisées</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Tables de référence</td>
            <td>
              <select {...register('reference')}>
                <option value="schryvers">Schryvers 2024 rente viagère de 1€/an mensuelle</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt de la capitalisation</td>
            <td>
              <select {...register('interet')}>
                <option value="" disabled>
                  Sélectionnez
                </option>
                <option>0.5</option>
                <option>0.8</option>
                <option>1</option>
                <option>1.5</option>
                <option>2</option>
                <option>3</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Date du paiement</td>
            <td>
              <input type="date" {...register('paiement')} />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Période entre la consolidation et le paiement</h3>
      <table id="ippcTable">
        <thead>
          <tr>
            <th>Date de consolidation</th>
            <th>Date du paiement</th>
            <th>Jours</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="date" {...register('conso_start')} />
            </td>
            <td>
              <input type="date" value={formValues?.paiement} readOnly />
            </td>
            <td>{days || 0}</td>
            <td>
              <input type="number" {...register('conso_amount')} />
            </td>
            <td>
              <input type="number" {...register('conso_pourcentage')} />
            </td>
            <td>{getConsoAmount(formValues)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Incapacités personnelles permanentes</h3>
      <table id="IPCAPTable">
        <thead>
          <tr>
            <th>Date du paiement</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="date" value={formValues?.paiement} readOnly />
            </td>
            <td>
              <input type="number" {...register('perso_amount')} />
            </td>
            <td>
              <input type="number" step="0.01" {...register('perso_pourcentage')} />
            </td>
            <td>{('TO DO', getAge(formValues?.paiement))}</td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default IPPersonnelCapForm
