import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
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
import menTable from '@renderer/data/data_cap_h_2024'
import womenTable from '@renderer/data/data_cap_f_2024'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import CoefficientInfo from '@renderer/generic/coefficientInfo'

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
            <CoefficientInfo
              table={capitalization?.table}
              index={capitalization?.index}
              headers={constants.interet_amount}
            >
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

  const { years = 0 } =
    startDate && endDate ? intervalToDuration({ start: startDate, end: endDate }) : { years: 0 }

  // Choisir la bonne table en fonction du sexe
  const table = data?.general_info?.sexe === 'homme' ? menTable : womenTable

  // Trouver l'index du coefficient d'intérêt
  const index = constants.interet_amount?.findIndex((e) => e?.value === parseFloat(interet || 0))

  // Récupérer le coefficient selon l'âge et l'intérêt
  const coefficient = table?.[years]?.[index] || 1 // Sécurisation pour éviter les erreurs

  // Calcul du montant total avec useMemo
  const totalAmount = useMemo(() => {
    return (
      parseFloat(menage_amount) *
      (parseFloat(menage_pourcentage) / 100) *
      (parseFloat(menage_contribution) / 100) *
      365 *
      parseFloat(coefficient)
    ).toFixed(2)
  }, [menage_amount, menage_pourcentage, menage_contribution, coefficient])

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
            <CoefficientInfo
              table={table}
              headers={constants.interet_amount}
              index={[years, index]}
            >
              <mn>{coefficient}</mn>
            </CoefficientInfo>
            <mo>=</mo>
            <mn>{totalAmount}</mn>
          </math>
        </div>
      </>
    )
  }, [menage_amount, menage_pourcentage, totalAmount, coefficient, totalAmount])

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

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'members' // Champs dynamiques pour les enfants
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

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.members?.[formValues?.members?.length - 1]?.end

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} ref={ref}>
      <h1>Préjudices des proches</h1>
      <h3>Dommage moral des proches</h3>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Nom du membre de la famille</th>
            <th>Lien de parenté</th>
            <th>Indemnité (€)</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            return (
              <tr key={child.id}>
                <td>
                  <Field control={control} name={`members.${index}.name`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="select"
                    options={constants.family_link}
                    name={`members.${index}.link`}
                    editable={editable}
                  ></Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`members.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input style={{ width: 100 }} {...props} />}
                  </Field>
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
        <button type="button" onClick={() => addNext(append({ amount: 30 }))}>
          Ajouter une ligne
        </button>
      )}
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Table de référence</td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.reference}
                name={`reference`}
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
                name={`interet`}
                editable={editable}
              ></Field>
            </td>
          </tr>
        </tbody>
      </table>

      <FadeIn show={formValues?.reference && formValues?.interet}>
        <h3>Perte du revenu du défunt</h3>
        <table id="itebTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th>Revenu du défunt (€)</th>
              <th>Revenu total du ménage (€)</th>
              <th>Nombre de membres du ménage avant le décès</th>
              <th>Total (€)</th>
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
                  <span>Date de naissance manquante</span>
                ) : (
                  <TotalRevenue values={formValues} data={data} />
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <h3>Contribution ménagères du défunt</h3>
        <table id="IPCAPTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th>Indemnité journalière (€)</th>
              <th>Contribution (%)</th>
              <th>Total (€)</th>
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
        <TotalBox
          label="Total général :"
          documentRef={ref}
          calc={(res) =>
            res +
            membersValues?.reduce((total, item) => {
              const amount = parseFloat(item.amount) || 0
              return total + amount
            }, 0)
          }
        />
      </FadeIn>
    </form>
  )
}

export default PrejudiceProcheForm
