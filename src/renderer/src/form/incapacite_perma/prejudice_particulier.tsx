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
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'

const PrejudiceParticuliersForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const generalInfo = useGeneralInfo()

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      coefficient_quantum_doloris: '',
      coefficient_prejudice_esthétique: '',
      date_paiement_quantum_doloris: generalInfo?.config?.date_paiement,
      date_paiement_prejudice_esthétique: generalInfo?.config?.date_paiement
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
    {
      header: 'incapacite_perma.particulier.indemnite_name',
      key: 'indemnite',
      type: 'text'
    },
    {
      header: 'common.paid',
      key: 'paid',
      type: 'select',
      options: constants.boolean
    },
    {
      header: 'common.amount',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <td className="hide">
          <Money value={e?.amount} />
        </td>
      )
    },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: generalInfo?.date_consolidation }
    }
  ]

  const prejudiceAgrementColumns = [
    {
      header: 'incapacite_perma.particulier.indemnite_name',
      key: 'indemnite',
      type: 'text'
    },
    {
      header: 'common.paid',
      key: 'paid',
      type: 'select',
      options: constants.boolean
    },
    {
      header: 'common.amount',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <td className="hide">
          <Money value={e?.amount} />
        </td>
      )
    },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interests',
      type: 'interest',
      className: 'int',
      props: { start: generalInfo?.date_consolidation }
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextItem path="incapacite_perma.particulier.title" tag="h1" />
      <TextItem path="incapacite_perma.particulier.quantum_doloris" tag="h3" />
      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="common.age_consolidation" tag="th" />
            <TextItem path="common.coefficient" tag="th" />
            <TextItem path="common.total" tag="th" />
            <TextItem path="common.date_paiement" tag="th" className="int" />
            <TextItem path="common.interest" tag="th" className="int" />
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
                    <option value={2}>1.5/7</option>
                    <option value={3}>2/7</option>
                    <option value={4}>2.5/7</option>
                    <option value={5}>3/7</option>
                    <option value={6}>3.5/7</option>
                    <option value={7}>4/7</option>
                    <option value={8}>4.5/7</option>
                    <option value={9}>5/7</option>
                    <option value={10}>5.5/7</option>
                    <option value={11}>6/7</option>
                    <option value={12}>6.5/7</option>
                    <option value={13}>7/7</option>
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
                start={generalInfo?.date_consolidation}
                end={formValues?.date_paiement_quantum_doloris}
                amount={getTotalWithCoef(formValues?.coefficient_quantum_doloris || 0)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <TextItem path="incapacite_perma.particulier.esthetique" tag="h3" />
      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="common.age_consolidation" tag="th" />
            <TextItem path="common.coefficient" tag="th" />
            <TextItem path="common.total" tag="th" />
            <TextItem path="common.date_paiement" tag="th" className="int" />
            <TextItem path="common.interest" tag="th" className="int" />
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
                    <option value={2}>1.5/7</option>
                    <option value={3}>2/7</option>
                    <option value={4}>2.5/7</option>
                    <option value={5}>3/7</option>
                    <option value={6}>3.5/7</option>
                    <option value={7}>4/7</option>
                    <option value={8}>4.5/7</option>
                    <option value={9}>5/7</option>
                    <option value={10}>5.5/7</option>
                    <option value={11}>6/7</option>
                    <option value={12}>6.5/7</option>
                    <option value={13}>7/7</option>
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
                start={generalInfo?.date_consolidation}
                end={formValues?.date_paiement_prejudice_esthétique}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <DynamicTable
        subtitle="incapacite_perma.particulier.sexuel"
        columns={prejudiceSexuelColumns}
        control={control}
        name="prejudice_sexuels"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
        addRowDefaults={{
          date_paiement: generalInfo?.config?.date_paiement
        }}
      />

      <DynamicTable
        subtitle="incapacite_perma.particulier.agrement"
        columns={prejudiceAgrementColumns}
        control={control}
        name="prejudice_agrements"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
        addRowDefaults={{
          date_paiement: generalInfo?.config?.date_paiement
        }}
      />
    </form>
  )
}

export default PrejudiceParticuliersForm
