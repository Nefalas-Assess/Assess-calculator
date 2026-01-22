import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import constants from '@renderer/constants'
import TextItem from '@renderer/generic/textItem'
import Field from '@renderer/generic/field'
import Money from '@renderer/generic/money'

const IndemniteJournaliere = {
  elementary: 6,
  secondary: 12,
  superior: 17
}

const IndemniteAnnuelle = {
  elementary: 500,
  secondary: 1500,
  superior: 3500
}

const PrejudiceScolaireForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues || {}
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const periodsValues = useWatch({
    control,
    name: 'periods'
  })

  const lostYearValues = useWatch({
    control,
    name: 'lost_year'
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
      JSON.stringify(periodsValues) !== JSON.stringify(previousValuesRef.current?.periods) ||
      JSON.stringify(lostYearValues) !== JSON.stringify(previousValuesRef.current?.lost_year)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        periods: periodsValues,
        lost_year: lostYearValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, periodsValues, lostYearValues, submitForm, handleSubmit])

  const getTotalAmount = useCallback((values, days) => {
    return {
      value: (
        parseInt(days || 0) *
        parseFloat(values?.amount || 0) *
        parseFloat((values?.pourcentage || 0) / 100) *
        (parseInt(values?.coefficient || 0) / 7)
      ).toFixed(2),
      tooltip: (
        <math>
          <mn>{parseInt(days || 0)}</mn>
          <mo>x</mo>
          <mn>{parseFloat(values?.amount || 0)}</mn>
          <mo>x</mo>
          <mfrac>
            <mn>{parseFloat(values?.pourcentage || 0)}</mn>
            <mn>100</mn>
          </mfrac>
          <mo>x</mo>
          <mfrac>
            <mn>{parseInt(values?.coefficient || 0)}</mn>
            <mn>7</mn>
          </mfrac>
        </math>
      )
    }
  }, [])

  const periodsColumns = [
    {
      header: '%',
      key: 'pourcentage',
      type: 'number',
      width: 50,
      props: { style: { width: 50 } }
    },
    { header: 'common.start', key: 'start', type: 'date', width: 140 },
    { header: 'common.end', key: 'end', type: 'date', width: 140 },
    {
      header: 'prejudice_scolaire.type',
      key: 'type',
      type: 'select',
      options: constants.prejudice_scolaire_indemnite_journaliere
    },
    {
      header: 'prejudice_scolaire.coefficient',
      key: 'coefficient',
      type: 'select',
      width: 65,
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: '7' }
      ]
    },
    { header: 'common.total', key: 'total', type: 'calculated' },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interest',
      type: 'interest',
      median: true,
      className: 'int'
    }
  ]

  const handleLostYearTypeChange = useCallback(
    (value, rowIndex) => {
      const newAmount = IndemniteAnnuelle[value]
      if (newAmount) {
        setValue(`lost_year.${rowIndex}.amount`, newAmount)
      }
    },
    [setValue]
  )

  const lostYearColumns = [
    {
      header: 'prejudice_scolaire.type',
      key: 'type',
      type: 'select',
      options: constants.prejudice_scolaire_indemnite_journaliere,
      onChange: handleLostYearTypeChange
    },
    {
      header: 'common.amount',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <div className="money" style={{ display: 'none' }}>
          {e?.amount}
        </div>
      )
    }
  ]

  const addRowDefaults = useMemo(() => {
    const defaultValues = {
      coefficient: 5,
      date_paiement: generalInfo?.config?.date_paiement
    }

    return defaultValues
  }, [formValues, generalInfo])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        columns={periodsColumns}
        control={control}
        name="periods"
        base="prejudice_scolaire"
        formValues={formValues}
        editable={editable}
        calculateTotal={getTotalAmount}
        addRowDefaults={addRowDefaults}
      />

      <DynamicTable
        title="prejudice_scolaire.lost_year"
        columns={lostYearColumns}
        control={control}
        name="lost_year"
        base="prejudice_scolaire"
        formValues={formValues}
        editable={editable}
      />

      <table style={{ maxWidth: 1200 }}>
        <tr>
          <TextItem path="prejudice_scolaire.location" tag="td" />
          <td>
            <Field control={control} type="number" name={`location`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
            <div className="hide">
              <Money value={formValues?.location} />
            </div>
          </td>
        </tr>
        <tr>
          <TextItem path="prejudice_scolaire.moral_damage" tag="td" />
          <td>
            <Field control={control} type="checkbox" name={`moral_damage`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
            <div className="hide">
              <Money value={formValues?.moral_damage ? 3000 : 0} />
            </div>
          </td>
        </tr>
      </table>
      <TextItem path="prejudice_scolaire.job_loss" tag="h3" />
      <table style={{ maxWidth: 1200 }}>
        <tr>
          <TextItem path="prejudice_scolaire.job_loss_days" tag="td" />
          <TextItem path="prejudice_scolaire.job_loss_amount" tag="td" />
          <TextItem path="prejudice_scolaire.job_loss_total" tag="td" />
        </tr>
        <tr>
          <td>
            <Field control={control} type="number" name={`job_loss_days`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
          </td>
          <td>
            <Field control={control} type="number" name={`job_loss_amount`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
          </td>
          <td>
            <Money value={formValues?.job_loss_days * (formValues?.job_loss_amount / 365)} />
          </td>
        </tr>
      </table>
    </form>
  )
}

export default PrejudiceScolaireForm
