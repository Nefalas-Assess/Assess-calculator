import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex, getDays } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'

const PrejudiceParticuliersForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      coefficient_quantum_doloris: '',
      coefficient_prejudice_esthétique: ''
    }
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

  const prejudiceSexuelColumns = [
    { header: 'Indemnités/Frais', key: 'indemnite', type: 'text' },
    { header: 'Payé', key: 'paid', type: 'select', options: constants.boolean },
    {
      header: 'Montant',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <td className="hide">
          <Money value={e?.amount} />
        </td>
      )
    },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    {
      header: 'Intérêts',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: data?.general_info?.date_consolidation }
    }
  ]

  const prejudiceAgrementColumns = [
    { header: 'Indemnités/Frais', key: 'indemnite', type: 'text' },
    { header: 'Payé', key: 'paid', type: 'select', options: constants.boolean },
    {
      header: 'Montant',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <td className="hide">
          <Money value={e?.amount} />
        </td>
      )
    },
    { header: 'Date du paiement', key: 'date_paiement', type: 'date', className: 'int' },
    {
      header: 'Intérêts',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: data?.general_info?.date_consolidation }
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Préjudices particuliers</h1>
      <h3>Quantum Doloris</h3>
      <table id="ipTable" style={{ maxWidth: 1200 }}>
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
              <Interest
                start={data?.general_info?.date_consolidation}
                end={formValues?.date_paiement_quantum_doloris}
                amount={getTotalWithCoef(formValues?.coefficient_quantum_doloris || 0)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Préjudice Esthétique</h3>
      <table id="ipTable" style={{ maxWidth: 1200 }}>
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

      <DynamicTable
        subtitle="Préjudice Sexuel"
        columns={prejudiceSexuelColumns}
        control={control}
        name="prejudice_sexuels"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />

      <DynamicTable
        subtitle="Préjudice d'Agrément"
        columns={prejudiceAgrementColumns}
        control={control}
        name="prejudice_agrements"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
    </form>
  )
}

export default PrejudiceParticuliersForm
