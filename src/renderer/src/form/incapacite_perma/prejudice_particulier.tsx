import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import TotalBox from '@renderer/generic/totalBox'

const PrejudiceParticuliersForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      coefficient_quantum_doloris: '',
      coefficient_prejudice_esthétique: ''
    }
  })

  const prejudiceSexuelField = useFieldArray({
    control,
    name: 'prejudice_sexuels' // Champs dynamiques pour les enfants
  })

  const prejudiceAgrementField = useFieldArray({
    control,
    name: 'prejudice_agrements'
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const prejudiceSexuelValues = useWatch({
    control,
    name: 'prejudice_sexuels'
  })

  const prejudiceAgrementValues = useWatch({
    control,
    name: 'prejudice_agrements'
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
      JSON.stringify(prejudiceSexuelValues) !==
      JSON.stringify(previousValuesRef.current?.prejudice_sexuels) ||
      JSON.stringify(prejudiceAgrementValues) !==
      JSON.stringify(previousValuesRef.current?.prejudice_agrements)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        prejudice_sexuels: prejudiceSexuelValues,
        prejudice_agrements: prejudiceAgrementValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, prejudiceSexuelValues, prejudiceAgrementValues, submitForm, handleSubmit])

  const getTotalWithCoef = useCallback(
    (coefficient) => {
      const coef = coefficient && parseInt(coefficient) - 1
      const age = data?.computed_info?.age_consolidation
      const keys = Object.keys(data_pp)
      const ageKey = findClosestIndex(keys, age)
      return Object.values(data_pp)[ageKey][coef]
    },
    [data]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Préjudices particuliers</h1>
      <h3>Quantum Doloris</h3>
      <table id="ipTable" style={{ width: 800 }}>
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Coefficient</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>
              <Field control={control} name={`coefficient_quantum_doloris`} editable={editable}>
                {(props) => (
                  <select {...props}>
                    <option value="" disabled>
                      Select
                    </option>
                    <option value={1}>1/7</option>
                    <option value={2}>2/7</option>
                    <option value={3}>3/7</option>
                    <option value={4}>4/7</option>
                    <option value={5}>5/7</option>
                    <option value={6}>6/7</option>
                    <option value={7}>7/7</option>
                  </select>
                )}
              </Field>
            </td>
            <td>
              <Money value={getTotalWithCoef(formValues?.coefficient_quantum_doloris)} />
            </td>
            <td className="int">
              <Field
                control={control}
                type="date"
                name={`date_paiement_quantum_doloris`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Money
                value={
                  getDays({
                    start: data?.general_info?.date_consolidation,
                    end: formValues?.date_paiement_quantum_doloris
                  }) *
                  getTotalWithCoef(formValues?.coefficient_quantum_doloris || 0) *
                  (data?.computed_info?.rate / 365)
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Préjudice Esthétique</h3>
      <table id="ipTable" style={{ width: 800 }}>
        <thead>
          <tr>
            <th>Âge consolidation</th>
            <th>Coefficient</th>
            <th>Total</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data?.computed_info?.age_consolidation}</td>
            <td>
              <Field
                control={control}
                name={`coefficient_prejudice_esthétique`}
                editable={editable}
              >
                {(props) => (
                  <select {...props}>
                    <option value="" disabled>
                      Select
                    </option>
                    <option value={1}>1/7</option>
                    <option value={2}>2/7</option>
                    <option value={3}>3/7</option>
                    <option value={4}>4/7</option>
                    <option value={5}>5/7</option>
                    <option value={6}>6/7</option>
                    <option value={7}>7/7</option>
                  </select>
                )}
              </Field>
            </td>
            <td>
              <Money value={getTotalWithCoef(formValues?.coefficient_prejudice_esthétique)} />
            </td>
            <td className="int">
              <Field
                control={control}
                name={`date_paiement_prejudice_esthétique`}
                editable={editable}
                type="date"
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={getTotalWithCoef(formValues?.coefficient_prejudice_esthétique || 0)}
                start={data?.general_info?.date_consolidation}
                end={formValues?.date_paiement_prejudice_esthétique}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Préjudice Sexuel</h3>
      <table style={{ width: 800 }}>
        <thead>
          <tr>
            <th>Indemnités/Frais</th>
            <th>Payé</th>
            <th>Montant</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {prejudiceSexuelField?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <Field
                  control={control}
                  name={`prejudice_sexuels.${index}.indemnite`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`prejudice_sexuels.${index}.paid`}
                  editable={editable}
                  type="select"
                  options={constants.boolean}
                ></Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`prejudice_sexuels.${index}.amount`}
                  editable={editable}
                  type="number"
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Field
                  control={control}
                  name={`prejudice_sexuels.${index}.date_paiement`}
                  editable={editable}
                  type="date"
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Interest
                  amount={formValues?.prejudice_sexuels?.[index]?.amount}
                  start={data?.general_info?.date_consolidation}
                  end={formValues?.prejudice_sexuels?.[index]?.date_paiement}
                />
              </td>
              {editable && (
                <td>
                  <button type="button" onClick={() => prejudiceSexuelField.remove(index)}>
                    Supprimer
                  </button>
                </td>
              )}
              {/* // Utilisé pour la total box mais caché pour le user */}
              <td className="hide">
                <Money value={formValues?.prejudice_sexuels?.[index]?.amount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={() => prejudiceSexuelField?.append({ paid: true })}>
          Ajouter une ligne
        </button>
      )}

      <h3>Préjudice d'Agrément</h3>
      <table style={{ width: 800 }}>
        <thead>
          <tr>
            <th>Indemnités/Frais</th>
            <th>Payé</th>
            <th>Montant</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {prejudiceAgrementField?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <Field
                  control={control}
                  name={`prejudice_agrements.${index}.indemnite`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`prejudice_agrements.${index}.paid`}
                  editable={editable}
                  type="select"
                  options={constants.boolean}
                ></Field>
              </td>
              <td>
                <Field
                  control={control}
                  name={`prejudice_agrements.${index}.amount`}
                  editable={editable}
                  type="number"
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Field
                  control={control}
                  name={`prejudice_agrements.${index}.date_paiement`}
                  editable={editable}
                  type="date"
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Interest
                  amount={formValues?.prejudice_agrements?.[index]?.amount}
                  start={data?.general_info?.date_consolidation}
                  end={formValues?.prejudice_agrements?.[index]?.date_paiement}
                />
              </td>
              {editable && (
                <td>
                  <button type="button" onClick={() => prejudiceAgrementField.remove(index)}>
                    Supprimer
                  </button>
                </td>
              )}
              {/* // Utilisé pour la total box mais caché pour le user */}
              <td className="hide">
                <Money value={formValues?.prejudice_agrements?.[index]?.amount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={() => prejudiceAgrementField?.append({ paid: true })}>
          Ajouter une ligne
        </button>
      )}
    </form>
  )
}

export default PrejudiceParticuliersForm
