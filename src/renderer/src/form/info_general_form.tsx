import constants from '@renderer/constants'
import Field from '@renderer/generic/field'
import TextItem from '@renderer/generic/textItem'
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
              <TextItem path="info_general.name_victime" tag="td" />
              <td>
                <Field control={control} name="nom_victime" editable={editable}>
                  {(props) => <input style={{ width: 200 }} {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="common.sexe" tag="td" />
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
              <TextItem path="common.date_accident" tag="td" />
              <td>
                <Field control={control} type="date" name="date_accident" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="common.date_naissance" tag="td" />
              <td>
                <Field control={control} type="date" name="date_naissance" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="common.date_death" tag="td" />
              <td>
                <Field control={control} type="date" name="date_death" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="common.date_consolidation" tag="td" />
              <td>
                <Field control={control} type="date" name="date_consolidation" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
            </tr>
            <tr>
              <TextItem path="info_general.situation_conjugale" tag="td" />
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
              <TextItem path="info_general.statut_professionnel" tag="td" />
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
                  <TextItem
                    path="info_general.configuration"
                    colspan={2}
                    style={{ fontWeight: 'bold' }}
                    tag="td"
                  />
                </tr>
                <tr>
                  <TextItem path="info_general.default_contribution" tag="td" />
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
                <tr>
                  <TextItem path="info_general.calculate_interests" tag="td" />
                  <td>
                    <Field
                      control={control}
                      type="select"
                      options={constants.boolean}
                      name="calcul_interets"
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

      {(editable || childrenFields?.fields.length > 0) && (
        <>
          <TextItem path="common.children" tag="h3" />
          <table style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="common.name" tag="th" />
                <TextItem path="common.date_naissance" tag="th" />
                {editable && <th></th>}
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
                        <TextItem path="common.delete" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {editable && (
        <button type="button" onClick={addChild}>
          <TextItem path="info_general.add_child" />
        </button>
      )}

     
    </form>
  )
}

export default InfoForm
