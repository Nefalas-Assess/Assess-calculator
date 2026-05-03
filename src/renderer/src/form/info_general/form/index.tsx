import constants from '@renderer/constants'
import Field from '@renderer/generic/field'
import TextItem from '@renderer/generic/textItem'
import { useCallback, useMemo } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import useAutosaveForm from '@renderer/hooks/autosaveForm'
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
      student: {
        lives_with_parents: false,
        leave_home_age: 25
      },
      economique: {
        burt: {},
        net: {}
      }
    }

    return {
      ...baseValues,
      ...initialValues,
      children: (initialValues?.children || []).map((child) => ({
        ...child,
        leaveHomeAge: child?.leaveHomeAge ?? 25
      })),
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
      student: {
        ...baseValues.student,
        ...(initialValues?.student || {})
      },
      economique: {
        ...baseValues.economique,
        ...(initialValues?.economique || {})
      }
    }
  }, [initialValues])

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: defaultFormValues
  })

  const childrenFields = useFieldArray({
    control,
    name: 'children' // Champs dynamiques pour les enfants
  })

  const formValues = useWatch({ control }) // Suivi de l'état de "calcul_interets"

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm, delay: 500 })

  const addChild = () => {
    childrenFields.append({ name: '', birthDate: '', leaveHomeAge: 25 }) // Nouveau champ enfant
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
            {formValues?.profession === 'étudiant' && (
              <>
                <tr>
                  <TextItem path="info_general.student_lives_with_parents" tag="td" />
                  <td>
                    <Field
                      control={control}
                      type="checkbox"
                      name="student.lives_with_parents"
                      editable={editable}
                    >
                      {() => null}
                    </Field>
                  </td>
                </tr>
                {formValues?.student?.lives_with_parents && (
                  <tr>
                    <TextItem path="info_general.student_leave_home_age" tag="td" />
                    <td>
                      <Field
                        control={control}
                        type="number"
                        name="student.leave_home_age"
                        editable={editable}
                      >
                        {(props) => (
                          <input type="number" min="0" step="1" style={{ width: 80 }} {...props} />
                        )}
                      </Field>
                    </td>
                  </tr>
                )}
              </>
            )}
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
                <TextItem path="common.leave_home_age" tag="th" />
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
                  <td>
                    <Field
                      control={control}
                      type="select"
                      options={constants.child_leave_home_age}
                      name={`children.${index}.leaveHomeAge`}
                      editable={editable}
                    ></Field>
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
