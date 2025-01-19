import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { useCapitalization } from '@renderer/hooks/capitalization'

const PrejudiceProcheForm = ({ initialValues, onSubmit }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      members: [{}]
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

  const interetOptions = [0.5, 0.8, 1, 1.5, 2, 3]

  const getTotalAmount = useCallback(() => {
    const revenue = parseFloat(formValues?.revenue_total)
    const personnel = revenue / (parseInt(formValues?.members_amount) + 1)

    const coef = useCapitalization({
      end: formValues?.deces,
      index: interetOptions?.findIndex((e) => e === parseFloat(formValues?.interet)),
      ref: formValues?.reference
    })
    return (revenue - personnel) * coef
  }, [formValues])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Préjudices des proches</h1>
      <h3>Variables du calcul de capitalisation</h3>
      <table id="IPVariables">
        <tbody>
          <tr>
            <td>Tables de référence</td>
            <td>
              <select {...register('reference')}>
                <option value="schryvers">Schryvers 2024 rente viagère de 1€/an mensuelle</option>
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
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt de la capitalisation</td>
            <td>
              <select {...register('interet')}>
                <option value="" disabled>
                  Sélectionnez
                </option>
                {interetOptions?.map((it, key) => (
                  <option value={it} key={key}>
                    {it}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>Date du décès</td>
            <td>
              <input type="date" {...register('deces')} />
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Dommage moral des proches</h3>
      <table style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Nom du membre de la famille</th>
            <th>Lien de parenté</th>
            <th>Indemnité (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            return (
              <tr key={child.id}>
                <td>
                  <input type="text" {...register(`members.${index}.name`)} />
                </td>
                <td>
                  <select {...register(`members.${index}.link`)}>
                    <option value="partenaire">Partenaire [€ 15.000 - € 45.000]</option>
                    <option value="parent/enfant">Parent/Enfant [€ 15.000 - € 45.000]</option>
                    <option value="frère/soeur"> Frère/Soeur [€ 7.500 - € 25.000]</option>
                    <option value="grand_parent/petit_enfant">
                      Grand-parent/Petit-enfant [€ 7.500 - € 25.000]
                    </option>
                    <option value="fausse_couche">Fausse couche [€ 3.000 - € 9.000]</option>
                  </select>
                </td>
                <td style={{ width: 200 }}>
                  <input
                    type="number"
                    style={{ width: 50 }}
                    {...register(`members.${index}.amount`)}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => remove(index)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => addNext(append)}>
        Ajouter une ligne
      </button>
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
              <input type="number" {...register('revenue_defunt')} />
            </td>
            <td>
              <input type="number" {...register('revenue_total')} />
            </td>
            <td>
              <input type="number" {...register('members_amount')} />
            </td>
            <td>
              <Money value={getTotalAmount()} />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default PrejudiceProcheForm
