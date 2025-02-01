import React, { useCallback, useContext, useEffect, useRef } from 'react'
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

const PrejudiceProcheForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
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

  const getTotalAmount = useCallback(() => {
    const revenue = parseFloat(formValues?.revenue_total)
    const personnel = revenue / (parseInt(formValues?.members_amount) + 1)

    const coef = useCapitalization({
      end: data?.general_info?.date_death,
      index: constants.interet_amount?.findIndex(
        (e) => e?.value === parseFloat(formValues?.interet)
      ),
      ref: formValues?.reference
    })
    return (revenue - personnel) * coef
  }, [formValues, data])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Préjudices des proches</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Tables de référence</td>
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
        <h3>Dommage moral des proches</h3>
        <table style={{ width: 1000 }}>
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
          <button type="button" onClick={() => addNext(append)}>
            Ajouter une ligne
          </button>
        )}
        <h3>Perte du revenu du défunt</h3>
        <table id="itebTable" style={{ width: 1000 }}>
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
                  <Money value={getTotalAmount()} />
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <TotalBox
          label="Total général :"
          value={
            getTotalAmount() +
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
