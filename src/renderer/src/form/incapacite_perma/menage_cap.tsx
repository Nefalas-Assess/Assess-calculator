import { calculateDaysBeforeAfter25, getDays, getMedDate } from '@renderer/helpers/general'
import { AppContext } from '@renderer/providers/AppProvider'
import { format, addDays } from 'date-fns'
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import CoefficientInfo from '@renderer/generic/coefficientInfo'
import { useCapitalization } from '@renderer/hooks/capitalization'

const CapAmount = ({ values, start, end, usePersoReference = false }) => {
  const {
    paiement = '',
    interet = 0,
    perso_amount = 0,
    perso_pourcentage = 0,
    perso_contribution = 0
  } = values

  const reference = usePersoReference ? values?.perso_reference : values?.reference

  const capitalization = useCapitalization({
    start: start,
    end: end || paiement,
    ref: reference,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(interet || 0)),
    asObject: true,
    noGender: usePersoReference && reference?.includes('rente_certaine')
  })

  const coefficient = capitalization?.value

  const renderToolTipIPTotal = useCallback((values) => {
    return (
      <div>
        <math>
          <mn>{values?.perso_amount}</mn>
          <mo>x</mo>
          <mn>{values?.perso_pourcentage / 100}</mn>
          <mo>x</mo>
          <mn>{values?.perso_contribution / 100}</mn>
          <mo>x</mo>
          <mn>365</mn>
          <mo>x</mo>
          <CoefficientInfo
            table={values?.capitalization?.table}
            index={values?.capitalization?.index}
            headers={constants.interet_amount}
          >
            <mn>{values?.capitalization?.value}</mn>
          </CoefficientInfo>
        </math>
      </div>
    )
  }, [])

  return (
    <Money
      value={(
        parseFloat(perso_amount) *
        (parseFloat(perso_pourcentage) / 100) *
        (parseFloat(perso_contribution) / 100) *
        365 *
        parseFloat(coefficient)
      ).toFixed(2)}
      tooltip={renderToolTipIPTotal({ ...values, capitalization })}
    />
  )
}

