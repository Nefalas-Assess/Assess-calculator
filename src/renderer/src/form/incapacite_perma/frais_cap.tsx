import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'

const FraisCapForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      charges: [{}]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'charges' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
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
      JSON.stringify(chargesValues) !== JSON.stringify(previousValuesRef.current?.charges)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, submitForm, handleSubmit])

  const getTotalAmount = useCallback((values) => {
    if (!values?.date_payment) return 0

    const coef = useCapitalization({
      end: values?.date_payment,
      ref: values?.reference,
      index: constants.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate))
    })

    return (parseFloat(values?.amount || 0) * (coef || 0)).toFixed(2)
  }, [])

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
          {fields.map((child, index) => {
            const values = formValues?.charges[index]
            const total = getTotalAmount(values)
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
                    options={constants.reference}
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
        <button type="button" onClick={() => append({ ref: 'schryvers' })}>
          Ajouter une ligne
        </button>
      )}
      
      <h3>Frais payés dans N années</h3>
      <table id="modifier" style={{ maxWidth: 1200 }}>
        <tr>
          <td>Frais</td>
          <td>Montant</td>
          <td>Nombre d'années</td>
          <td>Taux d'intérêt de la capitalisation</td>
          <td>Total</td>
          <td></td>
        </tr>
        <tr>
          <td>Input lettres</td>
          <td>Input montant</td>
          <td>Input/scroll [1-50]</td>
          <td>Scroll avec les % de capi comme tableau au dessus</td>
          <td>Total = montant * coeff trouvé dans data_va_eur_annees_2025.tsx
            Ex : Si le nombre d'années est 10 et le % d'int de la capi est 1% ; coeff = 0.9053
          </td>
          <td>Bouton Supprimer</td>
        </tr>
      </table>
      Ajouter une ligne

      <h3>Forfait</h3>
      <table id="modifier" style={{ maxWidth: 1200 }}>
        <tr>
          <td>Frais</td>
          <td>Montant</td>
          <td></td>
        </tr>
        <tr>
          <td>Input lettres</td>
          <td>Input montant (il n'y pas de calcul à effectuer c'est une zone pour mettre des trucs libres)</td>
          <td>Bouton Supprimer</td>
        </tr>
      </table>
      Ajouter une ligne
    </form>
  )
}

export default FraisCapForm
