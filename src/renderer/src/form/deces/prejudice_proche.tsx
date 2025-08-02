import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'
import TotalBox from '@renderer/generic/totalBox'
import { addYears, intervalToDuration } from 'date-fns'
import menTable from '@renderer/data/schryvers/2024/data_cap_h_mois'
import womenTable from '@renderer/data/schryvers/2024/data_cap_f_mois'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import CoefficientInfo from '@renderer/generic/coefficientInfo'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'

const TotalRevenue = ({ values, data }) => {
  const revenue = parseFloat(values?.revenue_total)
  const personnel = revenue / (parseInt(values?.members_amount) + 1)

  const capitalization = useCapitalization({
    end: data?.general_info?.date_death,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.interet)),
    ref: values?.reference,
    asObject: true
  })

  const variables = useMemo(
    () => ({
      revenue,
      personnel,
      coef: capitalization?.value
    }),
    [revenue, personnel, capitalization]
  )

  const totalAmount = useMemo(() => {
    return ((parseFloat(values?.revenue_defunt) || 0) - variables.personnel) * variables.coef
  }, [values?.revenue_defunt, variables])

  const renderToolTipAmount = useCallback(() => {
    return (
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
  }, [variables, values, totalAmount])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Money value={totalAmount} />
      <Tooltip tooltipContent={renderToolTipAmount()}>
        <FaRegQuestionCircle style={{ marginLeft: 5 }} />
      </Tooltip>
    </div>
  )
}

const TotalMenage = ({ values = {}, data }) => {
  const {
    interet = 0,
    menage_amount = 0,
    menage_pourcentage = 100,
    menage_contribution = 0
  } = values

  // Vérification des dates
  const startDate = data?.general_info?.date_naissance
    ? new Date(data.general_info.date_naissance)
    : null
  const endDate = data?.general_info?.date_death ? new Date(data.general_info.date_death) : null

  const coef = useCapitalization({
    end: endDate,
    start: startDate,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.interet)),
    ref: values?.menage_ref,
    asObject: true
  })

  // Calcul du montant total avec useMemo
  const totalAmount = useMemo(() => {
    return (
      parseFloat(menage_amount) *
      (parseFloat(menage_pourcentage) / 100) *
      (parseFloat(menage_contribution) / 100) *
      365 *
      parseFloat(coef?.value)
    ).toFixed(2)
  }, [menage_amount, menage_pourcentage, menage_contribution, coef])

  // Fonction pour rendre le tooltip
  const renderToolTipAmount = useCallback(() => {
    return (
      <>
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
      </>
    )
  }, [menage_amount, menage_pourcentage, totalAmount, coef, totalAmount])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Money value={totalAmount} />
      <Tooltip tooltipContent={renderToolTipAmount()}>
        <FaRegQuestionCircle style={{ marginLeft: 5 }} />
      </Tooltip>
      <div className="hide">{totalAmount}</div>
    </div>
  )
}

const PrejudiceProcheForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const ref = useRef(null)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      menage_contribution: data?.general_info?.config?.default_contribution,
      members: data?.general_info?.children?.map((it, key) => ({
        name: it?.name,
        link: 'parent/enfant'
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

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(membersValues) !== JSON.stringify(previousValuesRef.current?.members)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        members: membersValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, membersValues, submitForm, handleSubmit])

  const columns = [
    { header: 'deces.prejudice_proche.name_membre', key: 'name', type: 'text' },
    {
      header: 'deces.prejudice_proche.lien_parente',
      key: 'link',
      type: 'select',
      options: constants.family_link
    },
    { header: 'common.indemnite', key: 'amount', type: 'number' },
    { header: 'common.date_paiement', key: 'date_paiement', type: 'date', className: 'int' },
    {
      header: 'common.interest',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: data?.general_info?.date_death }
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
        <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <TextItem path="common.indemnite_journaliere" tag="th" />
              <TextItem path="common.contribution" tag="th" />
              <TextItem path="common.total" tag="th" />
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
                <TotalMenage values={formValues} data={data} />
              </td>
            </tr>
          </tbody>
        </table>
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
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Field control={control} type="number" name={`revenue_defunt`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
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
              <td>
                {!data?.general_info?.date_naissance ? (
                  <TextItem path="errorsdn.missing_date_naissance" />
                ) : (
                  <TotalRevenue values={formValues} data={data} />
                )}
              </td>
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
    </form>
  )
}

export default PrejudiceProcheForm
