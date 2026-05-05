import { useCallback, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'
import TotalBox from '@renderer/generic/totalBox'
import CoefficientInfo from '@renderer/generic/coefficientInfo'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import { calculateDaysBeforeAfter25, getTheoreticalLeaveHomeDate } from '@renderer/helpers/general'
import { addDays, format } from 'date-fns'
import Interest from '@renderer/generic/interet'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

const getSafeMembersAmount = (value) => {
  const parsed = Number.parseInt(`${value ?? ''}`, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const TotalRevenueAmount = ({
  values,
  data,
  start,
  end,
  reference,
  membersAmount,
  interest,
  noGender = false,
  startIndex = 0
}) => {
  const capitalization = useCapitalization({
    start: start,
    end: end || data?.date_death,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.interet)),
    ref: reference || values?.reference,
    asObject: true,
    noGender,
    startIndex
  })

  const getTotalRevenueAmount = useCallback(() => {
    const revenue = parseFloat(values?.revenue_total || 0)
    const effectiveMembersAmount = parseInt(`${membersAmount ?? values?.members_amount ?? 0}`, 10)
    const personnel = revenue / (effectiveMembersAmount + 1)

    const variables = {
      revenue,
      personnel,
      coef: capitalization?.value,
      membersAmount: effectiveMembersAmount
    }

    const totalAmount =
      ((parseFloat(values?.revenue_defunt) || 0) - variables.personnel) * variables.coef

    return {
      value: totalAmount,
      tooltip: (
        <>
          <div>
            <math>
              <mrow>
                <mstyle style={{ marginRight: 5 }}>
                  <mo>(</mo>
                  <mi>R</mi>
                  <mo>)</mo>
                </mstyle>
                <mn>{variables?.revenue}</mn>
              </mrow>
            </math>
          </div>
          <div>
            <math>
              <mrow>
                <mstyle style={{ marginRight: 5 }}>
                  <mo>(</mo>
                  <mi>P</mi>
                  <mo>)</mo>
                </mstyle>
                <mfrac>
                  <mrow>
                    <mi>Revenue</mi>
                  </mrow>
                  <mrow>
                    <mo>(</mo>
                    <mn>{variables?.membersAmount}</mn>
                    <mo>+</mo>
                    <mn>1</mn>
                    <mo>)</mo>
                  </mrow>
                </mfrac>
                <mo>=</mo>
                <mn>{variables?.personnel}</mn>
              </mrow>
            </math>
          </div>
          <div>
            <math>
              <mo>(</mo>
              <mn>{values?.revenue_defunt}</mn>
              <mo>-</mo>
              <mn>{variables?.personnel}</mn>
              <mo>)</mo>
              <mo>x</mo>
              <CoefficientInfo {...capitalization?.info} headers={constants.interet_amount}>
                <mn>{variables?.coef}</mn>
              </CoefficientInfo>
              <mo>=</mo>
              <mn>{totalAmount}</mn>
            </math>
          </div>
        </>
      )
    }
  }, [capitalization, membersAmount, values])

  if (!data?.date_naissance) {
    return <TextItem path="errorsdn.missing_date_naissance" />
  }

  if (interest) {
    return (
      <Interest
        amount={getTotalRevenueAmount()?.value}
        start={interest?.start}
        end={interest?.end}
      />
    )
  }

  return <Money {...getTotalRevenueAmount()} />
}

const TotalMenageAmount = ({ values, data, start, end, reference, interest }) => {
  const {
    menage_interet = 0,
    menage_amount = 0,
    menage_pourcentage = 100,
    menage_contribution = 0
  } = values

  // Vérification des dates

  const startDate = start || (data?.date_naissance ? new Date(data.date_naissance) : null)

  const endDate = end || (data?.date_death ? new Date(data.date_death) : null)

  const coef = useCapitalization({
    end: endDate,
    start: startDate,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(menage_interet)) || 0,
    ref: reference ?? values?.menage_reference_final,
    asObject: true,
    noGender: !!reference,
    startIndex: reference ? 1 : 0
  })

  const getTotalMenageAmount = useCallback(() => {
    // Calcul du montant total avec useMemo
    const totalAmount = (
      parseFloat(menage_amount) *
      (parseFloat(menage_pourcentage) / 100) *
      (parseFloat(menage_contribution) / 100) *
      365 *
      parseFloat(coef?.value)
    ).toFixed(2)

    return {
      value: totalAmount,
      tooltip: (
        <div>
          <math>
            <mn>{menage_amount}</mn>
            <mo>x</mo>
            <mo>(</mo>
            <mfrac>
              <mn>{menage_contribution}</mn>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
            <mo>x</mo>
            <mn>1</mn>
            <mo>x</mo>
            <mn>365</mn>
            <mo>x</mo>
            <CoefficientInfo headers={constants.interet_amount} {...coef?.info}>
              <mn>{coef?.value}</mn>
            </CoefficientInfo>
            <mo>=</mo>
            <mn>{totalAmount}</mn>
          </math>
        </div>
      )
    }
  }, [coef, menage_amount, menage_contribution, menage_pourcentage])

  if (interest) {
    return (
      <Interest
        amount={getTotalMenageAmount()?.value}
        start={interest?.start}
        end={interest?.end}
      />
    )
  } else {
    return <Money {...getTotalMenageAmount()} />
  }
}

const PrejudiceProcheForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const indicativeAmount = getIndicativeAmount(generalInfo?.config?.incapacite_menagere, 30)
  const indicativePersonChargeAmount = getIndicativeAmount(generalInfo?.config?.person_charge, 10)

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: initialValues || {
      menage_contribution: generalInfo?.config?.default_contribution,
      menage_amount: indicativeAmount,
      members: generalInfo?.children?.map((it) => ({
        name: it?.name,
        link: 'parent/enfant',
        date_paiement: generalInfo?.config?.date_paiement
      }))
    }
  })

  const formValues = useWatch({ control })
  const membersValues = useWatch({
    control,
    name: 'members'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

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
          [generalInfo?.date_death, formValues?.paiement],
          item?.leaveHomeAge
        )

        if (result?.before25 !== 0) {
          res.push({ days: result, ...item })
        }
      }
    }

    return res
  }, [formValues, generalInfo])

  const sortedChildren = useMemo(() => {
    return childrenOnPeriod
      ?.filter((e) => {
        if (!e?.birthDate) return false
        const leaveHomeDate = getTheoreticalLeaveHomeDate(e?.birthDate, e?.leaveHomeAge)
        if (!leaveHomeDate) return false
        const deathDate = new Date(generalInfo?.date_death)
        return leaveHomeDate > deathDate
      })
      ?.sort((a, b) => {
        const firstDate = getTheoreticalLeaveHomeDate(a?.birthDate, a?.leaveHomeAge)
        const secondDate = getTheoreticalLeaveHomeDate(b?.birthDate, b?.leaveHomeAge)
        return firstDate?.getTime() - secondDate?.getTime()
      })
  }, [childrenOnPeriod, generalInfo])

  // Children without birthdate
  const unsortedChildren = useMemo(() => {
    return childrenOnPeriod?.filter((e) => !e?.birthDate || e?.leaveHomeAge === 'never')
  }, [childrenOnPeriod])

  const studentSplitEnd = useMemo(() => {
    if (
      generalInfo?.profession !== 'étudiant' ||
      !generalInfo?.student?.lives_with_parents ||
      !generalInfo?.date_naissance ||
      !generalInfo?.date_death
    ) {
      return null
    }

    const targetDate = getTheoreticalLeaveHomeDate(
      generalInfo?.date_naissance,
      generalInfo?.student?.leave_home_age
    )

    if (!targetDate) return null

    const deathDate = new Date(generalInfo?.date_death)
    return targetDate > deathDate ? targetDate : null
  }, [
    generalInfo?.profession,
    generalInfo?.student?.lives_with_parents,
    generalInfo?.student?.leave_home_age,
    generalInfo?.date_naissance,
    generalInfo?.date_death
  ])

  const membersAmount = useMemo(
    () => getSafeMembersAmount(formValues?.members_amount),
    [formValues?.members_amount]
  )
  const hasSplitMenage = sortedChildren?.length > 0 || !!studentSplitEnd

  useEffect(() => {
    if (
      sortedChildren?.length === 0 &&
      unsortedChildren?.length > 0 &&
      (formValues?.menage_amount === undefined ||
        formValues?.menage_amount === '' ||
        parseFloat(formValues?.menage_amount || 0) === indicativeAmount)
    ) {
      setValue(
        'menage_amount',
        indicativeAmount + indicativePersonChargeAmount * unsortedChildren.length
      )
    }

    const hasRevenueReference = studentSplitEnd
      ? formValues?.revenue_reference_children
      : sortedChildren?.length > 0
        ? formValues?.reference && formValues?.revenue_reference_children
        : formValues?.reference

    if (
      hasRevenueReference &&
      formValues?.interet &&
      !formValues?.revenue_date_paiement &&
      generalInfo?.config?.date_paiement
    ) {
      setValue('revenue_date_paiement', generalInfo?.config?.date_paiement)
      sortedChildren?.forEach((child, key) => {
        setValue(`revenue_date_paiement_${key}`, generalInfo?.config?.date_paiement)
      })
    }

    if (
      formValues?.menage_reference_final &&
      formValues?.menage_interet &&
      !formValues?.menage_date_paiement &&
      generalInfo?.config?.date_paiement
    ) {
      setValue('menage_date_paiement', generalInfo?.config?.date_paiement)
      sortedChildren?.forEach((child, key) => {
        setValue(`menage_date_paiement_${key}`, generalInfo?.config?.date_paiement)
      })
    }
  }, [
    formValues,
    generalInfo?.config?.date_paiement,
    indicativeAmount,
    indicativePersonChargeAmount,
    setValue,
    sortedChildren,
    studentSplitEnd,
    unsortedChildren
  ])

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const columns = [
    { header: 'deces.prejudice_proche.name_membre', key: 'name', type: 'text' },
    {
      header: 'deces.prejudice_proche.lien_parente',
      key: 'link',
      type: 'select',
      options: constants.family_link
    },
    { header: 'common.indemnite', key: 'amount', type: 'number' },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: generalInfo?.date_death }
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="nav.deces.prejudice_proche"
        subtitle="deces.prejudice_proche.subtitle"
        columns={columns}
        control={control}
        name="members"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
        addRowDefaults={{
          date_paiement: generalInfo?.config?.date_paiement
        }}
      />

      <h3>
        <TextItem path="deces.prejudice_proche.variables_calcul" tag="span" />{' '}
        <TextItem path="deces.prejudice_proche.perte_contribution_menage" tag="span" />
      </h3>
      <table id="IPVariables">
        <tbody>
          {!studentSplitEnd && (
            <tr>
              <TextItem path={'common.ref_table'} tag="td" className="table-ref-standard" />
              <td className="table-ref-standard">
                <Field
                  control={control}
                  type="reference"
                  options={constants.reference_light}
                  name="menage_reference_final"
                  editable={editable}
                ></Field>
              </td>
            </tr>
          )}
          {hasSplitMenage && (
            <tr>
              <TextItem
                path={'common.ref_table_children'}
                tag="td"
                className="table-ref-children"
              />
              <td className="table-ref-children">
                <Field
                  control={control}
                  type="reference"
                  options={constants.reference_menage_children}
                  name="menage_reference_period"
                  editable={editable}
                ></Field>
              </td>
            </tr>
          )}
          <tr>
            <TextItem path="common.taux_interet" tag="td" />
            <td>
              <Field
                control={control}
                type="select"
                options={constants.interet_amount}
                name="menage_interet"
                editable={editable}
              ></Field>
            </td>
          </tr>
        </tbody>
      </table>

      <FadeIn
        show={
          (formValues?.menage_reference_final || formValues?.menage_reference_period) &&
          formValues?.menage_interet
        }
      >
        <TextItem path="deces.prejudice_proche.perte_contribution_menage" tag="h3" />
        {sortedChildren?.length > 0 ? (
          <>
            <table id="IPPCTableInfo" style={{ maxWidth: 1200 }}>
              <tbody>
                <tr>
                  <TextItem path="common.indemnite_journaliere" tag="td" />
                  <td>
                    <Field
                      control={control}
                      name={`menage_amount`}
                      type="number"
                      editable={editable}
                    >
                      {(props) => <input style={{ width: 50 }} {...props} />}
                    </Field>
                  </td>
                </tr>
                <tr>
                  <TextItem path="common.contribution" tag="td" />
                  <td>
                    <Field
                      control={control}
                      name={`menage_contribution`}
                      type="select"
                      options={constants.contribution}
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
              </tbody>
            </table>
            <FadeIn
              show={formValues?.menage_reference_period || formValues?.menage_reference_final}
            >
              <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
                <thead>
                  <tr>
                    <TextItem path="common.period" tag="th" />
                    <TextItem path="common.indemnite_journaliere" tag="th" />
                    <th style={{ width: 50 }}>%</th>
                    <TextItem path="common.contribution" tag="th" />
                    <TextItem path="common.total" tag="th" />
                    <TextItem path="common.date_paiement" tag="th" className="int" />
                    <TextItem path="common.interest" tag="th" className="int" />
                  </tr>
                </thead>
                <tbody>
                  {sortedChildren?.map((item, key) => {
                    const start =
                      key === 0
                        ? addDays(generalInfo?.date_death, 1)
                        : getTheoreticalLeaveHomeDate(
                            sortedChildren[key - 1]?.birthDate,
                            sortedChildren[key - 1]?.leaveHomeAge,
                            true
                          )

                    const end = getTheoreticalLeaveHomeDate(item?.birthDate, item?.leaveHomeAge)

                    const menage_amount =
                      parseFloat(formValues?.menage_amount || 0) +
                      indicativePersonChargeAmount * unsortedChildren?.length +
                      indicativePersonChargeAmount * (sortedChildren?.length - key)

                    return (
                      <tr key={key}>
                        <td>
                          {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                        </td>
                        <td>
                          <Money value={menage_amount} ignore />
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>100 %</td>
                        <td>{formValues?.menage_contribution} %</td>
                        <td className="table-ref-children-amount">
                          <TotalMenageAmount
                            values={{
                              ...formValues,
                              menage_amount: menage_amount
                            }}
                            data={generalInfo}
                            start={start}
                            end={end}
                            reference={formValues?.menage_reference_period}
                          />
                        </td>
                        <td className="int">
                          <Field
                            control={control}
                            type="date"
                            name={`menage_date_paiement_${key}`}
                            editable={editable}
                          >
                            {(props) => <input {...props} />}
                          </Field>
                        </td>
                        <td className="int">
                          <TotalMenageAmount
                            values={{
                              ...formValues,
                              menage_amount: menage_amount
                            }}
                            data={generalInfo}
                            start={start}
                            end={end}
                            reference={formValues?.menage_reference_period}
                            interest={{
                              start: generalInfo?.date_death,
                              end: formValues?.[`menage_date_paiement_${key}`]
                            }}
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
                      <Money
                        value={
                          parseFloat(formValues?.menage_amount || 0) +
                          indicativePersonChargeAmount * unsortedChildren?.length
                        }
                        ignore
                      />
                    </td>
                    <td>100 %</td>
                    <td>{formValues?.menage_contribution} %</td>
                    <td className="table-ref-standard-amount">
                      <TotalMenageAmount
                        values={{
                          ...formValues,
                          menage_amount:
                            parseFloat(formValues?.menage_amount || 0) +
                            indicativePersonChargeAmount * unsortedChildren?.length
                        }}
                        data={generalInfo}
                        end={getTheoreticalLeaveHomeDate(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
                          sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                          true
                        )}
                      />
                    </td>
                    <td className="int">
                      <Field
                        control={control}
                        type="date"
                        name="menage_date_paiement"
                        editable={editable}
                      >
                        {(props) => <input {...props} />}
                      </Field>
                    </td>
                    <td className="int">
                      <TotalMenageAmount
                        values={{
                          ...formValues,
                          menage_amount:
                            parseFloat(formValues?.menage_amount || 0) +
                            indicativePersonChargeAmount * unsortedChildren?.length
                        }}
                        data={generalInfo}
                        end={getTheoreticalLeaveHomeDate(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
                          sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                          true
                        )}
                        interest={{
                          start: generalInfo?.date_death,
                          end: formValues?.menage_date_paiement
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </>
        ) : studentSplitEnd ? (
          <>
            <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
              <thead>
                <tr>
                  <TextItem path="common.period" tag="th" />
                  <TextItem path="common.indemnite_journaliere" tag="th" />
                  <TextItem path="common.contribution" tag="th" />
                  <TextItem path="common.total" tag="th" />
                  <TextItem path="common.date_paiement" tag="th" className="int" />
                  <TextItem path="common.interest" tag="th" className="int" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {format(addDays(generalInfo?.date_death, 1), 'dd/MM/yyyy')} -{' '}
                    {format(studentSplitEnd, 'dd/MM/yyyy')}
                  </td>
                  <td>
                    <Field
                      control={control}
                      name={`menage_amount`}
                      type="number"
                      editable={editable}
                    >
                      {(props) => <input style={{ width: 50 }} {...props} />}
                    </Field>
                  </td>
                  <td>
                    <Field
                      control={control}
                      type="select"
                      options={constants.contribution}
                      name={`menage_contribution`}
                      editable={editable}
                    ></Field>
                  </td>
                  <td className="table-ref-children-amount">
                    <TotalMenageAmount
                      values={formValues}
                      data={generalInfo}
                      start={addDays(generalInfo?.date_death, 1)}
                      end={studentSplitEnd}
                      reference={formValues?.menage_reference_period}
                    />
                  </td>
                  <td className="int">
                    <Field
                      control={control}
                      type="date"
                      name="menage_date_paiement"
                      editable={editable}
                    >
                      {(props) => <input {...props} />}
                    </Field>
                  </td>
                  <td className="int">
                    <TotalMenageAmount
                      values={formValues}
                      data={generalInfo}
                      start={addDays(generalInfo?.date_death, 1)}
                      end={studentSplitEnd}
                      reference={formValues?.menage_reference_period}
                      interest={{
                        start: generalInfo?.date_death,
                        end: formValues?.menage_date_paiement
                      }}
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
                <TextItem path="common.indemnite_journaliere" tag="th" />
                <TextItem path="common.contribution" tag="th" />
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field control={control} name={`menage_amount`} type="number" editable={editable}>
                    {(props) => <input style={{ width: 50 }} {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="select"
                    options={constants.contribution}
                    name={`menage_contribution`}
                    editable={editable}
                  ></Field>
                </td>
                <td className="table-ref-standard-amount">
                  <TotalMenageAmount values={formValues} data={generalInfo} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="menage_date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <TotalMenageAmount
                    values={formValues}
                    data={generalInfo}
                    interest={{
                      start: generalInfo?.date_death,
                      end: formValues?.menage_date_paiement
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </FadeIn>

      <h3>
        <TextItem path="deces.prejudice_proche.variables_calcul" tag="span" />{' '}
        <TextItem path="deces.prejudice_proche.perte_contribution_eco" tag="span" />
      </h3>
      <table id="IPVariables">
        <tbody>
          {!studentSplitEnd && (
            <tr>
              <TextItem path="common.ref_table" tag="td" className="table-ref-other" />
              <td className="table-ref-other">
                <Field
                  control={control}
                  type="reference"
                  options={constants.reference}
                  name={`reference`}
                  editable={editable}
                ></Field>
              </td>
            </tr>
          )}
          {(sortedChildren?.length > 0 || studentSplitEnd) && (
            <tr>
              <TextItem path="common.ref_table_children" tag="td" className="table-ref-children" />
              <td className="table-ref-children">
                <Field
                  control={control}
                  type="reference"
                  options={constants.reference_menage_children}
                  name="revenue_reference_children"
                  editable={editable}
                ></Field>
              </td>
            </tr>
          )}
          <tr>
            <TextItem path="common.taux_interet_capitalisation" tag="td" />
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
        </tbody>
      </table>

      <FadeIn
        show={
          (studentSplitEnd
            ? formValues?.revenue_reference_children
            : sortedChildren?.length > 0
              ? formValues?.reference && formValues?.revenue_reference_children
              : formValues?.reference) && formValues?.interet
        }
      >
        <TextItem path="deces.prejudice_proche.perte_contribution_eco" tag="h3" />
        {sortedChildren?.length > 0 ? (
          <table id="itebTable" style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.period" tag="th" />
                <TextItem path="deces.prejudice_proche.revenu_defunt" tag="th" />
                <TextItem path="deces.prejudice_proche.revenu_total_menage" tag="th" />
                <TextItem path="deces.prejudice_proche.number_menage" tag="th" />
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              {sortedChildren?.map((item, key) => {
                const start =
                  key === 0
                    ? addDays(generalInfo?.date_death, 1)
                    : getTheoreticalLeaveHomeDate(
                        sortedChildren[key - 1]?.birthDate,
                        sortedChildren[key - 1]?.leaveHomeAge,
                        true
                      )
                const end = getTheoreticalLeaveHomeDate(item?.birthDate, item?.leaveHomeAge)
                const currentMembersAmount = Math.max(membersAmount - key, 0)

                return (
                  <tr key={key}>
                    <td>
                      {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                    </td>
                    <td>
                      <Field
                        control={control}
                        type="salary"
                        name={`revenue_defunt`}
                        editable={editable}
                        salaryType="yearly"
                      ></Field>
                    </td>
                    <td>
                      <Field
                        control={control}
                        type="number"
                        name={`revenue_total`}
                        editable={editable}
                      >
                        {(props) => <input {...props} />}
                      </Field>
                    </td>
                    <td>
                      {key === 0 ? (
                        <Field
                          control={control}
                          type="number"
                          name={`members_amount`}
                          editable={editable}
                        >
                          {(props) => <input {...props} />}
                        </Field>
                      ) : (
                        currentMembersAmount
                      )}
                    </td>
                    <td className="table-ref-children-amount">
                      <TotalRevenueAmount
                        values={formValues}
                        data={generalInfo}
                        start={start}
                        end={end}
                        reference={formValues?.revenue_reference_children}
                        membersAmount={currentMembersAmount}
                        noGender={true}
                        startIndex={1}
                      />
                    </td>
                    <td className="int">
                      <Field
                        control={control}
                        type="date"
                        name={`revenue_date_paiement_${key}`}
                        editable={editable}
                      >
                        {(props) => <input {...props} />}
                      </Field>
                    </td>
                    <td className="int">
                      <TotalRevenueAmount
                        values={formValues}
                        data={generalInfo}
                        start={start}
                        end={end}
                        reference={formValues?.revenue_reference_children}
                        membersAmount={currentMembersAmount}
                        noGender={true}
                        startIndex={1}
                        interest={{
                          start: generalInfo?.date_death,
                          end: formValues?.[`revenue_date_paiement_${key}`]
                        }}
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
                    type="salary"
                    name={`revenue_defunt`}
                    editable={editable}
                    salaryType="yearly"
                  ></Field>
                </td>
                <td>
                  <Field control={control} type="number" name={`revenue_total`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>{Math.max(membersAmount - sortedChildren.length, 0)}</td>
                <td className="table-ref-other-amount">
                  <TotalRevenueAmount
                    values={formValues}
                    data={generalInfo}
                    end={getTheoreticalLeaveHomeDate(
                      sortedChildren[sortedChildren?.length - 1]?.birthDate,
                      sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                      true
                    )}
                    reference={formValues?.reference}
                    membersAmount={Math.max(membersAmount - sortedChildren.length, 0)}
                  />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="revenue_date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <TotalRevenueAmount
                    values={formValues}
                    data={generalInfo}
                    end={getTheoreticalLeaveHomeDate(
                      sortedChildren[sortedChildren?.length - 1]?.birthDate,
                      sortedChildren[sortedChildren?.length - 1]?.leaveHomeAge,
                      true
                    )}
                    reference={formValues?.reference}
                    membersAmount={Math.max(membersAmount - sortedChildren.length, 0)}
                    interest={{
                      start: generalInfo?.date_death,
                      end: formValues?.revenue_date_paiement
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        ) : studentSplitEnd ? (
          <table id="itebTable" style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.period" tag="th" />
                <TextItem path="deces.prejudice_proche.revenu_defunt" tag="th" />
                <TextItem path="deces.prejudice_proche.revenu_total_menage" tag="th" />
                <TextItem path="deces.prejudice_proche.number_menage" tag="th" />
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {format(addDays(generalInfo?.date_death, 1), 'dd/MM/yyyy')} -{' '}
                  {format(studentSplitEnd, 'dd/MM/yyyy')}
                </td>
                <td>
                  <Field
                    control={control}
                    type="salary"
                    name={`revenue_defunt`}
                    editable={editable}
                    salaryType="yearly"
                  ></Field>
                </td>
                <td>
                  <Field control={control} type="number" name={`revenue_total`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`members_amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="table-ref-children-amount">
                  <TotalRevenueAmount
                    values={formValues}
                    data={generalInfo}
                    start={addDays(generalInfo?.date_death, 1)}
                    end={studentSplitEnd}
                    reference={formValues?.revenue_reference_children}
                    noGender={true}
                    startIndex={1}
                  />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="revenue_date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <TotalRevenueAmount
                    values={formValues}
                    data={generalInfo}
                    start={addDays(generalInfo?.date_death, 1)}
                    end={studentSplitEnd}
                    reference={formValues?.revenue_reference_children}
                    noGender={true}
                    startIndex={1}
                    interest={{
                      start: generalInfo?.date_death,
                      end: formValues?.revenue_date_paiement
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table id="itebTable" style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="deces.prejudice_proche.revenu_defunt" tag="th" />
                <TextItem path="deces.prejudice_proche.revenu_total_menage" tag="th" />
                <TextItem path="deces.prejudice_proche.number_menage" tag="th" />
                <TextItem path="common.total" tag="th" />
                <TextItem path="common.date_paiement" tag="th" className="int" />
                <TextItem path="common.interest" tag="th" className="int" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field
                    control={control}
                    type="salary"
                    name={`revenue_defunt`}
                    editable={editable}
                    salaryType="yearly"
                  ></Field>
                </td>
                <td>
                  <Field control={control} type="number" name={`revenue_total`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`members_amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="table-ref-other-amount">
                  <TotalRevenueAmount values={formValues} data={generalInfo} />
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name="revenue_date_paiement"
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <TotalRevenueAmount
                    values={formValues}
                    data={generalInfo}
                    interest={{
                      start: generalInfo?.date_death,
                      end: formValues?.revenue_date_paiement
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </FadeIn>
      <TotalBox
        label="deces.prejudice_proche.total"
        calc={(res) =>
          res +
          membersValues?.reduce((total, item) => {
            const amount = parseFloat(item.amount) || 0
            return total + amount
          }, 0)
        }
      />
      <TotalBoxInterest label="deces.prejudice_proche.total_interest" />
    </form>
  )
}

export default PrejudiceProcheForm
