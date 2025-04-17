import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { intervalToDuration } from 'date-fns'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import CoefficientInfo from '@renderer/generic/coefficientInfo'
import { useCapitalization } from '@renderer/hooks/capitalization'

const Total = ({ values = {}, index, data }) => {
  // Calcul du montant total avec useMemo

  const amount = parseFloat(values?.charges?.[index]?.amount, 10)

  const capitalization = useCapitalization({
    end: data?.general_info?.date_death,
    ref: values?.ref,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate)),
    base: 'data_ff',
    asObject: true
  })

  const coef = useMemo(() => capitalization?.value, [capitalization])

  const totalAmount = useMemo(() => {
    return amount * coef
  }, [amount, coef])

  // Fonction pour rendre le tooltip
  const renderToolTipAmount = useCallback(() => {
    return (
      <>
        <div>
          <math>
            <mn>{amount}</mn>
            <mo>x</mo>
            <CoefficientInfo
              table={capitalization?.table}
              index={capitalization?.index}
              headers={constants.interet_amount}
            >
              <mn>{coef}</mn>
            </CoefficientInfo>
            <mo>=</mo>
            <mn>{totalAmount}</mn>
          </math>
        </div>
      </>
    )
  }, [totalAmount, values])

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

const FraisFunForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      charges: [{}]
    }
  })

  const fraisFields = useFieldArray({
    control,
    name: 'charges' // Champs dynamiques pour les enfants
  })

  const notAnticipatedFields = useFieldArray({
    control,
    name: 'not_anticipated_charges' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
  })

  const notAnticipatedValues = useWatch({
    control,
    name: 'not_anticipated_charges'
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
      JSON.stringify(chargesValues) !== JSON.stringify(previousValuesRef.current?.charges) ||
      JSON.stringify(notAnticipatedValues) !==
        JSON.stringify(previousValuesRef.current?.not_anticipated_charges)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues,
        not_anticipated_charges: notAnticipatedValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, submitForm, handleSubmit])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Frais funéraires</h1>
      <h3>Variables</h3>
      <table id="IPVariables">
        <tr>
          <td>Tables de référence</td>
          <td>
            <Field control={control} type="reference" name={`ref`} editable={editable}></Field>
          </td>
        </tr>
        <tr>
          <td>Taux d'intérêt</td>
          <td>
            <Field
              control={control}
              type="select"
              options={constants.interet_amount}
              name={`rate`}
              editable={editable}
            ></Field>
          </td>
        </tr>
      </table>
      <h3>Frais anticipés</h3>
      <table id="itebTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant (€)</th>
            <th>Montant anticipé</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fraisFields.fields.map((child, index) => {
            return (
              <tr key={child.id}>
                <td>
                  <Field control={control} name={`charges.${index}.name`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`charges.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Total values={formValues} index={index} data={data} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => fraisFields.remove(index)}>
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
        <button type="button" onClick={() => fraisFields.append({})}>
          Ajouter une ligne
        </button>
      )}
      <h3>Frais non-anticipés</h3>
      <table id="itebTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant (€)</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {notAnticipatedFields.fields.map((child, index) => {
            const values = formValues?.not_anticipated_charges?.[index]
            return (
              <tr key={child.id}>
                <td>
                  <Field
                    control={control}
                    name={`not_anticipated_charges.${index}.name`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`not_anticipated_charges.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                  {/* Used for the total box calculation  */}
                  <div className="money" style={{ display: 'none' }}>
                    {values?.amount}
                  </div>
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => notAnticipatedFields.remove(index)}>
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
        <button type="button" onClick={() => notAnticipatedFields.append({})}>
          Ajouter une ligne
        </button>
      )}
    </form>
  )
}

export default FraisFunForm
