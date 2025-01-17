import { getDays, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { intervalToDuration, isValid } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import menTable from '@renderer/data/data_cap_h'
import womenTable from '@renderer/data/data_cap_f'
import Money from '@renderer/generic/money'

export const IPEcoCapForm = ({ onSubmit, initialValues }) => {
  const { data } = useContext(AppContext)

  const { register, handleSubmit, watch, control } = useForm({
    defaultValues: initialValues || {
      reference: 'schryvers'
    }
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
        start: formValues?.brut?.conso_start,
        end: formValues?.paiement
      }),
      net: getDays({
        start: formValues?.net?.conso_start,
        end: formValues?.paiement
      })
    }
  }, [formValues])

  const interetOptions = [0.5, 0.8, 1, 1.5, 2, 3]

  const getConsoAmount = useCallback(
    (values, name) => {
      const { conso_amount, conso_pourcentage } = values || {}
      const numDays = days[name || 'brut']

      return (
        parseInt(numDays || 0) *
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

      const index = interetOptions?.findIndex((e) => e === parseFloat(interet || 0))

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
      <h1>Incapacités permanentes économiques capitalisées</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Tables de référence</td>
            <td>
              <select {...register('reference')}>
                <option value="schryvers">Schryvers 2024 rente viagère de 1€/an mensuelle</option>
                <option value="schryvers_65">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (65 ans)
                </option>
                <option value="schryvers_66">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (66 ans)
                </option>
                <option value="schryvers_67">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (67 ans)
                </option>
                <option value="schryvers_68">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (68 ans)
                </option>
                <option value="schryvers_69">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (69 ans)
                </option>
                <option value="schryvers_70">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (70 ans)
                </option>
                <option value="schryvers_71">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (71 ans)
                </option>
                <option value="schryvers_72">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (72 ans)
                </option>
                <option value="schryvers_73">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (73 ans)
                </option>
                <option value="schryvers_74">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (74 ans)
                </option>
                <option value="schryvers_75">
                  Schryvers 2024 rente viagère de 1€/an mensuelle (75 ans)
                </option>
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
                {interetOptions?.map((it, key) => (
                  <option value={it} key={key}>
                    {it}
                  </option>
                ))}
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
            <th>Salaire annuel brut (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total brut (€)</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="date" {...register('brut.conso_start')} />
            </td>
            <td>
              <input type="date" value={formValues?.paiement} readOnly />
            </td>
            <td>{days?.brut || 0}</td>
            <td>
              <input type="number" {...register('brut.conso_amount')} />
            </td>
            <td>
              <input style={{ width: 50 }} type="number" {...register('brut.conso_pourcentage')} />
            </td>
            <td>
              <Money value={getConsoAmount(formValues?.brut, 'brut')} />
            </td>
            <td className="int">
              {formValues?.paiement && (
                <Money
                  value={
                    getDays({
                      start: getMedDate({
                        start: formValues?.brut?.conso_start,
                        end: formValues?.paiement
                      }),
                      end: formValues?.paiement
                    }) *
                    getConsoAmount(formValues?.brut, 'brut') *
                    (data?.computed_info?.rate / 365)
                  }
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <table id="ippcTable">
        <thead>
          <tr>
            <th>Date de consolidation</th>
            <th>Date du paiement</th>
            <th>Jours</th>
            <th>Salaire annuel net (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total net (€)</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="date" {...register('net.conso_start')} />
            </td>
            <td>
              <input type="date" value={formValues?.paiement} readOnly />
            </td>
            <td>{days?.net || 0}</td>
            <td>
              <input type="number" {...register('net.conso_amount')} />
            </td>
            <td>
              <input style={{ width: 50 }} type="number" {...register('net.conso_pourcentage')} />
            </td>
            <td>
              <Money value={getConsoAmount(formValues?.net, 'net')} />
            </td>
            <td className="int">
              {formValues?.paiement && (
                <Money
                  value={
                    getDays({
                      start: getMedDate({
                        start: formValues?.net?.conso_start,
                        end: formValues?.paiement
                      }),
                      end: formValues?.paiement
                    }) *
                    getConsoAmount(formValues?.net, 'net') *
                    (data?.computed_info?.rate / 365)
                  }
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Incapacités économiques permanentes</h3>
      <table id="itebTable">
        <thead>
          <tr>
            <th>Salaire annuel brut (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="number" {...register('brut.amount')} />
            </td>
            <td>
              <input
                style={{ width: 50 }}
                type="number"
                step="0.01"
                {...register('brut.pourcentage')}
              />
            </td>
            <td>
              <Money value={getCapAmount(formValues)} />
            </td>
          </tr>
        </tbody>
      </table>
      <table id="itebTable">
        <thead>
          <tr>
            <th>Salaire annuel net (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="number" {...register('net.amount')} />
            </td>
            <td>
              <input
                style={{ width: 50 }}
                type="number"
                step="0.01"
                {...register('net.pourcentage')}
              />
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

export default IPEcoCapForm
