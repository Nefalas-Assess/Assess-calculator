import Field from '@renderer/generic/field'
import { isValid } from 'date-fns'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'

export const InfoForm = ({ onSubmit, initialValues, editable = true }) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues || {
      nom_victime: '',
      sexe: '',
      date_accident: '',
      date_naissance: '',
      date_consolidation: '',
      statut: 'marié', // Valeur par défaut
      profession: 'employe', // Valeur par défaut
      calcul_interets: 'non',
      children: [] // Liste vide d'enfants par défaut
    }
  })

  const childrenFields = useFieldArray({
    control,
    name: 'children' // Champs dynamiques pour les enfants
  })

  const formValues = watch() // Suivi de l'état de "calcul_interets"

  // Utiliser useWatch pour surveiller les FieldArrays
  const childrenValues = useWatch({
    control,
    name: 'children'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  const previousValuesRef = useRef({})

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(childrenValues) !== JSON.stringify(previousValuesRef.current?.children)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        children: childrenValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, childrenValues, submitForm, handleSubmit])

  const addChild = () => {
    childrenFields.append({ name: '', birthDate: '' }) // Nouveau champ enfant
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h3>General</h3>
      <table id="infogTable">
        <tbody>
          <tr>
            <td>Nom de la victime</td>
            <td>
              <Field control={control} name="nom_victime" editable={editable}>
                {(props) => <input style={{ width: 200 }} {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Sexe</td>
            <td>
              <Field control={control} name="sexe" editable={editable}>
                {(props) => (
                  <select {...props}>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                )}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Date de l'accident</td>
            <td>
              <Field control={control} name="date_accident" editable={editable}>
                {(props) => <input type="date" {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Date de naissance</td>
            <td>
              <Field control={control} name="date_naissance" editable={editable}>
                {(props) => <input type="date" {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Date de consolidation</td>
            <td>
              <Field control={control} name="date_consolidation" editable={editable}>
                {(props) => <input type="date" {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Situation conjugale</td>
            <td>
              <Field control={control} name="statut" editable={editable}>
                {(props) => (
                  <select {...props}>
                    <option value="marié">Marié</option>
                    <option value="célibataire">Célibataire</option>
                  </select>
                )}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Statut professionnel</td>
            <td>
              <Field control={control} name="profession" editable={editable}>
                {(props) => (
                  <select {...props}>
                    <option value="employe">Employé</option>
                    <option value="ouvrier">Ouvrier</option>
                    <option value="sans_emploi">Sans emploi</option>
                    <option value="retraite">Retraité</option>
                    <option value="independant">Indépendant</option>
                    <option value="fonctionnaire">Fonctionnaire</option>
                    <option value="invalide">Invalide</option>
                  </select>
                )}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Enfants</h3>
      <table style={{ maxWidth: 1000 }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Date de naissance</th>
            {editable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {childrenFields?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <Field control={control} name={`children.${index}.name`} editable={editable}>
                  {(props) => <input style={{ width: 300 }} {...props} />}
                </Field>
              </td>
              <td>
                <Field control={control} name={`children.${index}.birthDate`} editable={editable}>
                  {(props) => <input type="date" {...props} />}
                </Field>
              </td>
              {editable && (
                <td>
                  <button type="button" onClick={() => childrenFields?.remove(index)}>
                    Supprimer
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={addChild}>
          Ajouter un enfant
        </button>
      )}

      {/* Sélecteur pour les intérêts */}
      {editable && (
        <div>
          <label>
            <h3>Voulez-vous calculer les intérêts ? </h3>
            <Field control={control} name="calcul_interets" editable={editable}>
              {(props) => (
                <select {...props}>
                  <option value={false}>Non</option>
                  <option value={true}>Oui</option>
                </select>
              )}
            </Field>
          </label>
        </div>
      )}
    </form>
  )
}

export default InfoForm
