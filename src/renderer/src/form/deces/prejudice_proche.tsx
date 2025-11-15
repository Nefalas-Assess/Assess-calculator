import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
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
import { calculateDaysBeforeAfter25 } from '@renderer/helpers/general'
import { addDays, format } from 'date-fns'
import Interest from '@renderer/generic/interet'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'

const TotalRevenueAmount = ({ values, data, control, editable }) => {
  const capitalization = useCapitalization({
    end: data?.date_death,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.interet)),
    ref: values?.reference,
    asObject: true
  })

  const getTotalRevenueAmount = useCallback(() => {
    const revenue = parseFloat(values?.revenue_total)
    const personnel = revenue / (parseInt(values?.members_amount) + 1)

    const variables = { revenue, personnel, coef: capitalization?.value }

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
                    <mn>{values?.members_amount}</mn>
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
  }, [capitalization, values])

  return (
    <>
      <td>
        {!data?.date_naissance ? (
          <TextItem path="errorsdn.missing_date_naissance" />
        ) : (
          <Money {...getTotalRevenueAmount()} />
        )}
      </td>
      <td className="int">
        <Field control={control} type="date" name="revenue_date_paiement" editable={editable}>
          {(props) => <input {...props} />}
        </Field>
      </td>
      <td className="int">
        <Interest
          amount={getTotalRevenueAmount()?.value}
          start={data?.date_death}
          end={values?.revenue_date_paiement}
        />
      </td>
    </>
  )
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
    ref: reference || values?.menage_ref,
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

  const ref = useRef(null)

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues || {
      menage_contribution: generalInfo?.config?.default_contribution,
      menage_amount: indicativeAmount,
      members: generalInfo?.children?.map((it, key) => ({
        name: it?.name,
        link: 'parent/enfant',
        date_paiement: generalInfo?.config?.date_paiement
      }))
    }
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const membersValues = useWatch({
    control,
    name: 'members'
  })

  // Référence pour suivre les anciennes valeurs
  const previousValuesRef = useRef({})

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
        const result = calculateDaysBeforeAfter25(item?.birthDate, [
          generalInfo?.date_death,
          formValues?.paiement
        ])

        if (result?.before25 !== 0) {
          res.push({ days: result, ...item })
        }
      }
    }

    return res
  }, [formValues, generalInfo])

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
        const date25 = get25thBirthday(e?.birthDate)
        // Get consolidation date from general info
        const deathDate = new Date(generalInfo?.date_death)
        // Keep child only if their 25th birthday is after consolidation date
        return date25 > deathDate
      })
      ?.sort((a, b) => new Date(a?.birthDate) - new Date(b?.birthDate))
  }, [childrenOnPeriod, generalInfo])

  // Children without birthdate
  const unsortedChildren = useMemo(() => {
    return childrenOnPeriod?.filter((e) => !e?.birthDate)
  }, [childrenOnPeriod])

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(membersValues) !== JSON.stringify(previousValuesRef.current?.members)

    if (
      formValues?.reference &&
      formValues?.interet &&
      !formValues?.revenue_date_paiement &&
      generalInfo?.config?.date_paiement
    ) {
      setValue('revenue_date_paiement', generalInfo?.config?.date_paiement)
    }

    if (
      formValues?.menage_ref &&
      formValues?.menage_interet &&
      !formValues?.menage_date_paiement &&
      generalInfo?.config?.date_paiement
    ) {
      setValue('menage_date_paiement', generalInfo?.config?.date_paiement)
      sortedChildren?.forEach((child, key) => {
        setValue(`menage_date_paiement_${key}`, generalInfo?.config?.date_paiement)
      })
    }

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        members: membersValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [
    formValues,
    membersValues,
    submitForm,
    handleSubmit,
    generalInfo?.config?.date_paiement,
    setValue,
    sortedChildren
  ])

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
    <form onSubmit={handleSubmit(onSubmit)} ref={ref}>
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
          <tr>
            <TextItem path="common.ref_table" tag="td" />
            <td>
              <Field
                control={control}
                type="reference"
                options={constants.reference_light}
                name="menage_ref"
                editable={editable}
              ></Field>
            </td>
          </tr>
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

      <FadeIn show={formValues?.menage_ref && formValues?.menage_interet}>
        <TextItem path="deces.prejudice_proche.perte_contribution_menage" tag="h3" />
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
                      name="menage_reference"
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
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
            <FadeIn show={formValues?.menage_reference}>
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
                        : get25thBirthday(sortedChildren[key - 1]?.birthDate, true)

                    const end = get25thBirthday(item?.birthDate)

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
                        <td>
                          <TotalMenageAmount
                            values={{
                              ...formValues,
                              menage_amount: menage_amount
                            }}
                            data={generalInfo}
                            start={start}
                            end={end}
                            reference={formValues?.menage_reference}
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
                            reference={formValues?.menage_reference}
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
                        get25thBirthday(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
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
                    <td>
                      <TotalMenageAmount
                        values={{
                          ...formValues,
                          menage_amount:
                            parseFloat(formValues?.menage_amount || 0) +
                            indicativePersonChargeAmount * unsortedChildren?.length
                        }}
                        data={generalInfo}
                        end={get25thBirthday(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
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
                        end={get25thBirthday(
                          sortedChildren[sortedChildren?.length - 1]?.birthDate,
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
                <td>
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
          <tr>
            <TextItem path="common.ref_table" tag="td" />
            <td>
              <Field
                control={control}
                type="reference"
                options={constants.reference}
                name={`reference`}
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
                name={`interet`}
                editable={editable}
              ></Field>
            </td>
          </tr>
        </tbody>
      </table>

      <FadeIn show={formValues?.reference && formValues?.interet}>
        <TextItem path="deces.prejudice_proche.perte_contribution_eco" tag="h3" />
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
                <Field control={control} type="number" name={`members_amount`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <TotalRevenueAmount
                values={formValues}
                data={generalInfo}
                control={control}
                editable={editable}
              />
            </tr>
          </tbody>
        </table>
      </FadeIn>
      <TotalBox
        label="deces.prejudice_proche.total"
        documentRef={ref}
        calc={(res) =>
          res +
          membersValues?.reduce((total, item) => {
            const amount = parseFloat(item.amount) || 0
            return total + amount
          }, 0)
        }
      />
      <TotalBoxInterest label="deces.prejudice_proche.total_interest" documentRef={ref} />
    </form>
  )
}

export default PrejudiceProcheForm
