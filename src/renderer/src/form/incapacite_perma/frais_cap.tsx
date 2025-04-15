import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import paid_table from '@renderer/data/data_va_eur_annees_2025'

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

  const getTotalChargeAmount = useCallback((values) => {
    if (!values?.date_payment) return 0

    const coef = useCapitalization({
      end: values?.date_payment,
      ref: values?.reference,
      index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate))
    })

    return (parseFloat(values?.amount || 0) * (coef || 0)).toFixed(2)
  }, [])

  const getTotalPaidAmount = useCallback((values) => {
    const coef = paid_table?.[values?.year]?.[values?.rate]
    return (parseFloat(values?.amount || 0) * (coef || 0)).toFixed(2)
  })

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
            const total = getTotalChargeAmount(values)
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
                    type="select"
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
                  <Money value={total} />
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
        <button type="button" onClick={() => chargesFields.append({ reference: 'schryvers_2024' })}>
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
            <th>Taux d'intérêt de la capitalisation</th>
            <th>Total</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {paidFields.fields.map((child, index) => {
            const values = formValues?.paid?.[index]
            const total = getTotalPaidAmount(values)
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
                  <Money value={total} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => paidFields.remove(index)}>
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
