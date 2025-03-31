import ActionMenuButton from '@renderer/generic/actionButton'
import Field from '@renderer/generic/field'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'
import { calculateDaysBeforeAfter25, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { format } from 'date-fns'
import constants from '@renderer/constants'

const ITMenagereForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
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
    (item, days, child) => {
      const { amount = 0, percentage = 0, contribution = 0 } = item
      const childAmount = child?.reduce((acc, value) => {
        const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
        return acc + percentage
      }, 0)

      const baseAmount = parseFloat(amount) + childAmount * 10
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
        // Skip children without birthdate
        if (!item?.birthDate) continue
        const result = calculateDaysBeforeAfter25(item?.birthDate, [values?.start, values?.end])
        res.push({ days: result, ...item })
      }
      return res
    },
    [children]
  )

  const renderToolTipChildren = useCallback((res) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {res?.map((it, key) => (
          <div key={key} style={{ padding: 10 }} className="border-item">
            {it?.name} né le {format(it?.birthDate, 'dd/MM/yyyy')}
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

  const renderTooltipTotal = useCallback((item, days, child) => {
    const { amount = 0, percentage = 0, contribution = 0 } = item
    const childAmount = child?.reduce((acc, value) => {
      const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
      return acc + percentage
    }, 0)

    const baseAmount = parseFloat(amount) + childAmount * 10

    const resultat =
      (parseInt(days) || 0) *
      (parseFloat(baseAmount) || 0) *
      ((parseFloat(percentage) || 0) / 100) *
      (parseFloat(contribution || 0) / 100)

    return (
      <div>
        <div>
          <math>
            <mstyle style={{ marginRight: 5 }}>
              <mo>(</mo>
              <mi>A</mi>
              <mo>)</mo>
            </mstyle>
            <mn>{amount}</mn>
            <mo>x</mo>
            <mn>{childAmount}</mn>
            <mo>x</mo>
            <mn>10</mn>
            <mo>=</mo>
            <mn>{baseAmount}</mn>
          </math>
        </div>
        <math>
          <mn>{days}</mn>
          <mo>x</mo>
          <mi>A</mi>
          <mo>x</mo>
          <mfrac>
            <mn>{percentage}</mn>
            <mn>100</mn>
          </mfrac>
          <mo>x</mo>
          <mfrac>
            <mn>{contribution}</mn>
            <mn>100</mn>
          </mfrac>
          <mo>=</mo>
          <mn>{resultat}</mn>
        </math>
      </div>
    )
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Incapacités temporaires menagères</h1>
      <table id="ipTable" style={{ maxWidth: 1200 }}>
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
            const children = getChildOnPeriod(values)
            const total = getTotalAmount(values, days, children)
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {children
                      ?.reduce((acc, value) => {
                        const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
                        return acc + percentage
                      }, 0)
                      ?.toFixed(2)}
                    <Tooltip tooltipContent={renderToolTipChildren(children)}>
                      <FaRegQuestionCircle style={{ marginLeft: 5 }} />
                    </Tooltip>
                  </div>
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
                  ( +
                  {(
                    children?.reduce((acc, value) => {
                      const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
                      return acc + percentage
                    }, 0) * 10
                  )?.toFixed(2)}
                  € )
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
                    type="select"
                    options={constants.contribution}
                    editable={editable}
                  ></Field>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Money value={total} />
                    <Tooltip tooltipContent={renderTooltipTotal(values, days, children)}>
                      <FaRegQuestionCircle style={{ marginLeft: 5 }} />
                    </Tooltip>
                  </div>
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
          <button
            type="button"
            onClick={() =>
              addNext(append, {
                amount: 30,
                contribution: data?.general_info?.config?.default_contribution
              })
            }
          >
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