export const IPMenageCapForm = ({ onSubmit, initialValues, editable = true }) => {
  const { data } = useContext(AppContext)

  const { handleSubmit, watch, control } = useForm({
    defaultValues: initialValues || {
      conso_amount: 30,
      perso_amount: 30,
      perso_contribution: data?.general_info?.config?.default_contribution,
      conso_contribution: data?.general_info?.config?.default_contribution
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
    return getDays({
      start: data?.general_info?.date_consolidation,
      end: formValues?.paiement
    })
  }, [formValues, data])

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

  const childrenOnPeriod = useMemo(() => {
    const children = data?.general_info?.children || []
    const res = []
    for (let i = 0; i < children.length; i += 1) {
      const item = children[i]
      // Skip children without birthdate
      if (!item?.birthDate) continue
      const result = calculateDaysBeforeAfter25(item?.birthDate, [
        data?.general_info?.date_consolidation,
        formValues?.paiement
      ])

      if (result?.before25 !== 0) {
        res.push({ days: result, ...item })
      }
    }

    return res
  }, [formValues, data])

  const getConsoAmount = useCallback(
    (values) => {
      const { conso_amount, conso_pourcentage, conso_contribution } = values || {}

      const real_conso_amount =
        parseFloat(conso_amount || 0) +
        childrenOnPeriod?.reduce((acc, value) => {
          const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
          return acc + percentage
        }, 0) *
          10

      return (
        parseInt(days || 0) *
        real_conso_amount *
        (parseFloat(conso_pourcentage || 0) / 100) *
        (parseFloat(conso_contribution || 0) / 100)
      ).toFixed(2)
    },
    [days, childrenOnPeriod]
  )

  const get25thBirthday = useCallback((birthDate, addOneDay = false) => {
    // Return null if no birth date provided
    if (!birthDate) return null

    // Create date object from birth date
    const birth = new Date(birthDate)

    // Add 25 years to birth date
    const date25 = new Date(birth)
    date25.setFullYear(birth.getFullYear() + 25)

    // Add one day if requested
    if (addOneDay) {
      date25.setDate(date25.getDate() + 1)
    }

    return date25
  }, [])

  const sortedChildren = useMemo(() => {
    return childrenOnPeriod
      ?.filter((e) => {
        // Filter out children without birthdate
        if (!e?.birthDate) return false
        // Get the 25th birthday
        const date25 = get25thBirthday(e.birthDate)
        // Get consolidation date from general info
        const consolidationDate = new Date(formValues?.paiement)
        // Keep child only if their 25th birthday is after consolidation date
        return date25 > consolidationDate
      })
      ?.sort((a, b) => new Date(a?.birthDate) - new Date(b?.birthDate))
  }, [childrenOnPeriod])

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>Incapacités permanentes ménagères capitalisées</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Table de référence</td>
            <td>
              <Field
                control={control}
                type="reference"
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
      <FadeIn show={formValues?.paiement && formValues?.reference && formValues?.interet}>
        <h3>Période entre la consolidation et le paiement</h3>
        <table id="ippcTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Enfants</th>
              <th>Indemnité journalière (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Contribution (%)</th>
              <th>Total (€)</th>
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

              <td style={{ width: 50 }}>{days || 0}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {childrenOnPeriod
                    ?.reduce((acc, value) => {
                      const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
                      return acc + percentage
                    }, 0)
                    ?.toFixed(2)}
                  <Tooltip tooltipContent={renderToolTipChildren(childrenOnPeriod)}>
                    <FaRegQuestionCircle style={{ marginLeft: 5 }} />
                  </Tooltip>
                </div>
              </td>
              <td>
                <Field control={control} name={`conso_amount`} type="number" editable={editable}>
                  {(props) => <input style={{ width: 50 }} {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`conso_pourcentage`}
                  type="number"
                  editable={editable}
                >
                  {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`conso_contribution`}
                  type="select"
                  options={constants.contribution}
                  editable={editable}
                ></Field>
              </td>
              <td>
                <Money value={getConsoAmount(formValues)} />
              </td>
              <td className="int">
                <Interest
                  amount={getConsoAmount(formValues)}
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

        <h3>Incapacités permanentes ménagères</h3>
        {childrenOnPeriod?.length > 0 ? (
          <>
            <table id="IPPCTableInfo" style={{ maxWidth: 600 }}>
              <tbody>
                <tr>
                  <td>Reférence</td>
                  <td>
                    <Field
                      control={control}
                      type="reference"
                      options={constants.reference_menage_children}
                      name="perso_reference"
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
                <tr>
                  <td>Indemnité journalière (€)</td>
                  <td>
                    <Field
                      control={control}
                      name={`perso_amount`}
                      type="number"
                      editable={editable}
                    >
                      {(props) => <input style={{ width: 50 }} {...props} />}
                    </Field>
                  </td>
                </tr>
                <tr>
                  <td>Pourcentage (%) </td>
                  <td>
                    <Field
                      control={control}
                      name={`perso_pourcentage`}
                      type="number"
                      editable={editable}
                    >
                      {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
                    </Field>
                  </td>
                </tr>
                <tr>
                  <td>Contribution (%)</td>
                  <td>
                    <Field
                      control={control}
                      name={`perso_contribution`}
                      type="select"
                      options={constants.contribution}
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
              </tbody>
            </table>
            <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Indemnité journalière (€)</th>
                  <th style={{ width: 50 }}>%</th>
                  <th>Contribution (%)</th>
                  <th>Total (€)</th>
                </tr>
              </thead>
              <tbody>
                {sortedChildren?.map((item, key) => {
                  const start =
                    key === 0
                      ? addDays(formValues?.paiement || new Date(), 1)
                      : get25thBirthday(sortedChildren[key - 1]?.birthDate, true)

                  const end = get25thBirthday(item?.birthDate)
                  const perso_amount =
                    parseFloat(formValues?.perso_amount || 0) + 10 * (sortedChildren?.length - key)
                  return (
                    <tr key={key}>
                      <td>
                        {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                      </td>
                      <td>
                        <Money value={perso_amount} />
                      </td>
                      <td>{formValues?.perso_pourcentage} %</td>
                      <td>{formValues?.perso_contribution} %</td>
                      <td>
                        <CapAmount
                          values={{ ...formValues, perso_amount: perso_amount }}
                          start={start}
                          end={end}
                          usePersoReference={true}
                        />
                      </td>
                    </tr>
                  )
                })}
                <tr>
                  <td>
                    {format(
                      get25thBirthday(sortedChildren[sortedChildren?.length - 1]?.birthDate, true),
                      'dd/MM/yyyy'
                    )}
                  </td>
                  <td>
                    <Money value={formValues?.perso_amount} />
                  </td>
                  <td>{formValues?.perso_pourcentage} %</td>
                  <td>{formValues?.perso_contribution} %</td>
                  <td>
                    <CapAmount
                      values={formValues}
                      end={get25thBirthday(
                        sortedChildren[sortedChildren?.length - 1]?.birthDate,
                        true
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <th>Date du paiement</th>
                <th>Indemnité journalière (€)</th>
                <th style={{ width: 50 }}>%</th>
                <th>Contribution (%)</th>
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
                  <Field
                    control={control}
                    name={`perso_pourcentage`}
                    type="number"
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 50 }} step="0.01" {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    name={`perso_contribution`}
                    type="select"
                    options={constants.contribution}
                    editable={editable}
                  ></Field>
                </td>
                <td>
                  <CapAmount values={formValues} />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </FadeIn>
    </form>
  )
}

export default IPMenageCapForm
