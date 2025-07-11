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
import TextItem from '@renderer/generic/textItem'

const CapAmount = ({ values, start, end, usePersoReference = false, startIndex = 1 }) => {
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
    noGender: usePersoReference && reference?.includes('rente_certaine'),
    startIndex: startIndex
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
          <CoefficientInfo {...values?.capitalization?.info} headers={constants.interet_amount}>
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
            {it?.name} <TextItem path="tooltip.born_at" tag="span" />{' '}
            {format(it?.birthDate, 'dd/MM/yyyy')}
            <div>
              <TextItem path="tooltip.number_days_before_25" tag="span" /> {it?.days?.before25}
            </div>
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

      return {
        tooltip: (
          <div>
            <math>
              <mn>{parseInt(days || 0)}</mn>
              <mo>x</mo>
              <mn>{real_conso_amount}</mn>
              <mo>x</mo>
              <mfrac>
                <mn>{parseFloat(conso_pourcentage || 0)}</mn>
                <mn>100</mn>
              </mfrac>
              <mo>x</mo>
              <mfrac>
                <mn>{parseFloat(conso_contribution || 0)}</mn>
                <mn>100</mn>
              </mfrac>
            </math>
          </div>
        ),
        value: (
          parseInt(days || 0) *
          real_conso_amount *
          (parseFloat(conso_pourcentage || 0) / 100) *
          (parseFloat(conso_contribution || 0) / 100)
        ).toFixed(2)
      }
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
      <TextItem path="incapacite_perma.menage.title" tag="h1" />
      <TextItem path="common.variables_cap" tag="h3" />
      <table id="IPVariables">
        <tbody>
          <tr>
            <TextItem path="common.ref_table" tag="td" />
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
            <TextItem path="common.taux_interet_capitalisation" tag="td" />
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
            <TextItem path="common.date_paiement" tag="td" />
            <td>
              <Field control={control} type="date" name={`paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>
      <FadeIn show={formValues?.paiement && formValues?.reference && formValues?.interet}>
        <TextItem path="common.period_consolidation_payment" tag="h3" />
        <table id="ippcTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th style={{ width: 50 }}>%</th>
              <TextItem path="common.date_consolidation" tag="th" />
              <TextItem path="common.date_paiement" tag="th" />
              <TextItem path="common.days" tag="th" />
              <TextItem path="common.children" tag="th" />
              <TextItem path="common.indemnite_journaliere" tag="th" />
              <TextItem path="common.contribution" tag="th" />
              <TextItem path="common.total" tag="th" />
              <TextItem path="common.interest" tag="th" className="int" />
            </tr>
          </thead>
          <tbody>
            <tr>
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
                  name={`conso_contribution`}
                  type="select"
                  options={constants.contribution}
                  editable={editable}
                ></Field>
              </td>
              <td>
                <Money
                  value={getConsoAmount(formValues)?.value}
                  tooltip={getConsoAmount(formValues)?.tooltip}
                />
              </td>
              <td className="int">
                <Interest
                  amount={getConsoAmount(formValues)?.value}
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

        <TextItem path="incapacite_perma.menage.title_perma_menage" tag="h3" />
        {sortedChildren?.length > 0 ? (
          <>
            <table id="IPPCTableInfo" style={{ maxWidth: 1200 }}>
              <tbody>
                <tr>
                  <TextItem path="common.ref" tag="td" />
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
                  <TextItem path="common.indemnite_journaliere" tag="td" />
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
                  <TextItem path="common.pourcentage" tag="td" />
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
                  <TextItem path="common.contribution" tag="td" />
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
                  <TextItem path="common.period" tag="th" />
                  <TextItem path="common.indemnite_journaliere" tag="th" />
                  <th style={{ width: 50 }}>%</th>
                  <TextItem path="common.contribution" tag="th" />
                  <TextItem path="common.total" tag="th" />
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
                        <Money value={perso_amount} ignore />
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
                    <Money value={formValues?.perso_amount} ignore />
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
                      startIndex={0}
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
                <th style={{ width: 50 }}>%</th>
                <TextItem path="common.date_paiement" tag="th" />
                <TextItem path="common.indemnite_journaliere" tag="th" />
                <TextItem path="common.contribution" tag="th" />
                <TextItem path="common.total" tag="th" />
              </tr>
            </thead>
            <tbody>
              <tr>
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
                <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>
                <td>
                  <Field control={control} name={`perso_amount`} type="number" editable={editable}>
                    {(props) => <input style={{ width: 50 }} {...props} />}
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
                  <CapAmount values={formValues} startIndex={0} />
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
