import ActionMenuButton from '@renderer/generic/actionButton'
import Field from '@renderer/generic/field'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import { getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { format } from 'date-fns'

function calculateDays(birthDate, dates) {
  const parseDate = (date) => new Date(date)

  // Convertir les dates en objets Date
  const birth = parseDate(birthDate)
  const start = parseDate(dates?.[0])
  const end = parseDate(dates?.[1])

  // Vérification des dates
  if (start > end) {
    throw new Error('La date de début doit être avant la date de fin.')
  }

  // Calcul de la date des 25 ans
  const twentyFifthBirthday = new Date(birth.getFullYear() + 25, birth.getMonth(), birth.getDate())

  // Calcul des jours entre deux dates
  const calculateDaysBetween = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Convertir les millisecondes en jours
  }

  let before25 = 0
  let after25 = 0

  // Cas où la date de début est avant les 25 ans
  if (start <= twentyFifthBirthday) {
    // Calcul des jours avant les 25 ans
    const actualEndBefore25 = end <= twentyFifthBirthday ? end : twentyFifthBirthday
    before25 = calculateDaysBetween(start, actualEndBefore25)

    // Calcul des jours après les 25 ans
    if (end > twentyFifthBirthday) {
      after25 = calculateDaysBetween(twentyFifthBirthday, end)
    }
  } else {
    // Cas où la date de début est après les 25 ans
    after25 = calculateDaysBetween(start, end)
  }

  const total = calculateDaysBetween(start, end)

  const percentageBefore25 = total > 0 ? before25 / total : 0

  return {
    percentageBefore25,
    before25,
    after25,
    total
  }
}

const ITMenagereForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: [{ amount: 30 }]
    }
  })

  const formValues = watch()

  const previousValuesRef = useRef({})

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'periods' // Champs dynamiques pour les enfants
  })

  const periodsValues = useWatch({
    control,
    name: 'periods'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(periodsValues) !== JSON.stringify(previousValuesRef.current?.periods)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        periods: periodsValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, periodsValues, submitForm, handleSubmit])

  const getDays = useCallback((item) => {
    const { start, end } = item

    if (start && end) {
      const debutDate = new Date(start)
      const finDate = new Date(end)

      // Vérification des dates valides
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates en tenant compte de la date de début et de fin
        const timeDiff = finDate.getTime() - debutDate.getTime() // En millisecondes
        const jours = Math.max(0, timeDiff / (1000 * 3600 * 24) + 1) // Conversion en jours
        return jours
      }
    }
  }, [])

  const getTotalAmount = useCallback(
    (item, days) => {
      const { amount = 0, percentage = 0, contribution = 0 } = item

      const baseAmount = parseFloat(amount) + (data?.computed_info?.enfant_charge || 0) * 10
      return (
        (parseInt(days) || 0) *
        (parseFloat(baseAmount) || 0) *
        ((parseFloat(percentage) || 0) / 100) *
        (parseFloat(contribution || 0) / 100)
      ).toFixed(2)
    },
    [data]
  )

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.periods?.[formValues?.periods?.length - 1]?.end

      if (lastRowEnd) {
        const finDate = new Date(lastRowEnd)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
          append({ start: finDate.toISOString().split('T')[0], ...initial })
        }
      } else {
        append({ ...initial })
      }
    },
    [formValues]
  )

  const copyDate = useCallback(
    (name) => {
      const initial = get(data, name)
      let filteredData = initial.map(({ start, end }) => ({ start, end, amount: 30 }))
      const currentData = cloneDeep(formValues?.periods)
      if (formValues?.periods) {
        filteredData = currentData.concat(filteredData)
      }
      setValue('periods', filteredData)
    },
    [formValues]
  )

  const children = useMemo(() => data?.general_info?.children || [], [data])

  const getChildOnPeriod = useCallback(
    (values) => {
      const res = []
      for (let i = 0; i < children.length; i += 1) {
        const item = children[i]
        const result = calculateDays(item?.birthDate, [values?.start, values?.end])
        res.push({ days: result, ...item })
      }
      return res
    },
    [children]
  )

  const renderToolTipContent = useCallback((res) => {
    console.log(res)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {res?.map((it, key) => (
          <div key={key} style={{ padding: 10 }} className="border-item">
            {it?.name}: {format(it?.birthDate, 'dd/MM/yyyy')}
            <div>Nombres de jours entre le début et la fin: {it?.days?.total}</div>
            <div>Nombres de jours avant l'age de 25 ans: {it?.days?.before25}</div>
            <div>
              <math>
                <mfrac>
                  <mn>{it?.days?.before25}</mn>
                  <mn>{it?.days?.total}</mn>
                </mfrac>
                <mo>=</mo>
                <mn>{it?.days?.before25 / it?.days?.total}</mn>
              </math>
            </div>
          </div>
        ))}
        <div>
          <math>
            {res?.map((it, key) => (
              <React.Fragment key={key}>
                {key !== 0 && <mo>+</mo>}
                <mn>{it?.days?.percentageBefore25}</mn>
              </React.Fragment>
            ))}
            <mo>=</mo>
            <mn>
              {res?.reduce((acc, value) => {
                const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
                return acc + percentage
              }, 0)}
            </mn>
          </math>
        </div>
      </div>
    )
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Incapacités menagères temporaires</h1>
      <table id="ipTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Enfant(s)</th>
            <th>Indemnité journalière (€)</th>
            <th style={{ width: 50 }}>%</th>
            <th>Contribution (%)</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.periods[index]
            const days = getDays(values)
            const total = getTotalAmount(values, days)
            const children = getChildOnPeriod(values)
            return (
              <tr key={child.id}>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`periods.${index}.start`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    type="date"
                    name={`periods.${index}.end`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td style={{ width: 50 }}>{days}</td>
                <td style={{ width: 50 }}>
                  {children?.reduce((acc, value) => {
                    const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
                    return acc + percentage
                  }, 0)}
                  <Tooltip tooltipContent={renderToolTipContent(children)}>
                    <FaRegQuestionCircle style={{ marginLeft: 5 }} />
                  </Tooltip>
                </td>
                <td style={{ width: 200 }}>
                  <Field
                    control={control}
                    type="number"
                    name={`periods.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 50 }} {...props} />}
                  </Field>
                  ( + {(data?.computed_info?.enfant_charge || 0) * 10}€ )
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`periods.${index}.percentage`}
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 50 }} {...props} />}
                  </Field>
                </td>
                <td style={{ width: 140 }}>
                  <Field
                    control={control}
                    name={`periods.${index}.contribution`}
                    editable={editable}
                  >
                    {(props) => (
                      <select {...props}>
                        <option value="0">0</option>
                        <option value="100">100</option>
                        <option value="65">65</option>
                        <option value="50">50</option>
                        <option value="35">35</option>
                      </select>
                    )}
                  </Field>
                </td>
                <td>
                  <Money value={total} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    name={`periods.${index}.date_paiement`}
                    editable={editable}
                    type="date"
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest amount={total} start={getMedDate(values)} end={values?.date_paiement} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => remove(index)}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <div className="buttons-row">
          <button type="button" onClick={() => addNext(append, { amount: 30 })}>
            Ajouter durée
          </button>
          <ActionMenuButton
            label="Importer dates"
            actions={[
              { label: 'Personnel', action: () => copyDate('incapacite_temp_personnel.periods') },
              {
                label: 'Economique net',
                action: () => copyDate('incapacite_temp_economique.net')
              },
              {
                label: 'Economique brut',
                action: () => copyDate('incapacite_temp_economique.brut')
              }
            ]}
          />
        </div>
      )}
    </form>
  )
}

export default ITMenagereForm
