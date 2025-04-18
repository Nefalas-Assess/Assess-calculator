import constants from '@renderer/constants'
import Field from '@renderer/generic/field'
import { isValid } from 'date-fns'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'

export const InfoForm = ({ onSubmit, initialValues, editable = true }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues || {
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

  const configValues = useWatch({
    control,
    name: 'config'
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
      JSON.stringify(childrenValues) !== JSON.stringify(previousValuesRef.current?.children) ||
      JSON.stringify(configValues) !== JSON.stringify(previousValuesRef.current?.config)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        children: childrenValues,
        config: configValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, childrenValues, configValues, submitForm, handleSubmit])

  const addChild = () => {
    childrenFields.append({ name: '', birthDate: '' }) // Nouveau champ enfant
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div style={{ display: 'flex' }}>
        <table id="infogTable" style={{ width: 600 }}>
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
                <Field
                  control={control}
                  type="select"
                  options={constants.sexe}
                  name="sexe"
                  editable={editable}
                />
              </td>
            </tr>
            <tr>
              <td>Date de l'accident</td>
              <td>
                <Field control={control} type="date" name="date_accident" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <td>Date de naissance</td>
              <td>
                <Field control={control} type="date" name="date_naissance" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <td>Date de décès</td>
              <td>
                <Field control={control} type="date" name="date_death" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <td>Date de consolidation</td>
              <td>
                <Field control={control} type="date" name="date_consolidation" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <td>Situation conjugale</td>
              <td>
                <Field
                  control={control}
                  type="select"
                  options={constants.marital_status}
                  name="statut"
                  editable={editable}
                />
              </td>
            </tr>
            <tr>
              <td>Statut professionnel</td>
              <td>
                <Field
                  control={control}
                  type="select"
                  options={constants.profession}
                  name="profession"
                  editable={editable}
                ></Field>
              </td>
            </tr>
            {editable && (
              <>
                <tr>
                  <td colSpan={2} style={{ fontWeight: 'bold' }}>
                    Configuration
                  </td>
                </tr>
                <tr>
                  <td>Contribution par défaut</td>
                  <td>
                    <Field
                      control={control}
                      type="select"
                      options={constants.contribution}
                      name="config.default_contribution"
                      editable={editable}
                    ></Field>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        {editable && (
          <Field
            control={control}
            type="textarea"
            style={{ flex: 1, margin: 10 }}
            name="note"
            editable={true}
          ></Field>
        )}
      </div>

      <h3>Enfants</h3>
      <table style={{ maxWidth: 1200 }}>
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
                <Field
                  control={control}
                  type="date"
                  name={`children.${index}.birthDate`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
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
            <Field
              control={control}
              type="select"
              options={constants.boolean}
              name="calcul_interets"
              editable={editable}
            ></Field>
          </label>
        </div>
      )}
    </form>
  )
}

export default InfoForm
