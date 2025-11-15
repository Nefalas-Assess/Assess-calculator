import constants from '@renderer/constants'
import Field from '@renderer/generic/field'
import TextItem from '@renderer/generic/textItem'
import React, { useCallback, useMemo, useRef } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { useDebouncedEffect } from '@renderer/hooks/debounce'
import IncapacitePerma from '../incapacite_perma'
import EconomiqueSection from './economique'

export const InfoForm = ({ onSubmit, initialValues, editable = true }) => {
  const defaultFormValues = useMemo(() => {
    const baseValues = {
      statut: 'marié',
      profession: 'employe',
      calcul_interets: 'non',
      children: [],
      config: {
        prejudice_exh: 75,
        incapacite_perso: 32,
        hospitalisation: 7,
        incapacite_menagere: 30,
        person_charge: 10,
        effort_accrus: 30,
        km_vehicule: 0.42,
        km_other: 0.28
      },
      ip: {
        personnel: { method: 'forfait' },
        menagere: { method: 'forfait' },
        economique: { method: 'forfait' }
      },
      economique: {
        burt: {},
        net: {}
      }
    }

    return {
      ...baseValues,
      ...initialValues,
      config: {
        ...baseValues.config,
        ...(initialValues?.config || {})
      },
      ip: {
        ...baseValues.ip,
        ...(initialValues?.ip || {}),
        personnel: {
          ...baseValues.ip.personnel,
          ...(initialValues?.ip?.personnel || {})
        },
        menagere: {
          ...baseValues.ip.menagere,
          ...(initialValues?.ip?.menagere || {})
        },
        economique: {
          ...baseValues.ip.economique,
          ...(initialValues?.ip?.economique || {})
        }
      },
      economique: {
        ...baseValues.economique,
        ...(initialValues?.economique || {})
      }
    }
  }, [initialValues])

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: defaultFormValues
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

  const ipValues = useWatch({
    control,
    name: 'ip'
  })

  const economiqueValues = useWatch({
    control,
    name: 'economique'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  const previousValuesRef = useRef({})

  useDebouncedEffect(
    () => {
      const valuesChanged =
        JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
        JSON.stringify(childrenValues) !== JSON.stringify(previousValuesRef.current?.children) ||
        JSON.stringify(configValues) !== JSON.stringify(previousValuesRef.current?.config) ||
        JSON.stringify(ipValues) !== JSON.stringify(previousValuesRef.current?.ip) ||
        JSON.stringify(economiqueValues) !== JSON.stringify(previousValuesRef.current?.economique)

      // Si des valeurs ont changé, soumettre le formulaire
      if (valuesChanged) {
        // Éviter de soumettre si aucune modification réelle
        previousValuesRef.current = {
          formValues,
          children: childrenValues,
          config: configValues,
          ip: ipValues,
          economique: economiqueValues
        }

        handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
      }
    },
    [
      formValues,
      childrenValues,
      configValues,
      ipValues,
      economiqueValues,
      submitForm,
      handleSubmit
    ],
    500
  )

  const addChild = () => {
    childrenFields.append({ name: '', birthDate: '' }) // Nouveau champ enfant
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex' }}>
        <table id="infogTable" className={editable ? 'main-table' : ''}>
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
              <TextItem path="common.date_naissance" tag="td" />
              <td>
                <Field control={control} type="date" name="date_naissance" editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
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
              <TextItem path="common.date_consolidation" tag="td" />
              <td>
                <Field control={control} type="date" name="date_consolidation" editable={editable}>
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
                    colSpan={2}
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
                <tr>
                  <TextItem path="info_general.default_payment_date" tag="td" />
                  <td>
                    <Field
                      control={control}
                      type="date"
                      name="config.date_paiement"
                      editable={editable}
                    >
                      {(props) => <input {...props} />}
                    </Field>
                  </td>
                </tr>
                <tr>
                  <IncapacitePerma control={control} formValues={formValues} editable={editable} />
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {(editable || childrenFields?.fields.length > 0) && (
        <>
          <TextItem path="common.children" tag="h3" />
          <table style={{ maxWidth: 1200, marginBottom: 0 }}>
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

      {editable && (
        <div style={{ marginTop: 20 }}>
          <TextItem path="info_general.indicative_table.title" tag="h3" />
          <table style={{ maxWidth: 600 }} className={editable ? 'main-table' : ''}>
            <tbody>
              <tr>
                <TextItem path="info_general.indicative_table.prejudice_exh_amount" tag="td" />
                <td>
                  <Field control={control} name="config.prejudice_exh" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.incapacite_perso" tag="td" />
                <td>
                  <Field control={control} name="config.incapacite_perso" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.hospitalisation" tag="td" />
                <td>
                  <Field control={control} name="config.hospitalisation" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.incapacite_menagere" tag="td" />
                <td>
                  <Field control={control} name="config.incapacite_menagere" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.person_charge" tag="td" />
                <td>
                  <Field control={control} name="config.person_charge" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.effort_accrus" tag="td" />
                <td>
                  <Field control={control} name="config.effort_accrus" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.km_vehicule" tag="td" />
                <td>
                  <Field control={control} name="config.km_vehicule" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
              <tr>
                <TextItem path="info_general.indicative_table.km_other" tag="td" />
                <td>
                  <Field control={control} name="config.km_other" editable={editable}>
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {editable && <EconomiqueSection control={control} editable={editable} setValue={setValue} />}

      {editable && (
        <div>
          <TextItem path="common.note" tag="h3" />
          <Field
            control={control}
            type="textarea"
            style={{
              flex: 1,
              marginTop: 10,
              width: '100%',
              minHeight: 200
            }}
            name="note"
            editable={true}
          ></Field>
        </div>
      )}
    </form>
  )
}

export default InfoForm
