import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'

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

  const interetOptions = [0.5, 0.8, 1, 1.5, 2, 3]

  const getTotalAmount = useCallback((values) => {
    const coef = useCapitalization({
      end: values?.date_payment,
      ref: values?.reference,
      index: interetOptions?.findIndex((e) => e === parseFloat(values?.rate))
    })

    return (parseFloat(values?.amount || 0) * (coef || 0)).toFixed(2)
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Capitalisation des frais</h1>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Date du paiement</th>
            <th className="custom-size">Table de référence</th>
            <th>Taux d'intérêt de la capitalisation</th>
            <th>Montant annualisé(€)</th>
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
                    {(props) => <input type="text" {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    name={`charges.${index}.date_payment`}
                    editable={editable}
                  >
                    {(props) => <input type="date" {...props} />}
                  </Field>
                </td>
                <td>
                  <Field control={control} name={`charges.${index}.reference`} editable={editable}>
                    {(props) => (
                      <select {...props}>
                        <option value="schryvers">
                          Schryvers 2024 rente viagère de 1€/an mensuelle
                        </option>
                        <option value="schryvers_65">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (65 ans)
                        </option>
                        <option value="schryvers_66">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (66 ans)
                        </option>
                        <option value="schryvers_67">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (67 ans)
                        </option>
                        <option value="schryvers_68">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (68 ans)
                        </option>
                        <option value="schryvers_69">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (69 ans)
                        </option>
                        <option value="schryvers_70">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (70 ans)
                        </option>
                        <option value="schryvers_71">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (71 ans)
                        </option>
                        <option value="schryvers_72">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (72 ans)
                        </option>
                        <option value="schryvers_73">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (73 ans)
                        </option>
                        <option value="schryvers_74">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (74 ans)
                        </option>
                        <option value="schryvers_75">
                          Schryvers 2024 rente viagère de 1€/an mensuelle (75 ans)
                        </option>
                      </select>
                    )}
                  </Field>
                </td>
                <td style={{ maxWidth: 120 }}>
                  <Field control={control} name={`charges.${index}.rate`} editable={editable}>
                    {(props) => (
                      <select {...props}>
                        {interetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}%
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </td>
                <td>
                  <Field control={control} name={`charges.${index}.amount`} editable={editable}>
                    {(props) => <input type="number" {...props} />}
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
    </form>
  )
}

export default FraisCapForm
