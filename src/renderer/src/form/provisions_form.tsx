import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'

const ProvisionsForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      provisions: [{}]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'provisions' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const provisionsValues = useWatch({
    control,
    name: 'provisions'
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
      JSON.stringify(provisionsValues) !== JSON.stringify(previousValuesRef.current?.provisions)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        provisions: provisionsValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, provisionsValues, submitForm, handleSubmit])

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.provisions?.[formValues?.provisions?.length - 1]?.end

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Provisions</h1>
      <table style={{ width: 700 }}>
        <thead>
          <tr>
            <th>Date de provision</th>
            <th>Montant</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            const values = formValues?.provisions[index]
            return (
              <tr key={child.id}>
                <td>
                  <Field
                    control={control}
                    type="date"
                    name={`provisions.${index}.date_provision`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`provisions.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Field
                    control={control}
                    type="date"
                    name={`provisions.${index}.date_paiement`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td className="int">
                  <Interest
                    amount={values?.amount || 0}
                    start={values?.date_provision}
                    end={values?.date_paiement}
                  />
                </td>
                {editable && (
                  <td>
                    <button onClick={() => remove(index)}>Supprimer</button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={() => addNext(append, {})}>
          Ajouter provisions
        </button>
      )}
    </form>
  )
}

export default ProvisionsForm
