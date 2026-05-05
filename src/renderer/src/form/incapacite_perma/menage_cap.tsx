import {
  calculateDaysBeforeAfter25,
  getDays,
  getMedDate,
  getTheoreticalLeaveHomeDate
} from '@renderer/helpers/general'
import { format, addDays } from 'date-fns'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

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
  const generalInfo = useGeneralInfo()

  const indicativeAmount = getIndicativeAmount(generalInfo?.config?.incapacite_menagere, 30)
  const indicativePersonChargeAmount = getIndicativeAmount(generalInfo?.config?.person_charge, 10)

  const defaultContribution = generalInfo?.config?.default_contribution

  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      conso_amount: indicativeAmount,
      perso_amount: indicativeAmount,
      perso_contribution: defaultContribution,
      conso_contribution: defaultContribution,
      paiement: generalInfo?.config?.date_paiement,
      student_home_amount:
        initialValues?.student_home_amount ?? initialValues?.perso_amount ?? indicativeAmount,
      student_home_contribution:
        initialValues?.student_home_contribution ??
        initialValues?.perso_contribution ??
        defaultContribution,
      student_after_home_amount:
        initialValues?.student_after_home_amount ?? initialValues?.perso_amount ?? indicativeAmount,
      student_after_home_contribution: initialValues?.student_after_home_contribution ?? 100,
      ...initialValues
    }
  })

  const formValues = useWatch({ control })

  const submitForm = (values) => {
    onSubmit(values)
  }

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const days = useMemo(() => {
    return getDays({
      start: generalInfo?.date_consolidation,
      end: formValues?.paiement
    })
  }, [formValues, generalInfo])

  const renderToolTipChildren = useCallback((res) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {res?.map(
          (it, key) =>
            it?.birthDate && (
              <div key={key} style={{ padding: 10 }} className="border-item">
                {it?.name} <TextItem path="tooltip.born_at" tag="span" />{' '}
                {format(it?.birthDate, 'dd/MM/yyyy')}
                <div>
                  <TextItem path="tooltip.number_days_before_25" tag="span" />:{' '}
                  <b>{it?.days?.before25}</b>
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
            )
        )}
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
    const children = generalInfo?.children || []
    const res = []
    for (let i = 0; i < children.length; i += 1) {
      const item = children[i]
      // Skip children without birthdate
      if (!item?.birthDate) {
        res.push({ days: { percentageBefore25: 1 } })
      } else {
        const result = calculateDaysBeforeAfter25(
          item?.birthDate,
          [generalInfo?.date_consolidation, formValues?.paiement],
          item?.leaveHomeAge
        )

        if (result?.before25 !== 0) {
          res.push({ days: result, ...item })
        }
      }
    }

    return res
  }, [formValues, generalInfo])

  const getConsoAmount = useCallback(
    (values) => {
      const { conso_amount, conso_contribution } = values || {}

      const conso_pourcentage = generalInfo?.ip?.menagere?.interet

      const real_conso_amount =
        parseFloat(conso_amount || 0) +
        childrenOnPeriod?.reduce((acc, value) => {
          const percentage = parseFloat(value?.days?.percentageBefore25 || 0)
          return acc + percentage
        }, 0) *
          indicativePersonChargeAmount

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
    [days, childrenOnPeriod, generalInfo, indicativePersonChargeAmount]
  )

  const getBirthdayAtAge = useCallback((birthDate, age, addOneDay = false) => {
    if (!birthDate || age === undefined || age === null || age === '') return null

    const numericAge = Number.parseInt(age, 10)
    if (!Number.isFinite(numericAge)) return null

    const birth = new Date(birthDate)
    const targetDate = new Date(birth)
    targetDate.setFullYear(birth.getFullYear() + numericAge)

    if (addOneDay) {
      targetDate.setDate(targetDate.getDate() + 1)
    }

    return targetDate
  }, [])

  const sortedChildren = useMemo(() => {
    return childrenOnPeriod
      ?.filter((e) => {
        if (!e?.birthDate) return false
        const leaveHomeDate = getTheoreticalLeaveHomeDate(e?.birthDate, e?.leaveHomeAge)
        if (!leaveHomeDate) return false
        const consolidationDate = new Date(formValues?.paiement)
        return leaveHomeDate > consolidationDate
      })
      ?.sort((a, b) => {
        const firstDate = getTheoreticalLeaveHomeDate(a?.birthDate, a?.leaveHomeAge)
        const secondDate = getTheoreticalLeaveHomeDate(b?.birthDate, b?.leaveHomeAge)
        return firstDate?.getTime() - secondDate?.getTime()
      })
  }, [childrenOnPeriod, formValues?.paiement])

  const unsortedChildren = useMemo(() => {
    return childrenOnPeriod?.filter((e) => !e?.birthDate || e?.leaveHomeAge === 'never')
  }, [childrenOnPeriod])

  useEffect(() => {
    const baseContribution = formValues?.perso_contribution ?? defaultContribution

    if (
      sortedChildren?.length === 0 &&
      unsortedChildren?.length > 0 &&
      (formValues?.perso_amount === undefined ||
        formValues?.perso_amount === '' ||
        parseFloat(formValues?.perso_amount || 0) === indicativeAmount)
    ) {
      setValue(
        'perso_amount',
        indicativeAmount + indicativePersonChargeAmount * unsortedChildren.length
      )
    }

    sortedChildren?.forEach((_, key) => {
      const amountField = `perso_child_amount_${key}`
      const contributionField = `perso_child_contribution_${key}`

      if (formValues?.[amountField] === undefined || formValues?.[amountField] === '') {
        const defaultAmount =
          parseFloat(formValues?.perso_amount || 0) +
          indicativePersonChargeAmount * unsortedChildren?.length +
          indicativePersonChargeAmount * (sortedChildren.length - key)

        setValue(amountField, defaultAmount)
      }

      if (formValues?.[contributionField] === undefined || formValues?.[contributionField] === '') {
        setValue(contributionField, baseContribution)
      }
    })

    if (
      formValues?.perso_child_amount_final === undefined ||
      formValues?.perso_child_amount_final === ''
    ) {
      const finalAmount =
        parseFloat(formValues?.perso_amount || 0) +
        indicativePersonChargeAmount * unsortedChildren?.length

      setValue('perso_child_amount_final', finalAmount)
    }

    if (
      formValues?.perso_child_contribution_final === undefined ||
      formValues?.perso_child_contribution_final === ''
    ) {
      setValue('perso_child_contribution_final', baseContribution)
    }
  }, [
    sortedChildren,
    unsortedChildren,
    formValues,
    defaultContribution,
    indicativeAmount,
    indicativePersonChargeAmount,
    setValue
  ])

  const studentSplitEnd = useMemo(() => {
    if (generalInfo?.profession !== 'étudiant') return null
    if (!generalInfo?.student?.lives_with_parents) return null
    if (!formValues?.paiement) return null

    const targetDate = getBirthdayAtAge(
      generalInfo?.date_naissance,
      generalInfo?.student?.leave_home_age || 25
    )

    if (!targetDate) return null

    const paiementDate = new Date(formValues.paiement)
    return targetDate > paiementDate ? targetDate : null
  }, [
    formValues?.paiement,
    generalInfo?.profession,
    generalInfo?.student?.lives_with_parents,
    generalInfo?.student?.leave_home_age,
    generalInfo?.date_naissance,
    getBirthdayAtAge
  ])

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextItem path="incapacite_perma.menage.title" tag="h1" />
      <TextItem path="common.variables_cap" tag="h3" />
      <table id="IPVariables">
        <tbody>
          <tr>
            <TextItem path="common.ref_table" tag="td" className="table-ref-standard" />
            <td className="table-ref-standard">
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
              <td>{generalInfo?.ip?.menagere?.interet}</td>
              <td>
                {generalInfo?.date_consolidation &&
                  format(generalInfo?.date_consolidation, 'dd/MM/yyyy')}
              </td>
              <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>

              <td style={{ width: 50 }}>{days || 0}</td>
              <td>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
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
                    start: generalInfo?.date_consolidation,
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
                  <TextItem
                    path="common.ref_table_children"
                    tag="td"
                    className="table-ref-children"
                  />
                  <td className="table-ref-children">
                    <Field
                      control={control}
                      type="reference"
                      options={constants.reference_menage_children}
                      name="perso_reference"
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
              </tbody>
            </table>
            <FadeIn show={formValues?.perso_reference}>
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
                        : getTheoreticalLeaveHomeDate(
                            sortedChildren[key - 1]?.birthDate,
                            sortedChildren[key - 1]?.leaveHomeAge,
                            true
                          )

                    const end = getTheoreticalLeaveHomeDate(item?.birthDate, item?.leaveHomeAge)
                    const amountField = `perso_child_amount_${key}`
                    const contributionField = `perso_child_contribution_${key}`
                    return (
                      <tr key={key}>
                        <td>
                          {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                        </td>
                        <td>
                          <Field
                            control={control}
                            name={amountField}
                            type="number"
                            editable={editable}
                          >
                            {(props) => <input style={{ width: 80 }} {...props} />}
                          </Field>
                        </td>
                        <td>{generalInfo?.ip?.menagere?.interet} %</td>
                        <td>
                          <Field
                            control={control}
                            name={contributionField}
                            type="select"
                            options={constants.contribution}
                            editable={editable}
                          ></Field>
                        </td>
                        <td className="table-ref-children-amount">
                          <CapAmount
                            values={{
                              ...formValues,
                              perso_amount: formValues?.[amountField],
                              perso_contribution: formValues?.[contributionField],
                              perso_pourcentage: generalInfo?.ip?.menagere?.interet
                            }}
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
                        getTheoreticalLeaveHomeDate(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
                          sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                          true
                        ),
                        'dd/MM/yyyy'
                      )}
                    </td>
                    <td>
                      <Field
                        control={control}
                        name="perso_child_amount_final"
                        type="number"
                        editable={editable}
                      >
                        {(props) => <input style={{ width: 80 }} {...props} />}
                      </Field>
                    </td>
                    <td style={{ textWrap: 'nowrap' }}> {generalInfo?.ip?.menagere?.interet} %</td>
                    <td>
                      <Field
                        control={control}
                        name="perso_child_contribution_final"
                        type="select"
                        options={constants.contribution}
                        editable={editable}
                      ></Field>
                    </td>
                    <td className="table-ref-standard-amount">
                      <CapAmount
                        values={{
                          ...formValues,
                          perso_amount: formValues?.perso_child_amount_final,
                          perso_contribution: formValues?.perso_child_contribution_final,
                          perso_pourcentage: generalInfo?.ip?.menagere?.interet
                        }}
                        end={getTheoreticalLeaveHomeDate(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
                          sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                          true
                        )}
                        startIndex={0}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </>
        ) : studentSplitEnd ? (
          <>
            <table id="IPPCTableInfo" style={{ maxWidth: 1200 }}>
              <tbody>
                <tr>
                  <TextItem
                    path="common.ref_table_children"
                    tag="td"
                    className="table-ref-children"
                  />
                  <td className="table-ref-children">
                    <Field
                      control={control}
                      type="reference"
                      options={constants.reference_menage_children}
                      name="perso_reference"
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
              </tbody>
            </table>
            <FadeIn show={formValues?.perso_reference}>
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
                  <tr>
                    <td>
                      {format(addDays(formValues?.paiement || new Date(), 1), 'dd/MM/yyyy')} -{' '}
                      {format(studentSplitEnd, 'dd/MM/yyyy')}
                    </td>
                    <td>
                      <Field
                        control={control}
                        name="student_home_amount"
                        type="number"
                        editable={editable}
                      >
                        {(props) => <input style={{ width: 80 }} {...props} />}
                      </Field>
                    </td>
                    <td>{generalInfo?.ip?.menagere?.interet} %</td>
                    <td>
                      <Field
                        control={control}
                        name="student_home_contribution"
                        type="select"
                        options={constants.contribution}
                        editable={editable}
                      ></Field>
                    </td>
                    <td className="table-ref-children-amount">
                      <CapAmount
                        values={{
                          ...formValues,
                          perso_amount: formValues?.student_home_amount,
                          perso_contribution: formValues?.student_home_contribution,
                          perso_pourcentage: generalInfo?.ip?.menagere?.interet
                        }}
                        start={addDays(formValues?.paiement || new Date(), 1)}
                        end={studentSplitEnd}
                        usePersoReference={true}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>{format(addDays(studentSplitEnd, 1), 'dd/MM/yyyy')}</td>
                    <td>
                      <Field
                        control={control}
                        name="student_after_home_amount"
                        type="number"
                        editable={editable}
                      >
                        {(props) => <input style={{ width: 80 }} {...props} />}
                      </Field>
                    </td>
                    <td style={{ textWrap: 'nowrap' }}> {generalInfo?.ip?.menagere?.interet} %</td>
                    <td>
                      <Field
                        control={control}
                        name="student_after_home_contribution"
                        type="select"
                        options={constants.contribution}
                        editable={editable}
                      ></Field>
                    </td>
                    <td className="table-ref-standard-amount">
                      <CapAmount
                        values={{
                          ...formValues,
                          perso_amount: formValues?.student_after_home_amount,
                          perso_contribution: formValues?.student_after_home_contribution,
                          perso_pourcentage: generalInfo?.ip?.menagere?.interet
                        }}
                        end={addDays(studentSplitEnd, 1)}
                        startIndex={0}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </FadeIn>
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
                <td>{generalInfo?.ip?.menagere?.interet}</td>
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
                <td className="table-ref-standard-amount">
                  <CapAmount
                    values={{
                      ...formValues,
                      perso_pourcentage: generalInfo?.ip?.menagere?.interet
                    }}
                    startIndex={0}
                  />
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
