import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import CoefficientInfo from '@renderer/generic/coefficientInfo'

const TotalPaid = ({ values }) => {
  const coef = useCapitalization({
    end: values?.date_payment,
    ref: values?.reference,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate))
  })

  return <Money value={(parseFloat(values?.amount || 0) * (coef || 0)).toFixed(2)} />
}

const TotalCharge = ({ values }) => {
  console.log(values)
  const capitalization = useCapitalization({
    start: new Date(),
    end: new Date(
      new Date().setFullYear(new Date().getFullYear() + parseInt(values?.year || 0) - 1)
    ),
    ref: values?.reference,
    base: 'data_va_eur_annees',
    noGender: true,
    index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate)),
    asObject: true
  })

  const renderToolTipAmount = useCallback(() => {
    return (
      <div>
        <math>
          <mn>{values?.amount}</mn>
          <mo>x</mo>
          <CoefficientInfo
            table={capitalization?.table}
            index={capitalization?.index}
            headers={constants.interet_amount}
            startIndex={1}
          >
            <mn>{capitalization?.value}</mn>
          </CoefficientInfo>
        </math>
      </div>
    )
  }, [values, capitalization])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Money value={(parseFloat(values?.amount || 0) * (capitalization?.value || 0)).toFixed(2)} />
      <Tooltip tooltipContent={renderToolTipAmount()}>
        <FaRegQuestionCircle style={{ marginLeft: 5 }} />
      </Tooltip>
    </div>
  )
}

const FraisCapForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      charges: [{}]
    }
  })

  const chargesFields = useFieldArray({
    control,
    name: 'charges' // Champs dynamiques pour les enfants
  })

  const paidFields = useFieldArray({
    control,
    name: 'paid' // Champs dynamiques pour les enfants
  })

  const packageFields = useFieldArray({
    control,
    name: 'package' // Dynamic fields for children
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
  })

  // Utiliser useWatch pour surveiller les FieldArrays
  const paidValues = useWatch({
    control,
    name: 'paid'
  })

  const packageValues = useWatch({
    control,
    name: 'package'
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
      JSON.stringify(paidValues) !== JSON.stringify(previousValuesRef.current?.paid) ||
      JSON.stringify(packageValues) !== JSON.stringify(previousValuesRef.current?.package)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues,
        paid: paidValues,
        package: packageValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, paidValues, packageValues, submitForm, handleSubmit])

  const handleRemovePaid = useCallback(
    (index) => {
      paidFields.remove(index)
    },
    [paidFields]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Frais futurs</h1>
      <h3>Frais capitalisés</h3>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Date du paiement</th>
            <th className="custom-size">Table de référence</th>
            <th>Taux d'intérêt de la capitalisation</th>
            <th>Montant annualisé (€)</th>
            <th>Total</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {chargesFields.fields.map((child, index) => {
            const values = formValues?.charges[index]
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
                    name={`charges.${index}.date_payment`}
                    editable={editable}
                    type="date"
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="reference"
                    options={constants.reference_light.concat(constants.reference)}
                    name={`charges.${index}.reference`}
                    editable={editable}
                  ></Field>
                </td>
                <td style={{ maxWidth: 120 }}>
                  <Field
                    control={control}
                    type="select"
                    options={constants.interet_amount}
                    name={`charges.${index}.rate`}
                    editable={editable}
                  ></Field>
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
                  <TotalPaid values={values} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => chargesFields.remove(index)}>
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
        <button type="button" onClick={() => chargesFields.append({})}>
          Ajouter une ligne
        </button>
      )}
      <h3>Frais payés dans N années</h3>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant</th>
            <th>Nombre d'années</th>
            <th>Table de référence</th>
            <th>Taux d'intérêt de la capitalisation</th>
            <th>Total</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {paidFields.fields.map((child, index) => {
            const values = formValues?.paid?.[index]
            return (
              <tr key={child.id}>
                <td>
                  <Field control={control} name={`paid.${index}.name`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    name={`paid.${index}.amount`}
                    editable={editable}
                    type="number"
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="select"
                    options={constants.zeroToFifty}
                    name={`paid.${index}.year`}
                    editable={editable}
                  ></Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="reference"
                    name={`paid.${index}.reference`}
                    editable={editable}
                  ></Field>
                </td>
                <td style={{ maxWidth: 120 }}>
                  <Field
                    control={control}
                    type="select"
                    options={constants.interet_amount}
                    name={`paid.${index}.rate`}
                    editable={editable}
                  ></Field>
                </td>
                <td>
                  <TotalCharge values={values} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => handleRemovePaid(index)}>
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
        <button type="button" onClick={() => paidFields.append({})}>
          Ajouter une ligne
        </button>
      )}
      <h3>Forfait</h3>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {packageFields.fields.map((child, index) => {
            const values = formValues?.package?.[index]
            return (
              <tr key={child.id}>
                <td>
                  <Field control={control} name={`package.${index}.name`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    name={`package.${index}.amount`}
                    editable={editable}
                    type="number"
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
                    <button type="button" onClick={() => packageFields.remove(index)}>
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
        <button type="button" onClick={() => packageFields.append({})}>
          Ajouter une ligne
        </button>
      )}
    </form>
  )
}

export default FraisCapForm
